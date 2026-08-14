'use client';

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
}

export default function BuilderCanvas({
  activeType,
  device,
  onDeviceChange,
  showGrid,
  onToggleGrid,
  freeCanvasRef,
  saveState
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
              <FreeCanvas blocks={canvas.blocks} canvasRef={freeCanvasRef} />
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
          Mode Bebas — seret handle &ldquo;Geser&rdquo; untuk pindah, tepi emas untuk ubah lebar
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

function FreeCanvas({ blocks, canvasRef }: { blocks: Block[]; canvasRef: React.MutableRefObject<HTMLDivElement | null> }) {
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