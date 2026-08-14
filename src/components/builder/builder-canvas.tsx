'use client';

import { useEffect, useRef, useState } from 'react';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { useDraggable, useDroppable, useDndContext } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Grid3x3 } from 'lucide-react';
import type { Block, BlockType } from '@/lib/types';
import BlockView from '@/components/guest/BlockView';
import { useBuilderStore } from '@/store/builder-store';
import DeviceToggle from '@/components/ui/device-toggle';
import type { Device } from '@/components/ui/device-toggle';

const CANVAS_W = 420;

interface BuilderCanvasProps {
  projectId: string;
  activeType: BlockType | null;
  device: Device;
  onDeviceChange: (device: Device) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  freeCanvasRef: React.MutableRefObject<HTMLDivElement | null>;
  saveState: 'idle' | 'saving' | 'saved';
  guides: { x?: number; y?: number };
}

export default function BuilderCanvas({
  activeType,
  device,
  onDeviceChange,
  showGrid,
  onToggleGrid,
  freeCanvasRef,
  saveState,
  guides
}: BuilderCanvasProps) {
  const canvas = useBuilderStore((s) => s.canvas);
  const selectBlock = useBuilderStore((s) => s.selectBlock);
  const flow = canvas.flow ?? 'stack';

  return (
    <div className="relative flex h-full flex-1 flex-col items-center justify-center overflow-hidden bg-[#f1ece1]">
      <div className="flex w-full items-center justify-end gap-3 px-4 pt-3">
        <button
          onClick={onToggleGrid}
          aria-pressed={showGrid}
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
            showGrid
              ? 'border-[#c9a45c] bg-[#c9a45c] text-white'
              : 'border-[#e0d6c2] bg-white text-[#6b5f4d] hover:border-[#c9a45c] hover:text-[#8a6d2f]'
          }`}
        >
          <Grid3x3 className="h-3.5 w-3.5" />
          Grid
        </button>
        <DeviceToggle device={device} onChange={onDeviceChange} />
      </div>

      <div
        className="flex min-h-0 flex-1 items-center justify-center p-4"
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) selectBlock(null);
        }}
      >        <div
          className="relative h-full overflow-hidden rounded-md bg-white shadow-xl shadow-[#b98a3e]/20 ring-1 ring-[#e7ddcc]"
          style={{ width: device === 'desktop' ? '100%' : CANVAS_W, maxWidth: '100%' }}
        >
          {showGrid && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-40 opacity-[0.07]"
              style={{
                backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            />
          )}
          <div
            className="no-scrollbar h-full overflow-y-auto"
            onPointerDown={(e) => {
              const t = e.target as HTMLElement;
              if (!t.closest('[data-block]')) selectBlock(null);
            }}
          >
            {flow === 'free' ? (
              <FreeCanvas blocks={canvas.blocks} canvasRef={freeCanvasRef} guides={guides} />
            ) : (
              <SortableContext items={canvas.blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                <div className="guest-root" style={guestStyle(canvas)}>
                  <StackList blocks={canvas.blocks} dimmed={!!activeType} />
                  {canvas.blocks.length === 0 && <EmptyHint />}
                </div>
              </SortableContext>
            )}
          </div>
        </div>
      </div>

      {saveState === 'saving' && (
        <span className="fixed bottom-4 right-4 rounded bg-[#2b2620] px-2 py-1 text-xs text-[#e8ddc6] ring-1 ring-[#bfae8f]">Menyimpan...</span>
      )}
      {saveState === 'saved' && (
        <span className="fixed bottom-4 right-4 rounded bg-emerald-600 px-2 py-1 text-xs text-white">Tersimpan</span>
      )}
      {flow === 'free' && (
        <span className="pointer-events-none absolute right-4 top-3 rounded bg-[#2b2620]/90 px-2 py-1 text-[10px] text-[#e8ddc6]">
          Mode Bebas — seret &ldquo;Geser&rdquo; atas blok untuk pindah, handle emas di dalam blok untuk menggeser elemen (snap ke tengah/tepi)
        </span>
      )}
    </div>
  );
}

function guestStyle(canvas: ReturnType<typeof useBuilderStore.getState>['canvas']) {
  return {
    '--color-primary': canvas.theme.primary,
    '--color-secondary': canvas.theme.secondary,
    '--color-background': canvas.theme.background,
    '--color-text': canvas.theme.text,
    '--font-heading': `'${canvas.theme.font_heading}', serif`,
    '--font-body': `'${canvas.theme.font_body}', sans-serif`
  } as React.CSSProperties;
}

function EmptyHint() {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-10 text-center text-sm text-gray-400">
      Seret widget dari panel kiri ke sini, atau klik widget untuk menambah blok.
    </div>
  );
}

/** List blok mode stack — menyorot posisi target saat widget diseret dari sidebar. */
function StackList({ blocks, dimmed }: { blocks: Block[]; dimmed: boolean }) {
  const { over, active } = useDndContext();
  const isWidgetDrag = !!active && String(active.id).startsWith('widget-');
  const overId = over ? String(over.id) : null;
  return (
    <>
      {blocks.map((block) => {
        const isOver = isWidgetDrag && overId === block.id;
        return (
          <SortableBlock key={block.id} block={block} dimmed={dimmed} dropTarget={isOver} />
        );
      })}
    </>
  );
}

function SortableBlock({ block, dimmed, dropTarget }: { block: Block; dimmed: boolean; dropTarget: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id
  });
  const selected = useBuilderStore((s) => s.selectedBlockId === block.id);
  const selectBlock = useBuilderStore((s) => s.selectBlock);
  const removeBlock = useBuilderStore((s) => s.removeBlock);
  const duplicateBlock = useBuilderStore((s) => s.duplicateBlock);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      data-block
      className={`relative cursor-grab outline-2 outline-offset-[-2px] ${
        selected ? 'outline-[#c9a45c]' : dropTarget ? 'outline-[#c9a45c]' : 'outline-transparent'
      } ${isDragging ? 'opacity-40' : ''} ${dimmed && !dropTarget && !isDragging ? 'opacity-[0.35]' : ''}`}
      onClick={() => selectBlock(block.id)}
      {...attributes}
      {...listeners}
    >
      <BlockView block={block} editable />
      {selected && (
        <div className="absolute right-2 top-2 z-30 flex gap-1 rounded-md bg-[#141414]/90 p-1 shadow-lg ring-1 ring-white/10" onClick={(e) => e.stopPropagation()}>
          <button
            className="rounded p-1 text-white transition-colors hover:bg-[#c9a45c]/30"
            aria-label="Duplikat blok"
            onClick={(e) => {
              e.stopPropagation();
              duplicateBlock(block.id);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 1.732 1" />
            </svg>
          </button>
          <button
            className="rounded p-1 text-white transition-colors hover:bg-red-500/30"
            aria-label="Hapus blok"
            onClick={(e) => {
              e.stopPropagation();
              removeBlock(block.id);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

function FreeCanvas({ blocks, canvasRef, guides }: { blocks: Block[]; canvasRef: React.MutableRefObject<HTMLDivElement | null>; guides: { x?: number; y?: number } }) {
  const selectBlock = useBuilderStore((s) => s.selectBlock);
  const { setNodeRef } = useDroppable({ id: 'free-canvas' });
  const height = blocks.reduce((m, b) => (b.layout ? Math.max(m, b.layout.y) : m), 0) + 800;

  return (
    <div
      ref={(el) => {
        canvasRef.current = el;
        setNodeRef(el);
      }}
      className="relative"
      style={{ minHeight: Math.max(height, 1200), width: CANVAS_W }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) selectBlock(null);
      }}
    >
      {(guides.x !== undefined || guides.y !== undefined) && (
        <div className="pointer-events-none absolute inset-0 z-40">
          {guides.x !== undefined && <div className="absolute top-0 h-full w-px bg-[#c9a45c]" style={{ left: guides.x }} />}
          {guides.y !== undefined && <div className="absolute left-0 w-full bg-[#c9a45c]" style={{ top: guides.y }} />}
        </div>
      )}
      {blocks.map((block) => (
        <FreeBlock key={block.id} block={block} />
      ))}
      {blocks.length === 0 && (
        <div className="absolute left-0 top-0 flex h-64 w-full items-center justify-center p-10 text-center text-sm text-gray-400">
          Seret widget dari panel kiri ke sini, atau klik widget untuk menambah blok.
        </div>
      )}
    </div>
  );
}

/**
 * Fitur "geser elemen di dalam blok" (mode bebas saja): saat blok terpilih,
 * sub-elemen ber-`data-inner` diberi handle seret. Pergerakan disimpan ke
 * `block.inner` dan menampilkan alignment guide + snap ke tengah/tepi blok.
 */
function InnerDragLayer({ block, blockWidth }: { block: Block; blockWidth: number }) {
  const setBlockInner = useBuilderStore((s) => s.setBlockInner);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [handles, setHandles] = useState<{ name: string; left: number; top: number; width: number; height: number }[]>(
    []
  );
  const [guides, setGuides] = useState<{ x?: number; y?: number }>({});

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const host = el.closest<HTMLElement>('[data-block]');
    if (!host) return;
    const hostRect = host.getBoundingClientRect();
    const items = Array.from(host.querySelectorAll('[data-inner]')) as HTMLElement[];
    setHandles(
      items.map((node) => {
        const r = node.getBoundingClientRect();
        return {
          name: node.dataset.inner ?? '',
          left: r.left - hostRect.left,
          top: r.top - hostRect.top,
          width: r.width,
          height: r.height
        };
      })
    );
  }, [block.inner, block.id]);

  function onDragStart(e: React.PointerEvent, name: string) {
    e.stopPropagation();
    e.preventDefault();
    const el = containerRef.current;
    const host = el?.closest<HTMLElement>('[data-block]');
    if (!el || !host) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const current = block.inner?.[name] ?? { x: 0, y: 0 };
    let lastGuides: { x?: number; y?: number } = {};

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      let nx = current.x + dx;
      let ny = current.y + dy;

      const node = host.querySelector<HTMLElement>(`[data-inner="${name}"]`);
      const nodeW = node?.getBoundingClientRect().width ?? 100;
      const nodeH = node?.getBoundingClientRect().height ?? 40;
      const SNAP = 8;

      const cx = blockWidth / 2;

      let guideX: number | undefined;
      const candX: { v: number; kind: 'left' | 'center' | 'right' }[] = [
        { v: 0, kind: 'left' },
        { v: cx - nodeW / 2, kind: 'center' },
        { v: blockWidth - nodeW, kind: 'right' }
      ];
      for (const c of candX) {
        if (Math.abs(nx - c.v) <= SNAP) {
          nx = c.v;
          guideX = c.kind === 'center' ? cx : c.v;
          break;
        }
      }

      let guideY: number | undefined;
      const hostH = host.getBoundingClientRect().height;
      const cy = hostH / 2;
      const candY: { v: number; kind: 'top' | 'center' | 'bottom' }[] = [
        { v: 0, kind: 'top' },
        { v: cy - nodeH / 2, kind: 'center' },
        { v: hostH - nodeH, kind: 'bottom' }
      ];
      for (const c of candY) {
        if (Math.abs(ny - c.v) <= SNAP) {
          ny = c.v;
          guideY = c.kind === 'center' ? cy : c.v;
          break;
        }
      }

      setBlockInner(block.id, name, {
        x: Math.max(-nodeW + 8, Math.min(blockWidth - 8, nx)),
        y: Math.max(-nodeH + 8, ny)
      });
      lastGuides = { x: guideX, y: guideY };
      setGuides(lastGuides);
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      const host2 = containerRef.current?.closest<HTMLElement>('[data-block]');
      if (host2) {
        const hostR = host2.getBoundingClientRect();
        const node = host2.querySelector<HTMLElement>(`[data-inner="${name}"]`);
        const nR = node?.getBoundingClientRect();
        if (nR) {
          setHandles((prev) =>
            prev.map((h) =>
              h.name === name
                ? { ...h, left: nR.left - hostR.left, top: nR.top - hostR.top, width: nR.width, height: nR.height }
                : h
            )
          );
        }
      }
      setGuides({});
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 z-20" onPointerDown={(e) => e.stopPropagation()}>
      {guides.x !== undefined && (
        <div className="absolute top-0 h-full w-px bg-[#c9a45c]" style={{ left: guides.x }} />
      )}
      {guides.y !== undefined && (
        <div className="absolute left-0 w-full bg-[#c9a45c]" style={{ top: guides.y }} />
      )}
      {handles.map((h) => (
        <div
          key={h.name}
          className="absolute z-30 flex scale-50 items-center gap-3 border border-[#c9a45c] bg-[#c9a45c]/10 text-[#c9a45c]"
          style={{ left: h.left, top: h.top, width: h.width, height: h.height }}
        >
          <span
            className="pointer-events-auto absolute -top-3 left-1/2 flex -translate-x-1/2 cursor-move items-center gap-1 rounded-full bg-[#c9a45c] px-2 py-0.5 text-[10px] text-white shadow ring-1 ring-white/30 active:cursor-grabbing"
            title={`Geser elemen "${h.name}"`}
            onPointerDown={(e) => onDragStart(e, h.name)}
          >
            <GripVertical className="h-3 w-3" />
            Geser
          </span>
        </div>
      ))}
    </div>
  );
}

function FreeBlock({ block }: { block: Block }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: block.id });
  const selected = useBuilderStore((s) => s.selectedBlockId === block.id);
  const selectBlock = useBuilderStore((s) => s.selectBlock);
  const removeBlock = useBuilderStore((s) => s.removeBlock);
  const duplicateBlock = useBuilderStore((s) => s.duplicateBlock);
  const setBlockLayout = useBuilderStore((s) => s.setBlockLayout);
  const layout = block.layout ?? { x: 0, y: 0, width: 420 };

  return (
    <div
      ref={setNodeRef}
      style={{
        position: 'absolute',
        left: layout.x,
        top: layout.y,
        width: layout.width,
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 20 : selected ? 5 : 1
      }}
      data-block
      className={`group relative outline-2 outline-offset-0 ${
        selected ? 'outline-[#c9a45c]' : 'outline-transparent'
      } ${isDragging ? 'opacity-70' : ''}`}
      onClick={() => selectBlock(block.id)}
    >
      <button
        {...attributes}
        {...listeners}
        title="Seret untuk pindah"
        aria-label="Geser blok"
        className={`absolute -top-2 left-1/2 z-30 flex -translate-x-1/2 cursor-grab items-center gap-1 rounded-full bg-[#141414]/90 px-2 py-0.5 text-[10px] text-white shadow ring-1 ring-white/10 transition-opacity active:cursor-grabbing ${
          selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <GripVertical className="h-3.5 w-3.5" />
        Geser
      </button>
      <BlockView block={block} editable />
      {selected && <InnerDragLayer block={block} blockWidth={layout.width} />}
      {selected && (
        <>
          <div className="absolute right-0 top-0 z-30 flex gap-1 rounded-bl-md bg-[#141414]/90 p-1 shadow ring-1 ring-white/10" onClick={(e) => e.stopPropagation()}>
            <button
              className="rounded p-1 text-white transition-colors hover:bg-[#c9a45c]/30"
              aria-label="Duplikat blok"
              onClick={(e) => {
                e.stopPropagation();
                duplicateBlock(block.id);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 1.732 1" />
              </svg>
            </button>
            <button
              className="rounded p-1 text-white transition-colors hover:bg-red-500/30"
              aria-label="Hapus blok"
              onClick={(e) => {
                e.stopPropagation();
                removeBlock(block.id);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
          <div
            className="absolute inset-y-0 right-0 z-40 w-2 cursor-ew-resize bg-[#c9a45c]/60"
            title="Ubah lebar"
            onPointerDown={(e) => {
              e.stopPropagation();
              const startX = e.clientX;
              const startW = layout.width;
              const onMove = (ev: PointerEvent) =>
                setBlockLayout(block.id, { width: Math.min(420, Math.max(40, startW + (ev.clientX - startX))) });
              const onUp = () => {
                window.removeEventListener('pointermove', onMove);
                window.removeEventListener('pointerup', onUp);
              };
              window.addEventListener('pointermove', onMove);
              window.addEventListener('pointerup', onUp);
            }}
          />
        </>
      )}
    </div>
  );
}