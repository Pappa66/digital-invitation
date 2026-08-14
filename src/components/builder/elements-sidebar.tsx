'use client';

import { useDraggable } from '@dnd-kit/core';
import { Image as ImageIcon, LayoutPanelTop, Clock, CalendarHeart, BookOpen, Images, Mail, MapPin, HeartHandshake, Minus, GripVertical, Type, Gift, ListChecks } from 'lucide-react';
import type { BlockType } from '@/lib/types';
import { useBuilderStore } from '@/store/builder-store';

const ELEMENTS: { type: BlockType; label: string; icon: React.ElementType }[] = [
  { type: 'Hero', label: 'Hero', icon: LayoutPanelTop },
  { type: 'Couple', label: 'Mempelai', icon: HeartHandshake },
  { type: 'Countdown', label: 'Countdown', icon: Clock },
  { type: 'EventDetail', label: 'Detail Acara', icon: CalendarHeart },
  { type: 'Story', label: 'Our Story', icon: BookOpen },
  { type: 'Gallery', label: 'Galeri', icon: Images },
  { type: 'GiftList', label: 'Daftar Kado', icon: ListChecks },
  { type: 'RSVP', label: 'RSVP', icon: Mail },
  { type: 'Envelope', label: 'Amplop Online', icon: Gift },
  { type: 'Maps', label: 'Maps', icon: MapPin },
  { type: 'Text', label: 'Teks Box', icon: Type },
  { type: 'Photo', label: 'Foto / Gambar', icon: ImageIcon },
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
      className={`group flex w-full items-center gap-3 rounded-md border bg-white px-3 py-2.5 text-sm transition-colors ${
        isDragging
          ? 'border-[#c9a45c] bg-[#c9a45c]/10 text-[#8a6d2f] opacity-40'
          : 'cursor-grab border-[#e0d6c2] text-[#4a443c] hover:border-[#c9a45c] hover:bg-[#fffdf8] active:cursor-grabbing'
      }`}
    >
      <Icon className="h-4 w-4 shrink-0 text-[#8a7a66] transition-colors group-hover:text-[#c9a45c]" />
      <span className="truncate">{label}</span>
      <GripVertical className="ml-auto h-3.5 w-3.5 shrink-0 text-[#c9b896] opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}

export default function ElementsSidebar() {
  const addBlock = useBuilderStore((s) => s.addBlock);

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-[#e7ddcc] bg-white">
      <div className="border-b border-[#e7ddcc] px-4 py-3">
        <h3 className="text-sm font-semibold text-[#2b2620]">Elements</h3>
        <p className="mt-0.5 text-xs text-[#8a7a66]">Seret ke kanvas atau klik untuk menambah</p>
      </div>

      <div className="flex-1 space-y-2 overflow-auto p-3">
        {ELEMENTS.map((el) => (
          <div key={el.type} onClick={() => addBlock(el.type)}>
            <DraggableElement type={el.type} label={el.label} icon={el.icon} />
          </div>
        ))}

        <div className="pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#b39a65]">Templates</p>
          <div className="space-y-2">
            {QUICK_STARTS.map((t) => (
              <button
                key={t.label}
                onClick={() => {
                  t.blocks.forEach((b) => addBlock(b));
                }}
                className="flex w-full items-center gap-3 rounded-md border border-dashed border-[#e0d6c2] px-3 py-2.5 text-sm text-[#6b5f4d] transition-colors hover:border-[#c9a45c] hover:bg-[#faf7f2] hover:text-[#8a6d2f]"
              >
                <ImageIcon className="h-4 w-4 text-[#b39a65]" />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}