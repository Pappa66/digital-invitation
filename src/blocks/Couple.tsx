import type { CoupleProps } from '@/puck/types';
import { BlockShell } from './shell';

export default function Couple({ title, groom, groomParents, bride, brideParents, position, entrance }: CoupleProps) {
  return (
    <BlockShell position={position} entrance={entrance}>
      <section className="bg-[#fbf7f1] px-6 py-14 text-center text-[#4a4036]">
        <h2 className="font-heading text-2xl">{title}</h2>
        <div className="mt-8 flex flex-col items-center gap-8 sm:flex-row sm:justify-center sm:gap-12">
          <div className="flex flex-col items-center">
            <div className="h-24 w-24 rounded-full bg-[#e7ddcc]" />
            <p className="mt-3 font-heading text-xl">{groom}</p>
            {groomParents ? <p className="mt-1 text-xs opacity-70">{groomParents}</p> : null}
          </div>
          <span className="font-script text-2xl opacity-60">&amp;</span>
          <div className="flex flex-col items-center">
            <div className="h-24 w-24 rounded-full bg-[#e7ddcc]" />
            <p className="mt-3 font-heading text-xl">{bride}</p>
            {brideParents ? <p className="mt-1 text-xs opacity-70">{brideParents}</p> : null}
          </div>
        </div>
      </section>
    </BlockShell>
  );
}
