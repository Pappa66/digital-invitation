'use client';

import { useEffect } from 'react';
import type { CanvasData } from '@/lib/types';
import { validateCanvasData } from '@/lib/validations';
import GuestRenderer from '@/components/guest/GuestRenderer';

interface GuestViewProps {
  projectId: string;
  canvas: Record<string, unknown>;
  /** Nama tamu dari query ?to= (opsional). */
  to?: string;
}

export default function GuestView({ projectId, canvas, to }: GuestViewProps) {
  const validated = validateCanvasData(canvas);
  const data = validated ?? (canvas as unknown as CanvasData);

  useEffect(() => {
    const fonts = Array.from(new Set([data.theme.font_heading, data.theme.font_body]));
    const families = fonts.map((f) => `family=${encodeURIComponent(f)}`).join('&');
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [data.theme.font_heading, data.theme.font_body]);

  return <GuestRenderer canvas={data} projectId={projectId} greetingName={to} />;
}