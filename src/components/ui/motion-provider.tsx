'use client';

import { MotionConfig } from 'framer-motion';

/**
 * Pembungkus global framer-motion — menghormati preferensi "kurangi gerak"
 * pengguna (`prefers-reduced-motion: reduce`) lewat `reducedMotion="user"`.
 */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}