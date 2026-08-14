'use client';

import { useEffect, useRef, useState } from 'react';
import { Music, Pause, Play } from 'lucide-react';
import type { Settings } from '@/lib/types';

/** Ekstrak video id & waktu mulai dari tautan YouTube (youtube.com / youtu.be). */
export function parseYouTube(url: string): { id: string; t: number } | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{6,})/);
  if (!m) return null;
  const t = parseInt(url.match(/[?&]t=(\d+)/)?.[1] ?? '0', 10) || 0;
  return { id: m[1], t };
}

interface MusicPlayerProps {
  settings: Settings;
}

/**
 * Pemutar musik latar: mendukung MP3 dan tautan YouTube.
 * - Bisa putar otomatis saat halaman dibuka, atau saat pengunjung masuk section tertentu.
 * - Bisa mulai dari detik ke-N (offset).
 * Tombol kecil tetap muncul di kiri bawah untuk play/pause manual (browser kadang memblokir autoplay).
 */
export default function MusicPlayer({ settings }: MusicPlayerProps) {
  const url = settings.music_url?.trim() ?? '';
  // Dibandingkan true default agar perilaku lama (tanpa properti) tetap autoplay.
  const autoplay = settings.music_autoplay ?? true;
  const offset = Math.max(0, Number(settings.music_offset_sec) || 0);
  const onSection = settings.music_on_section?.trim() ?? '';

  const [armed, setArmed] = useState(!onSection);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

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

  const yt = parseYouTube(url);
  const isAudio = !yt && url.length > 0;

  // Autoplay saat armed.
  useEffect(() => {
    if (armed && yt) setPlaying(true);
  }, [armed, yt]);

  // Kontrol audio mp3.
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (isAudio && playing && armed) {
      a.currentTime = offset;
      a.play().catch(() => {
        /* autoplay diblokir — pengguna bisa klik tombol manual */
      });
    } else if (isAudio) {
      a.pause();
    }
    return () => {
      if (isAudio) a.pause();
    };
  }, [isAudio, playing, armed, offset, url]);

  if (!url) return null;

  const toggle = () => setPlaying((p) => !p);

  return (
    <>
      {isAudio && <audio ref={audioRef} src={url} preload="auto" loop />}
      {yt && (
        <iframe
          title="Musik latar (YouTube)"
          src={`https://www.youtube-nocookie.com/embed/${yt.id}?autoplay=1&start=${yt.t + offset}&playsinline=1&rel=0`}
          allow="autoplay"
          tabIndex={-1}
          aria-hidden="true"
          className="pointer-events-none fixed -left-[9999px] top-0 h-0 w-0 opacity-0"
          style={{ position: 'fixed', top: -9999 }}
        />
      )}
      <div className="fixed bottom-5 left-5 z-[60]">
        <button
          onClick={toggle}
          aria-label={playing ? 'Jeda musik' : 'Putar musik'}
          title={playing ? 'Jeda musik' : 'Putar musik'}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-900/80 text-white shadow-lg backdrop-blur transition hover:bg-gray-900"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        {!armed && onSection && (
          <span className="mt-1 flex items-center gap-1 text-[10px] text-gray-400">
            <Music className="h-3 w-3" /> musik mulai saat section muncul
          </span>
        )}
      </div>
    </>
  );
}