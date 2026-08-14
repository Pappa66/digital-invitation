'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { parseYouTube } from '@/components/guest/music-player';

function fmt(sec: number) {
  if (!isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

interface MusicPreviewProps {
  url: string;
  offsetSec: number;
  onOffsetChange: (sec: number) => void;
}

/**
 * Mini player di builder untuk mendengar & memilih bagian musik.
 * - MP3: play/pause + slider durasi; menggeser slider menetapkan "mulai detik ke-"
 *   (offset) yang dipakai saat undangan tampil.
 * - YouTube: pratinjau embed (play manual) + slider offset (pilihan mulai).
 */
export default function MusicPreview({ url, offsetSec, onOffsetChange }: MusicPreviewProps) {
  const yt = parseYouTube(url);
  const isAudio = !yt && url.trim().length > 0;

  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [dur, setDur] = useState(0);
  const [cur, setCur] = useState(0);
  const [ytPlay, setYtPlay] = useState(false);

  useEffect(() => {
    setPlaying(false);
    setDur(0);
    setCur(0);
    setYtPlay(false);
  }, [url]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.play().catch(() => setPlaying(false));
    } else {
      a.pause();
    }
  }, [playing, url]);

  const seek = (v: number) => {
    const a = audioRef.current;
    const next = Math.max(0, Math.round(v));
    onOffsetChange(next);
    setCur(next);
    if (a) {
      a.currentTime = next;
      if (playing) a.play().catch(() => {});
    }
  };

  const onPlayPause = () => {
    if (!isAudio) {
      // YouTube: remount iframe dengan autoplay=1 (klik = interaksi → diizinkan).
      if (ytPlay) {
        setYtPlay(false);
      } else {
        setYtPlay(true);
        setPlaying(true);
      }
      return;
    }
    if (!playing) {
      const a = audioRef.current;
      if (a) a.currentTime = offsetSec;
    }
    setPlaying((p) => !p);
  };

  const max = isAudio ? Math.max(dur, 1) : Math.max(300, offsetSec + 30);

  return (
    <div className="space-y-2 rounded-lg border border-[#e0d6c2] bg-[#faf7f2] p-2.5">
      {isAudio && <audio ref={audioRef} src={url} preload="metadata" onLoadedMetadata={(e) => setDur(e.currentTarget.duration)} onTimeUpdate={(e) => setCur(e.currentTarget.currentTime)} onEnded={() => setPlaying(false)} />}

      <div className="flex items-center gap-2">
        <button
          onClick={onPlayPause}
          disabled={!isAudio && !yt}
          title={isAudio ? (playing ? 'Jeda' : 'Putar') : yt ? (ytPlay ? 'Jeda' : 'Putar') : 'Tidak ada musik'}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#141414]/90 text-white transition hover:bg-[#c9a45c] disabled:opacity-40"
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>

        <input
          type="range"
          min={0}
          max={max}
          step={1}
          value={Math.min(offsetSec, max)}
          onChange={(e) => seek(Number(e.target.value))}
          className="h-1.5 flex-1 cursor-pointer accent-[#c9a45c]"
        />
        <span className="w-14 shrink-0 text-right text-[11px] tabular-nums text-[#8a7a66]">
          {playing ? fmt(cur) : fmt(offsetSec)}
        </span>
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#8a7a66]">
        <span>Mulai dari detik ke-{offsetSec} (geser slider untuk memilih)</span>
        {isAudio && dur > 0 && <span>durasi {fmt(dur)}</span>}
      </div>

      {yt && (
        <iframe
          title="Pratinjau musik (YouTube)"
          key={ytPlay ? `playing-${yt.id}-${offsetSec}` : `idle-${yt.id}`}
          src={`https://www.youtube-nocookie.com/embed/${yt.id}?playsinline=1&rel=0${ytPlay ? `&autoplay=1&start=${yt.t + offsetSec}` : ''}`}
          allow="autoplay; encrypted-media"
          className="aspect-video w-full rounded-md"
        />
      )}
    </div>
  );
}