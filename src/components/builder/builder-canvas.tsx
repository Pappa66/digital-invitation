'use client';

import { useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  useDndContext,
  closestCenter,
  type DragStartEvent,
  type DragMoveEvent,
  type DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Grid3x3 } from 'lucide-react';
import type { Block, BlockType } from '@/lib/types';
import BlockView from '@/components/guest/BlockView';
import { useBuilderStore } from '@/store/builder-store';
import { saveCanvasNow } from '@/hooks/use-autosave';
import DeviceToggle from '@/components/ui/device-toggle';
import type { Device } from '@/components/ui/device-toggle';

interface BuilderCanvasProps {
  projectId: string;
}

const CANVAS_W = 420;
const CANVAS_W_DESKTOP = 900;

export default function BuilderCanvas({ projectId }: BuilderCanvasProps) {
  const canvas = useBuilderStore((s) => s.canvas);
  const [activeType, setActiveType] = useState<BlockType | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [device, setDevice] = useState<Device>('mobile');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const dragStartLayoutRef = useRef<Record<string, { x: number; y: number }>>({});
  const dragTranslatedRef = useRef<Record<string, { left: number; top: number }>>({});
  const freeCanvasRef = useRef<HTMLDivElement | null>(null);

  const flow = canvas.flow ?? 'stack';
  const canvasW = device === 'desktop' ? CANVAS_W_DESKTOP : CANVAS_W;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    if (id.startsWith('widget-')) {
      setActiveType(id.replace('widget-', '') as BlockType);
    } else {
      setActiveType(null);
      const b = canvas.blocks.find((x) => x.id === id);
      if (b?.layout) {
        dragStartLayoutRef.current[id] = { x: b.layout.x, y: b.layout.y };
      }
    }
  }

  function handleDragMove(event: DragMoveEvent) {
    const id = String(event.active.id);
    const r = event.active.rect.current.translated;
    if (r) dragTranslatedRef.current[id] = { left: r.left, top: r.top };
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveType(null);
    const activeString = String(active.id);
    const overString = over ? String(over.id) : null;

    if (activeString.startsWith('widget-')) {
      const type = activeString.replace('widget-', '') as BlockType;
      if (flow === 'free') {
        const rect = dragTranslatedRef.current[activeString];
        useBuilderStore.getState().addBlock(type);
        const newId = useBuilderStore.getState().selectedBlockId;
        if (newId && rect && freeCanvasRef.current) {
          const cb = freeCanvasRef.current.getBoundingClientRect();
          useBuilderStore
            .getState()
            .setBlockLayout(newId, {
              x: Math.max(0, Math.min(canvasW - 40, rect.left - cb.left)),
              y: Math.max(0, rect.top - cb.top)
            });
        }
      } else if (!overString) {
        useBuilderStore.getState().addBlock(type);
      } else {
        const overIndex = canvas.blocks.findIndex((b) => b.id === overString);
        useBuilderStore.getState().addBlock(type, overIndex === -1 ? undefined : overIndex);
      }
      triggerSave();
      return;
    }

    if (flow === 'free') {
      const rect = dragTranslatedRef.current[activeString];
      if (rect && freeCanvasRef.current) {
        const cb = freeCanvasRef.current.getBoundingClientRect();
        useBuilderStore
          .getState()
          .setBlockLayout(activeString, {
            x: Math.max(0, Math.min(canvasW - 40, rect.left - cb.left)),
            y: Math.max(0, rect.top - cb.top)
          });
      } else {
        const start = dragStartLayoutRef.current[activeString];
        const b = canvas.blocks.find((x) => x.id === activeString);
        if (b && start) {
          useBuilderStore
            .getState()
            .setBlockLayout(activeString, {
              x: Math.max(0, Math.min(canvasW - 40, start.x + event.delta.x)),
              y: Math.max(0, start.y + event.delta.y)
            });
        }
      }
      triggerSave();
      return;
    }

    if (!overString || activeString === overString) return;
    const from = canvas.blocks.findIndex((b) => b.id === activeString);
    const to = canvas.blocks.findIndex((b) => b.id === overString);
    if (from === -1 || to === -1) return;

    useBuilderStore.setState((state) => {
      const next = { ...state.canvas, blocks: arrayMove(state.canvas.blocks, from, to) };
      return { canvas: next };
    });
    triggerSave();
  }

  async function triggerSave() {
    setSaveState('saving');
    const { error } = await saveCanvasNow(projectId, useBuilderStore.getState().canvas);
    setSaveState(error ? 'idle' : 'saved');
    setTimeout(() => setSaveState('idle'), 1500);
  }

  return (
    <div className="relative flex h-full flex-1 flex-col items-center justify-center overflow-hidden bg-[#1a1e26]">
      <div className="flex w-full items-center justify-end gap-3 px-4 pt-3">
        <button
          onClick={() => setShowGrid((v) => !v)}
          aria-pressed={showGrid}
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
            showGrid
              ? 'border-[#c9a45c] bg-[#c9a45c]/15 text-[#e8ddc6]'
              : 'border-[#3a3f4a] text-[#8b93a3] hover:border-[#555c6b] hover:text-white'
          }`}
        >
          <Grid3x3 className="h-3.5 w-3.5" />
          Grid
        </button>
        <DeviceToggle device={device} onChange={setDevice} />
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
        >
          <div
            className="relative h-full overflow-hidden rounded-md bg-white shadow-2xl shadow-black/50"
            style={{ width: device === 'desktop' ? '100%' : canvasW, maxWidth: '100%' }}
          >
            {showGrid && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-40 opacity-[0.06]"
                style={{
                  backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}
              />
            )}
            <div className="no-scrollbar h-full overflow-y-auto">
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

          <DragOverlay dropAnimation={null}>
            {activeType && (
              <div className="w-[300px] rounded-lg border-2 border-dashed border-[#c9a45c] bg-white/95 p-4 opacity-95 shadow-2xl">
                <div className="flex items-center gap-2 text-sm font-medium text-[#141414]">
                  <span className="h-7 w-7 rounded-md bg-[#c9a45c]/15 text-center leading-7">{activeType.slice(0, 1)}</span>
                  Tambah {activeType}
                </div>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {saveState === 'saving' && (
        <span className="fixed bottom-4 right-4 rounded bg-[#10131a] px-2 py-1 text-xs text-[#e8ddc6] ring-1 ring-[#3a3f4a]">Menyimpan...</span>
      )}
      {saveState === 'saved' && (
        <span className="fixed bottom-4 right-4 rounded bg-emerald-600 px-2 py-1 text-xs text-white">Tersimpan</span>
      )}
      {flow === 'free' && (
        <span className="pointer-events-none absolute right-4 top-3 rounded bg-[#10131a]/90 px-2 py-1 text-[10px] text-[#8b93a3]">
          Mode Bebas — seret handle &ldquo;Geser&rdquo; untuk pindah, tepi biru untuk ubah lebar
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