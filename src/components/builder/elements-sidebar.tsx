'use client';

import { useDraggable } from '@dnd-kit/core';
import { Image as ImageIcon, LayoutPanelTop, Clock, CalendarHeart, BookOpen, Images, Mail, MapPin, HeartHandshake, Minus, GripVertical } from 'lucide-react';
import type { BlockType } from '@/lib/types';
import { useBuilderStore } from '@/store/builder-store';

const ELEMENTS: { type: BlockType; label: string; icon: React.ElementType }[] = [
  { type: 'Hero', label: 'Hero', icon: LayoutPanelTop },
  { type: 'Couple', label: 'Mempelai', icon: HeartHandshake },
  { type: 'Countdown', label: 'Countdown', icon: Clock },
  { type: 'EventDetail', label: 'Detail Acara', icon: CalendarHeart },
  { type: 'Story', label: 'Our Story', icon: BookOpen },
  { type: 'Gallery', label: 'Galeri', icon: Images },
  { type: 'RSVP', label: 'RSVP', icon: Mail },
  { type: 'Maps', label: 'Maps', icon: MapPin },
  { type: 'Divider', label: 'Pemisah', icon: Minus },
  { type: 'Thanks', label: 'Penutup', icon: HeartHandshake }
];

const QUICK_STARTS: { label: string; blocks: BlockType[] }[] = [
  { label: 'Hero + Mempelai', blocks: ['Hero', 'Couple'] },
  { label: 'Galeri + Countdown', blocks: ['Gallery', 'Countdown'] },
  { label: 'RSVP + Maps', blocks: ['RSVP', 'Maps'] }
];

function DraggableElement({ type, label, icon: Icon }: { type: BlockType; label: string; icon: React.ElementType }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `widget-${type}` });
  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`group flex w-full items-center gap-3 rounded-md border bg-[#171b23] px-3 py-2.5 text-sm transition-colors ${
        isDragging
          ? 'border-[#c9a45c] bg-[#c9a45c]/10 text-[#e8ddc6] opacity-40'
          : 'cursor-grab border-[#2a303c] text-[#c4c9d4] hover:border-[#3d4554] hover:bg-[#1d222b] active:cursor-grabbing'
      }`}
    >
      <Icon className="h-4 w-4 shrink-0 text-[#8b93a3] transition-colors group-hover:text-[#c9a45c]" />
      <span className="truncate">{label}</span>
      <GripVertical className="ml-auto h-3.5 w-3.5 shrink-0 text-[#565d6b] opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}

export default function ElementsSidebar() {
  const addBlock = useBuilderStore((s) => s.addBlock);

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-[#262b35] bg-[#11141a]">
      <div className="border-b border-[#262b35] px-4 py-3">
        <h3 className="text-sm font-semibold text-[#e8e6e1]">Elements</h3>
        <p className="mt-0.5 text-xs text-[#8b93a3]">Seret ke kanvas atau klik untuk menambah</p>
      </div>

      <div className="flex-1 space-y-2 overflow-auto p-3">
        {ELEMENTS.map((el) => (
          <div key={el.type} onClick={() => addBlock(el.type)}>
            <DraggableElement type={el.type} label={el.label} icon={el.icon} />
          </div>
        ))}

        <div className="pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#5a6272]">Templates</p>
          <div className="space-y-2">
            {QUICK_STARTS.map((t) => (
              <button
                key={t.label}
                onClick={() => {
                  t.blocks.forEach((b) => addBlock(b));
                }}
                className="flex w-full items-center gap-3 rounded-md border border-dashed border-[#2f3542] px-3 py-2.5 text-sm text-[#8b93a3] transition-colors hover:border-[#3d4554] hover:bg-[#171b23] hover:text-[#c4c9d4]"
              >
                <ImageIcon className="h-4 w-4 text-[#5a6272]" />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}