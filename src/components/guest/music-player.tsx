'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Music, Pause, Play } from 'lucide-react';
import type { Settings } from '@/lib/types';

/** Ekstrak video id & waktu mulai dari tautan YouTube (youtube.com / youtu.be / shorts). */
export function parseYouTube(url: string): { id: string; t: number } | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{6,})/);
  if (!m) return null;
  const t = parseInt(url.match(/[?&]t=(\d+)/)?.[1] ?? '0', 10) || 0;
  return { id: m[1], t };
}

declare global {
  interface Window {
    YT?: {
      Player: new (el: string | HTMLElement, opts: Record<string, unknown>) => YTPlayer;
      PlayerState: { PLAYING: number };
    };
    onYouTubeIframeAPIReady?: () => void;
    __ytReadyFns?: Array<() => void>;
  }
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
}

/** Pastikan skrip IFrame Player API termuat; true bila API sudah siap dipakai. */
function ensureYtApi(): boolean {
  if (typeof window === 'undefined' || window.YT?.Player) return true;
  if (!window.__ytReadyFns) window.__ytReadyFns = [];
  if (!document.getElementById('__yt-iframe-api')) {
    const tag = document.createElement('script');
    tag.id = '__yt-iframe-api';
    tag.src = 'https://www.youtube.com/iframe_api';
    window.onYouTubeIframeAPIReady = () => {
      const fns = window.__ytReadyFns ?? [];
      window.__ytReadyFns = [];
      fns.forEach((fn) => fn());
    };
    document.head.appendChild(tag);
  }
  return false;
}

/**
 * Registrasi "mulai pada interaksi pertama" — browser memblokir autoplay
 * bersuara sampai pengguna menyentuh/mengklik/menggulir halaman minimal sekali.
 * Dipakai untuk menghidupkan musik otomatis saat halaman dibuka.
 */
function onFirstInteraction(cb: () => void) {
  const events = ['pointerdown', 'touchstart', 'keydown', 'scroll', 'wheel'] as const;
  const done = () => {
    events.forEach((e) => window.removeEventListener(e, done));
    cb();
  };
  events.forEach((e) => window.addEventListener(e, done));
  return () => events.forEach((e) => window.removeEventListener(e, done));
}

interface MusicPlayerProps {
  settings: Settings;
}

/**
 * Pemutar musik latar: mendukung MP3 dan tautan YouTube.
 * - Autoplay: browser memblokir audio tanpa interaksi, jadi musik otomatis
 *   mulai di sentuhan/klik pertama pengguna di halaman (kebijakan umum
 *   undangan digital). Tombol kecil tetap tersedia untuk play/pause manual.
 * - YouTube: IFrame Player API agar Play/Pause manual berfungsi sungguhan.
 * - Mendukung mulai dari detik ke-N (offset) dan mulai saat section tampil.
 */
export default function MusicPlayer({ settings }: MusicPlayerProps) {
  const url = settings.music_url?.trim() ?? '';
  const autoplay = settings.music_autoplay ?? true;
  const offset = Math.max(0, Number(settings.music_offset_sec) || 0);
  const onSection = settings.music_on_section?.trim() ?? '';

  const [armed, setArmed] = useState(!onSection);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const playerReadyRef = useRef(false);
  const startRequestedRef = useRef(false);
  const hostId = useId().replace(/:/g, '');

  const yt = parseYouTube(url);
  const isAudio = !yt && url.length > 0;
  const wantStart = offset + (yt?.t ?? 0);

  // Arm saat section trigger terlihat.
  useEffect(() => {
    if (!onSection || armed) return;
    const els = Array.from(document.querySelectorAll(`[data-block-type="${onSection}"]`));
    if (els.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setArmed(true);
          obs.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [onSection, armed]);

  const startAudio = useCallback(() => {
    const a = audioRef.current;
    if (!a || !isAudio) return;
    a.currentTime = wantStart;
    const p = a.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
    setPlaying(true);
  }, [isAudio, wantStart, setPlaying]);

  const startYt = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    player.seekTo(wantStart, true);
    player.playVideo();
  }, [wantStart]);

  // Mulai musik: HANYA dari tombol "Buka Undangan" (event invite-opened).
  // Tidak ada fallback onFirstInteraction — musik TIDAK boleh jalan sebelum user klik Buka Undangan.
  useEffect(() => {
    if (!autoplay || !armed) return;
    if (startRequestedRef.current) return;
    startRequestedRef.current = true;

    const kick = () => {
      if (isAudio) startAudio();
      else if (yt) {
        if (playerReadyRef.current) startYt();
        else {
          const retry = () => {
            if (playerReadyRef.current) startYt();
            window.removeEventListener('yt-ready', retry);
          };
          window.addEventListener('yt-ready', retry);
        }
      }
    };

    // Hanya mulai dari tombol "Buka Undangan"
    window.addEventListener('invite-opened', kick);
    return () => {
      window.removeEventListener('invite-opened', kick);
    };
  }, [autoplay, armed, isAudio, yt, startAudio, startYt]);

  // Inisialisasi YouTube IFrame Player API.
  useEffect(() => {
    if (!yt?.id) return;
    let cancelled = false;
    const videoId = yt.id;
    function mount() {
      if (cancelled || !window.YT?.Player) return;
      if (playerRef.current) return;
      const player = new window.YT.Player(`yt-host-${hostId}`, {
        videoId,
        playerVars: {
          start: wantStart,
          playsinline: 1,
          rel: 0,
          enablejsapi: 1
        },
        events: {
          onReady: () => {
            playerReadyRef.current = true;
            window.dispatchEvent(new Event('yt-ready'));
            if (startRequestedRef.current) startYt();
          },
          onStateChange: (e: { data: number }) => {
            setPlaying(e.data === window.YT!.PlayerState.PLAYING);
          }
        }
      });
      playerRef.current = player;
    }
    if (ensureYtApi()) {
      mount();
    } else {
      (window.__ytReadyFns ??= []).push(mount);
    }
    return () => {
      cancelled = true;
    };
  }, [yt?.id, hostId, wantStart, startYt]);

  // Sinkronkan tombol manual untuk MP3 (audio element sendiri yang mengatur state).
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !isAudio) return;
    const onPause = () => {
      if (a.ended) return;
      setPlaying(false);
    };
    const onPlay = () => setPlaying(true);
    a.addEventListener('play', onPlay);
    a.addEventListener('pause', onPause);
    return () => {
      a.removeEventListener('play', onPlay);
      a.removeEventListener('pause', onPause);
    };
  }, [isAudio, url, setPlaying]);

  if (!url) return null;

  const toggle = () => {
    if (playing) {
      if (yt) {
        playerRef.current?.pauseVideo();
      } else {
        audioRef.current?.pause();
      }
    } else {
      if (yt) {
        startYt();
      } else {
        startAudio();
      }
    }
  };

  return (
    <>
      {isAudio && <audio ref={audioRef} src={url} preload="auto" loop />}
      {yt && (
        <div
          className="pointer-events-none fixed"
          style={{ position: 'fixed', top: -9999, width: 1, height: 1, opacity: 0 }}
          aria-hidden="true"
        >
          <div id={`yt-host-${hostId}`} />
        </div>
      )}
      <div className="fixed bottom-5 left-5 z-[60]">
        <button
          onClick={toggle}
          aria-label={playing ? 'Jeda musik' : 'Putar musik'}
          aria-pressed={playing}
          title={playing ? 'Jeda musik' : 'Putar musik'}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground/90 text-background shadow-card backdrop-blur ring-1 ring-gold/40 transition-transform hover:scale-105 hover:bg-foreground active:scale-95"
        >
          {playing ? <Pause className="h-5 w-5" aria-hidden /> : <Play className="h-5 w-5" aria-hidden />}
        </button>
        {!armed && onSection && (
          <span className="mt-1.5 flex items-center gap-1 rounded-full bg-foreground/25 px-2.5 py-1 text-[10px] text-muted-foreground dark:bg-foreground/40">
            <Music className="h-3 w-3" aria-hidden /> musik mulai saat section muncul
          </span>
        )}
      </div>
    </>
  );
}