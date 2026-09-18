'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// lottie-web mengakses canvas → hanya di client, dimuat dinamis.
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

/** Memuat animasi Lottie dari URL JSON lalu memutarnya (loop). */
export default function LottiePlayer({ src, style }: { src: string; style?: React.CSSProperties }) {
  const [data, setData] = useState<object | null>(null);

  useEffect(() => {
    let active = true;
    fetch(src)
      .then((r) => r.json())
      .then((json) => {
        if (active) setData(json as object);
      })
      .catch(() => {
        /* gagal muat → biarkan kosong */
      });
    return () => {
      active = false;
    };
  }, [src]);

  if (!data) return null;
  return <Lottie animationData={data} loop autoplay style={style} />;
}
