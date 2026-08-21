'use client';

import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import {
  Image as ImageIcon, LayoutPanelTop, Clock, CalendarHeart, BookOpen, Images,
  Mail, MapPin, HeartHandshake, Minus, GripVertical, Type, Gift, ListChecks,
  Quote as QuoteIcon, Radio, ChevronDown, ChevronRight, Sparkles, PenTool,
  Layout, Users, MessageSquare, Palette, MousePointerClick, Copy as CopyIcon
} from 'lucide-react';
import type { BlockType } from '@/lib/types';
import { useBuilderStore } from '@/store/builder-store';

interface BlockItem {
  type: BlockType;
  label: string;
  icon: React.ElementType;
  desc: string;
  variants?: { name: string; value: string }[];
  defaultVariant?: string;
  variantKey?: string;
  defaultProps?: Record<string, string>;
}

interface BlockCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  blocks: BlockItem[];
}

const BLOCK_CATEGORIES: BlockCategory[] = [
  {
    id: 'header',
    label: 'Header & Intro',
    icon: LayoutPanelTop,
    color: '#c9a45c',
    blocks: [
      { type: 'Hero', label: 'Hero', icon: LayoutPanelTop, desc: 'Judul utama dengan nama mempelai',
        variants: [
          { name: 'Tengah', value: 'center' },
          { name: 'Kiri', value: 'left' },
          { name: 'Kanan', value: 'right' }
        ],
        defaultVariant: 'center'
      },
      { type: 'Couple', label: 'Mempelai', icon: Users, desc: 'Profil kedua mempelai',
        variants: [
          { name: 'Vertikal', value: 'vertical' },
          { name: 'Horizontal', value: 'horizontal' },
          { name: 'Card', value: 'card' }
        ],
        defaultVariant: 'vertical'
      },
      { type: 'Countdown', label: 'Countdown', icon: Clock, desc: 'Hitung mundur ke hari H',
        variants: [
          { name: 'Lingkaran', value: 'circles' },
          { name: 'Kotak', value: 'boxes' },
          { name: 'Sederhana', value: 'simple' }
        ],
        defaultVariant: 'circles'
      }
    ]
  },
  {
    id: 'content',
    label: 'Konten',
    icon: PenTool,
    color: '#8a6d2f',
    blocks: [
      { type: 'EventDetail', label: 'Detail Acara', icon: CalendarHeart, desc: 'Waktu dan lokasi acara',
        variants: [
          { name: 'Card', value: 'card' },
          { name: 'Timeline', value: 'timeline' },
          { name: 'Minimalis', value: 'minimal' }
        ],
        defaultVariant: 'card'
      },
      { type: 'Story', label: 'Our Story', icon: BookOpen, desc: 'Perjalanan cinta kalian',
        variants: [
          { name: 'Timeline', value: 'timeline' },
          { name: 'Cards', value: 'cards' },
          { name: 'Minimal', value: 'minimal' }
        ],
        defaultVariant: 'timeline'
      },
      { type: 'Text', label: 'Teks Box', icon: Type, desc: 'Teks bebas',
        variants: [
          { name: 'Biasa', value: 'plain' },
          { name: 'Kartu', value: 'card' },
          { name: 'Aksen', value: 'accent' }
        ],
        defaultVariant: 'plain'
      },
      { type: 'Quote', label: 'Kutipan / Ayat', icon: QuoteIcon, desc: 'Ayat atau kutipan',
        variants: [
          { name: 'Islami', value: 'islam' },
          { name: 'Kristen', value: 'kristen' },
          { name: 'Konghucu', value: 'konghucu' }
        ],
        defaultVariant: 'islam',
        variantKey: 'religion'
      }
    ]
  },
  {
    id: 'media',
    label: 'Media',
    icon: Images,
    color: '#6b8e5a',
    blocks: [
      { type: 'Gallery', label: 'Galeri', icon: Images, desc: 'Galeri foto',
        variants: [
          { name: 'Grid', value: 'grid' },
          { name: 'Grid 3', value: 'grid3' },
          { name: 'Masonry', value: 'masonry' },
          { name: 'Carousel', value: 'carousel' },
          { name: 'Column', value: 'column' },
          { name: 'Mosaic', value: 'mosaic' },
          { name: 'Polaroid', value: 'polaroid' },
          { name: 'Arch', value: 'arch' },
          { name: 'Bento', value: 'bento' },
          { name: 'Hero + Grid', value: 'hero-grid' },
          { name: 'Filmstrip', value: 'filmstrip' },
          { name: 'Stack', value: 'stack' }
        ],
        defaultVariant: 'grid'
      },
      { type: 'Photo', label: 'Foto / Gambar', icon: ImageIcon, desc: 'Satu foto dengan caption',
        variants: [
          { name: 'Bulat', value: 'rounded' },
          { name: 'Persegi', value: 'square' }
        ],
        defaultVariant: 'rounded'
      }
    ]
  },
  {
    id: 'interactive',
    label: 'Interaktif',
    icon: MessageSquare,
    color: '#5a7a8e',
    blocks: [
      { type: 'RSVP', label: 'RSVP', icon: Mail, desc: 'Konfirmasi kehadiran',
        variants: [
          { name: 'Pusat', value: 'centered' },
          { name: 'Kartu', value: 'card' },
          { name: 'Minimal', value: 'minimal' }
        ],
        defaultVariant: 'centered'
      },
      { type: 'Envelope', label: 'Amplop Online', icon: Gift, desc: 'Hadiah & rekening',
        variants: [
          { name: 'Standar', value: 'standard' },
          { name: 'Minimal', value: 'minimal' }
        ],
        defaultVariant: 'standard'
      },
      { type: 'GiftList', label: 'Daftar Kado', icon: ListChecks, desc: 'Referensi hadiah',
        variants: [
          { name: 'Grid', value: 'grid' },
          { name: 'List', value: 'list' }
        ],
        defaultVariant: 'grid'
      },
      { type: 'Maps', label: 'Maps', icon: MapPin, desc: 'Peta lokasi acara',
        variants: [
          { name: 'Penuh', value: 'full' },
          { name: 'Kartu', value: 'card' }
        ],
        defaultVariant: 'full'
      },
      { type: 'LiveStreaming', label: 'Siaran Langsung', icon: Radio, desc: 'Streaming YouTube/Vimeo',
        variants: [
          { name: 'Penuh', value: 'full' },
          { name: 'Minimal', value: 'minimal' }
        ],
        defaultVariant: 'full'
      },
      { type: 'Popup', label: 'Popup / Prokes', icon: MousePointerClick, desc: 'Tombol modal info, protokol kesehatan, gambar, tautan' },
      { type: 'CopyText', label: 'Salin Teks', icon: CopyIcon, desc: 'Tombol salin rekening / teks apa pun' }
    ]
  },
  {
    id: 'decoration',
    label: 'Dekorasi',
    icon: Sparkles,
    color: '#9a6d8e',
    blocks: [
      { type: 'Divider', label: 'Pemisah', icon: Minus, desc: 'Garis pemisah',
        variants: [
          { name: 'Garis', value: 'line' },
          { name: 'Titik', value: 'dots' },
          { name: 'Diamond', value: 'diamond' },
          { name: 'Hati', value: 'hearts' },
          { name: 'Daun', value: 'leaves' }
        ],
        defaultVariant: 'line'
      },
      { type: 'Thanks', label: 'Penutup', icon: HeartHandshake, desc: 'Ucapan terima kasih',
        variants: [
          { name: 'Tengah', value: 'center' },
          { name: 'Elegan', value: 'elegant' },
          { name: 'Minimal', value: 'minimal' }
        ],
        defaultVariant: 'center'
      },
      { type: 'Watermark', label: 'Watermark', icon: PenTool, desc: 'Made with Love — branding di akhir undangan',
        defaultProps: { text: 'Made with Love by', brand: '', url: 'https://prashadigitalindonesia.com' }
      },
      { type: 'Empty', label: 'Blok Kosong', icon: LayoutPanelTop, desc: 'Placeholder kosong' }
    ]
  }
];

const QUICK_STARTS: { label: string; blocks: BlockType[] }[] = [
  { label: 'Hero + Mempelai', blocks: ['Hero', 'Couple'] },
  { label: 'Galeri + Countdown', blocks: ['Gallery', 'Countdown'] },
  { label: 'RSVP + Maps', blocks: ['RSVP', 'Maps'] }
];

function DraggableElement({ type, label, icon: Icon, desc }: { type: BlockType; label: string; icon: React.ElementType; desc: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `widget-${type}` });
  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`group flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all ${
        isDragging
          ? 'border-[#c9a45c] bg-[#c9a45c]/10 text-[#8a6d2f] opacity-40'
          : 'cursor-grab border-[#e7ddcc] bg-white hover:border-[#c9a45c] hover:shadow-sm active:cursor-grabbing'
      }`}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#f5f0e8] text-[#8a7a66] transition-colors group-hover:bg-[#c9a45c]/10 group-hover:text-[#c9a45c]">
        {/* @ts-ignore */}
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[#2b2620]">{label}</p>
        <p className="truncate text-[10px] text-[#8a7a66]">{desc}</p>
      </div>
      <GripVertical className="h-3.5 w-3.5 shrink-0 text-[#c9b896] opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}

function CategorySection({ category, isExpanded, onToggle, onSelectVariant }: {
  category: BlockCategory;
  isExpanded: boolean;
  onToggle: () => void;
  onSelectVariant: (type: BlockType, variant: string, variantKey?: string) => void;
}) {
  const Icon = category.icon;
  return (
    <div className="mb-2">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-[#f5f0e8]"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-md" style={{ backgroundColor: `${category.color}20` }}>
          {/* @ts-ignore */}
          <Icon className="h-3.5 w-3.5" style={{ color: category.color }} />
        </div>
        <span className="flex-1 text-xs font-semibold text-[#2b2620]">{category.label}</span>
        {isExpanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-[#8a7a66]" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-[#8a7a66]" />
        )}
      </button>
      {isExpanded && (
        <div className="mt-1 space-y-1 pl-1">
          {category.blocks.map((block) => (
            <BlockWithVariants key={block.type} block={block} onSelectVariant={onSelectVariant} />
          ))}
        </div>
      )}
    </div>
  );
}

function BlockWithVariants({ block, onSelectVariant }: { block: BlockItem; onSelectVariant: (type: BlockType, variant: string, variantKey?: string) => void }) {
  const [showVariants, setShowVariants] = useState(false);

  return (
    <div>
      <DraggableElement type={block.type} label={block.label} icon={block.icon} desc={block.desc} />
      {block.variants && block.variants.length > 1 && (
        <button
          onClick={() => setShowVariants(!showVariants)}
          className="ml-10 mt-0.5 flex items-center gap-1 text-[10px] text-[#b39a65] hover:text-[#c9a45c]"
        >
          <Palette className="h-3 w-3" />
          {showVariants ? 'Sembunyikan' : `${block.variants.length} variasi`}
        </button>
      )}
      {showVariants && block.variants && (
        <div className="ml-10 mt-1 mb-2 space-y-1">
          {block.variants.map((v) => (
            <button
              key={v.value}
              onClick={() => {
                onSelectVariant(block.type, v.value, block.variantKey);
                setShowVariants(false);
              }}
              className="flex w-full items-center gap-2 rounded-md border border-dashed border-[#e0d6c2] px-2.5 py-1.5 text-[11px] text-[#6b5f4d] transition-colors hover:border-[#c9a45c] hover:bg-[#faf7f2]"
            >
              <Palette className="h-3 w-3 text-[#b39a65]" />
              {v.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ElementsSidebar() {
  const addBlock = useBuilderStore((s) => s.addBlock);
  const setBlockProps = useBuilderStore((s) => s.setBlockProps);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['header', 'content'])
  );

  function toggleCategory(id: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSelectVariant(type: BlockType, variant: string, variantKey?: string) {
    addBlock(type);
    // Update the variant after adding
    const state = useBuilderStore.getState();
    const lastBlock = state.canvas.blocks[state.canvas.blocks.length - 1];
    if (lastBlock) {
      setBlockProps(lastBlock.id, { [variantKey || 'variant']: variant });
    }
  }

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-[#e7ddcc] bg-[#faf8f5]">
      <div className="border-b border-[#e7ddcc] px-4 py-3">
        <div className="flex items-center gap-2">
          <Layout className="h-4 w-4 text-[#c9a45c]" />
          <h3 className="text-sm font-semibold text-[#2b2620]">Tambah Blok</h3>
        </div>
        <p className="mt-0.5 text-xs text-[#8a7a66]">Pilih kategori lalu klik atau seret ke kanvas</p>
        <p className="mt-1.5 rounded-md bg-[#c9a45c]/10 px-2 py-1.5 text-[10px] leading-relaxed text-[#8a6d2f]">
          Pilih blok di kanvas → tab <b>Style</b> punya galeri <b>Gaya</b> (Lembut, Bold, Mewah, Ruang, dll.)
        </p>
      </div>

      <div className="flex-1 space-y-1 overflow-auto p-3">
        {BLOCK_CATEGORIES.map((cat) => (
          <CategorySection
            key={cat.id}
            category={cat}
            isExpanded={expandedCategories.has(cat.id)}
            onToggle={() => toggleCategory(cat.id)}
            onSelectVariant={handleSelectVariant}
          />
        ))}

        <div className="mt-4 border-t border-[#e7ddcc] pt-4">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-[#b39a65]">Quick Start</p>
          <div className="space-y-2">
            {QUICK_STARTS.map((t) => (
              <button
                key={t.label}
                onClick={() => t.blocks.forEach((b) => addBlock(b))}
                className="flex w-full items-center gap-3 rounded-lg border border-dashed border-[#e0d6c2] px-3 py-2.5 text-sm text-[#6b5f4d] transition-colors hover:border-[#c9a45c] hover:bg-[#faf7f2] hover:text-[#8a6d2f]"
              >
                <Sparkles className="h-4 w-4 text-[#b39a65]" />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
