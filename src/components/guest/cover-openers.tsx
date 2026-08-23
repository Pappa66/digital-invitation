'use client';

import { useEffect } from 'react';

interface OpenerProps {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  /** Dipanggil setelah animasi pembuka selesai (untuk menyingkap undangan). */
  onDone: () => void;
}

/** Semua opener langsung skip — tidak ada animasi entrance. */
function SkipOpener({ onDone }: OpenerProps) {
  useEffect(() => {
    onDone();
  }, [onDone]);
  return null;
}

export function BookOpener(props: OpenerProps) {
  return <SkipOpener {...props} />;
}

export function FilmRollOpener(props: OpenerProps) {
  return <SkipOpener {...props} />;
}

export function OldTvOpener(props: OpenerProps) {
  return <SkipOpener {...props} />;
}

export function NewspaperOpener(props: OpenerProps) {
  return <SkipOpener {...props} />;
}

export function MandalaOpener(props: OpenerProps) {
  return <SkipOpener {...props} />;
}

export function LanternOpener(props: OpenerProps) {
  return <SkipOpener {...props} />;
}
