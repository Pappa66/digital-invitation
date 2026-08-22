'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Lightweight scroll-triggered reveal animation using IntersectionObserver.
 * Returns a ref to attach to the element and whether it's visible.
 * No framer-motion dependency — pure CSS class toggling.
 */
export function useScrollReveal(opts?: { threshold?: number; rootMargin?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: opts?.threshold ?? 0.12, rootMargin: opts?.rootMargin ?? '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [opts?.threshold, opts?.rootMargin]);

  return { ref, visible };
}
