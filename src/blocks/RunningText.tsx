'use client';

import Marquee from 'react-fast-marquee';
import type { RunningTextProps } from '@/puck/types';
import { BlockShell } from './shell';

export default function RunningText({ text, speed = 40, separator = '✦', position, entrance, blockStyle }: RunningTextProps) {
  const content = `${text}  ${separator}  `;
  return (
    <BlockShell position={position} entrance={entrance} blockStyle={blockStyle}>
      <div className="w-full overflow-hidden border-y border-current/10 bg-[var(--color-primary,#3b5ba5)] py-3 text-white">
        <Marquee speed={Number(speed) || 40} autoFill>
          <span className="px-4 text-sm uppercase tracking-[0.25em]" style={{ fontFamily: 'var(--font-heading)' }}>
            {content}
          </span>
        </Marquee>
      </div>
    </BlockShell>
  );
}
