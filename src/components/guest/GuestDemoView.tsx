'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { CanvasData } from '@/lib/types';
import GuestRenderer from '@/components/guest/GuestRenderer';
import { demoGetPublished } from '@/lib/demo/demo-store';

interface GuestDemoViewProps {
  slug: string;
  title: string;
}

export default function GuestDemoView({ slug, title }: GuestDemoViewProps) {
  const searchParams = useSearchParams();
  const [canvas, setCanvas] = useState<CanvasData | null>(null);
  const [projectId, setProjectId] = useState('');
  const [missing, setMissing] = useState(false);
  const [greeting, setGreeting] = useState<string | undefined>(undefined);

  useEffect(() => {
    const allowDraft = searchParams.get('preview') === '1';
    const res = demoGetPublished(slug, { allowDraft });
    if (!res) {
      setMissing(true);
      return;
    }
    setCanvas(res.canvas);
    setProjectId(res.id);
    setGreeting(searchParams.get('to') ?? undefined);
  }, [slug, searchParams]);

  useEffect(() => {
    if (!canvas) return;
    const fonts = Array.from(new Set([canvas.theme.font_heading, canvas.theme.font_body]));
    const families = fonts.map((f) => `family=${encodeURIComponent(f)}`).join('&');
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [canvas]);

  if (missing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-sm text-gray-400">Undangan tidak ditemukan (belum di-publish).</p>
      </div>
    );
  }

  if (!canvas) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">
        Memuat...
      </div>
    );
  }

  return <GuestRenderer canvas={canvas} projectId={projectId} greetingName={greeting} />;
}