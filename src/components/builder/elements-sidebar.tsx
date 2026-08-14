'use client';

import { useDraggable } from '@dnd-kit/core';
import { Type, Image as ImageIcon, LayoutPanelTop, Clock, CalendarHeart, BookOpen, Images, Mail, MapPin, HeartHandshake, Minus } from 'lucide-react';
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

function DraggableElement({ type, label, icon: Icon }: { type: BlockType; label: string; icon: React.ElementType }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `widget-${type}` });
  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex w-full items-center gap-3 rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 hover:border-gray-400 hover:shadow-sm ${isDragging ? 'opacity-40' : 'cursor-grab'}`}
    >
      <Icon className="h-4 w-4 text-gray-500" />
      {label}
    </button>
  );
}

export default function ElementsSidebar() {
  const addBlock = useBuilderStore((s) => s.addBlock);

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-gray-200 bg-dashboard-surface">
      <div className="border-b border-gray-200 px-4 py-3">
        <h3 className="text-sm font-semibold">Elements</h3>
        <p className="text-xs text-gray-500">Seret ke kanvas atau klik untuk menambah</p>
      </div>

      <div className="flex-1 space-y-2 overflow-auto p-3">
        {ELEMENTS.map((el) => (
          <div key={el.type} onClick={() => addBlock(el.type)}>
            <DraggableElement type={el.type} label={el.label} icon={el.icon} />
          </div>
        ))}

        <div className="pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Templates</p>
          <div className="space-y-2">
            {['Hero + Mempelai', 'Galeri + Countdown', 'RSVP + Maps'].map((t) => (
              <button
                key={t}
                onClick={() => {}}
                className="flex w-full items-center gap-3 rounded-md border border-dashed border-gray-300 px-3 py-2.5 text-sm text-gray-600 hover:border-gray-400"
              >
                <ImageIcon className="h-4 w-4 text-gray-400" />
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}