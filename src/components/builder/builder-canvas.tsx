'use client';

import { useEffect, useRef, useState } from 'react';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { useDraggable, useDroppable, useDndContext } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Grid3x3, Undo2, Redo2, Copy, ClipboardPaste, ArrowUp, ArrowDown } from 'lucide-react';
import type { Block, BlockType } from '@/lib/types';
import BlockView from '@/components/guest/BlockView';
import { ThemeContext } from '@/components/guest/theme-context';
import { GuestFrame } from '@/components/guest/guest-frame';
import { useBuilderStore, undoBuilder, redoBuilder, useBuilderHistory, COVER_BLOCK_ID } from '@/store/builder-store';
import DeviceToggle from '@/components/ui/device-toggle';
import type { Device } from '@/components/ui/device-toggle';
import { Palette } from 'lucide-react';

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
  const { canUndo, canRedo } = useBuilderHistory();

  return (
    <div className="relative flex h-full flex-1 flex-col items-center justify-center overflow-hidden bg-[#f1ece1]">
      <div className="flex w-full items-center justify-end gap-3 px-4 pt-3">
        <button
          onClick={redoBuilder}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          aria-label="Redo"
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 ${
            canRedo
              ? 'border-[#e0d6c2] bg-white text-[#6b5f4d] hover:border-[#c9a45c] hover:text-[#8a6d2f]'
              : 'border-[#e0d6c2] bg-white text-[#b3a69a]'
          }`}
        >
          <Redo2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={undoBuilder}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 ${
            canUndo
              ? 'border-[#e0d6c2] bg-white text-[#6b5f4d] hover:border-[#c9a45c] hover:text-[#8a6d2f]'
              : 'border-[#e0d6c2] bg-white text-[#b3a69a]'
          }`}
        >
          <Undo2 className="h-3.5 w-3.5" />
        </button>
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
          style={{ width: device === 'desktop' ? '100%' : device === 'tablet' ? 640 : CANVAS_W, maxWidth: '100%' }}
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
                <ThemeContext.Provider value={canvas.theme}>
                  <div className="guest-root" style={guestStyle(canvas)}>
                    <StackList blocks={canvas.blocks} dimmed={!!activeType} />
                    {canvas.blocks.length === 0 && <EmptyHint />}
                    <GuestFrame mode={canvas.theme.frame} color={canvas.theme.secondary} fixed={false} enabled={!canvas.theme.card_style} />
                  </div>
                </ThemeContext.Provider>
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

/** Preview cover "Buka Undangan" — elemen pertama di kanvas, selectable untuk edit. */
function CoverPreview() {
  const canvas = useBuilderStore((s) => s.canvas);
  const selected = useBuilderStore((s) => s.selectedBlockId === COVER_BLOCK_ID);
  const selectBlock = useBuilderStore((s) => s.selectBlock);
  if (canvas.settings.show_cover === false) return null;
  const hero = canvas.blocks.find((b) => b.type === 'Hero');
  const bg = canvas.settings.cover_bg_image || (typeof hero?.props.bg_image === 'string' ? hero.props.bg_image : undefined);
  const names = [hero?.props.bride, hero?.props.groom].filter(Boolean).join(' & ');
  const caption = typeof hero?.props.caption === 'string' ? hero.props.caption : 'Undangan Pernikahan';
  return (
    <button
      type="button"
      onClick={() => selectBlock(COVER_BLOCK_ID)}
      className={`relative flex h-64 w-full flex-col items-center justify-center overflow-hidden px-6 text-center transition-shadow ${
        selected ? 'ring-2 ring-[#c9a45c] ring-inset' : 'hover:ring-2 hover:ring-[#c9a45c]/60 hover:ring-inset'
      }`}
      style={{ background: bg ? `url(${bg}) center / cover no-repeat` : `linear-gradient(160deg, ${canvas.theme.primary} 0%, ${canvas.theme.secondary} 100%)` }}
    >
      <span className="pointer-events-none absolute left-2 top-2 rounded bg-black/45 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white">
        Cover — Buka Undangan
      </span>
      <span className="absolute inset-y-6 inset-x-4 rounded-lg border border-white/25" aria-hidden />
      {!bg && <span aria-hidden className="absolute inset-0 bg-black/20" />}
      <div className="relative">
        <p className="font-heading text-sm tracking-[0.3em] text-white/85 uppercase">{caption}</p>
        <p className="font-heading mt-2 text-2xl font-medium text-white">{names || 'Nama & Nama'}</p>
        <p className="mt-1 text-xs text-white/80">{typeof hero?.props.date === 'string' ? hero.props.date : ''}</p>
        <span className="mt-4 inline-block rounded-full bg-white/90 px-5 py-1.5 text-xs font-semibold text-[#4a443c] shadow-sm">
          {canvas.settings.cover_button_text || 'Buka Undangan'}
        </span>
      </div>
    </button>
  );
}

/** List blok mode stack — menyorot posisi target saat widget diseret dari sidebar. */
function StackList({ blocks, dimmed }: { blocks: Block[]; dimmed: boolean }) {
  const { over, active } = useDndContext();
  const isWidgetDrag = !!active && String(active.id).startsWith('widget-');
  const overId = over ? String(over.id) : null;
  return (
    <>
      <CoverPreview />
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
  const copyStyle = useBuilderStore((s) => s.copyStyle);
  const pasteStyle = useBuilderStore((s) => s.pasteStyle);
  const hasCopiedStyle = useBuilderStore((s) => s.copiedStyle !== null);

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
      {selected && <InnerDragLayer block={block} blockWidth={420} />}
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
            className="rounded p-1 text-white transition-colors hover:bg-[#c9a45c]/30"
            aria-label="Salin style blok"
            title="Salin style (Warna, border, radius, dll)"
            onClick={(e) => {
              e.stopPropagation();
              copyStyle(block.id);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" />
            </svg>
          </button>
          {hasCopiedStyle && (
            <button
              className="rounded p-1 text-white transition-colors hover:bg-[#c9a45c]/30"
              aria-label="Tempel style blok"
              title="Tempel style"
              onClick={(e) => {
                e.stopPropagation();
                pasteStyle(block.id);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="8" y="2" width="8" height="4" rx="1" />
                <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
              </svg>
            </button>
          )}
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
  const theme = useBuilderStore((s) => s.canvas.theme);
  const { setNodeRef } = useDroppable({ id: 'free-canvas' });
  const height = blocks.reduce((m, b) => (b.layout ? Math.max(m, b.layout.y) : m), 0) + 800;

  return (
    <ThemeContext.Provider value={theme}>
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
      <div className="relative h-64 w-full">
        <CoverPreview />
      </div>
      {blocks.map((block) => (
        <FreeBlock key={block.id} block={block} />
      ))}
      {blocks.length === 0 && (
        <div className="absolute left-0 top-0 flex h-64 w-full items-center justify-center p-10 text-center text-sm text-gray-400">
          Seret widget dari panel kiri ke sini, atau klik widget untuk menambah blok.
        </div>
      )}
      <GuestFrame mode={theme.frame} color={theme.secondary} fixed={false} enabled={!theme.card_style} />
    </div>
    </ThemeContext.Provider>
  );
}

/**
 * Fitur "geser elemen di dalam blok" (mode bebas saja): saat blok terpilih,
 * sub-elemen ber-`data-inner` diberi handle seret. Pergerakan disimpan ke
 * `block.inner` dan menampilkan alignment guide + snap ke tengah/tepi blok.
 */
function InnerDragLayer({ block, blockWidth }: { block: Block; blockWidth: number }) {
  const setBlockInner = useBuilderStore((s) => s.setBlockInner);
  const setInnerColor = useBuilderStore((s) => s.setInnerColor);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [handles, setHandles] = useState<{ name: string; left: number; top: number; width: number; height: number }[]>(
    []
  );
  const [guides, setGuides] = useState<{ x?: number; y?: number }>({});
  const [colorPickerName, setColorPickerName] = useState<string | null>(null);
  const dragStateRef = useRef<{
    name: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    hostW: number;
    hostH: number;
    nodeW: number;
    nodeH: number;
    rafId: number | null;
    lastDx: number;
    lastDy: number;
  } | null>(null);

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

    const current = block.inner?.[name] ?? { x: 0, y: 0 };
    const hostRect = host.getBoundingClientRect();
    const node = host.querySelector<HTMLElement>(`[data-inner="${name}"]`);
    const nodeRect = node?.getBoundingClientRect();

    dragStateRef.current = {
      name,
      startX: e.clientX,
      startY: e.clientY,
      origX: current.x,
      origY: current.y,
      hostW: blockWidth,
      hostH: hostRect.height,
      nodeW: nodeRect?.width ?? 100,
      nodeH: nodeRect?.height ?? 40,
      rafId: null,
      lastDx: 0,
      lastDy: 0
    };

    // Add will-change for GPU acceleration during drag
    if (node) {
      node.style.willChange = 'transform';
      node.style.transition = 'none';
    }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  function onMove(ev: PointerEvent) {
    const ds = dragStateRef.current;
    if (!ds) return;

    const dx = ev.clientX - ds.startX;
    const dy = ev.clientY - ds.startY;

    // Deadzone: don't start visual drag until 3px movement
    if (Math.abs(dx) <= 3 && Math.abs(dy) <= 3 && ds.lastDx === 0 && ds.lastDy === 0) return;

    ds.lastDx = dx;
    ds.lastDy = dy;

    // Cancel any pending RAF to avoid stacking
    if (ds.rafId !== null) cancelAnimationFrame(ds.rafId);

    ds.rafId = requestAnimationFrame(() => {
      let nx = ds.origX + dx;
      let ny = ds.origY + dy;

      const SNAP = 3;
      const cx = ds.hostW / 2;
      const cy = ds.hostH / 2;

      // Snap X
      const candX = [
        { v: 0 },
        { v: cx - ds.nodeW / 2 },
        { v: ds.hostW - ds.nodeW }
      ];
      let guideX: number | undefined;
      for (const c of candX) {
        if (Math.abs(nx - c.v) <= SNAP) {
          nx = c.v;
          guideX = c.v === 0 ? 0 : c.v === ds.hostW - ds.nodeW ? ds.hostW : cx;
          break;
        }
      }

      // Snap Y
      const candY = [
        { v: 0 },
        { v: cy - ds.nodeH / 2 },
        { v: ds.hostH - ds.nodeH }
      ];
      let guideY: number | undefined;
      for (const c of candY) {
        if (Math.abs(ny - c.v) <= SNAP) {
          ny = c.v;
          guideY = c.v === 0 ? 0 : c.v === ds.hostH - ds.nodeH ? ds.hostH : cy;
          break;
        }
      }

      // Direct DOM update for smoothness (bypass React render)
      const host = containerRef.current?.closest<HTMLElement>('[data-block]');
      const node = host?.querySelector<HTMLElement>(`[data-inner="${ds.name}"]`);
      if (node) {
        const clampedX = Math.max(-ds.nodeW + 8, Math.min(ds.hostW - 8, nx));
        const clampedY = Math.max(-ds.nodeH + 8, Math.min(ds.hostH - 8, ny));
        node.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
      }

      setGuides({ x: guideX, y: guideY });
    });
  }

  function onUp() {
    const ds = dragStateRef.current;
    if (!ds) return;

    if (ds.rafId !== null) cancelAnimationFrame(ds.rafId);

    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);

    // Read final position from DOM and commit to state
    const host = containerRef.current?.closest<HTMLElement>('[data-block]');
    const node = host?.querySelector<HTMLElement>(`[data-inner="${ds.name}"]`);
    if (node) {
      node.style.willChange = '';
      node.style.transition = '';
      // Parse the transform we applied
      const match = node.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
      if (match) {
        const finalX = parseFloat(match[1]);
        const finalY = parseFloat(match[2]);
        setBlockInner(block.id, ds.name, { x: finalX, y: finalY });
      }
    }

    // Update handles
    if (host) {
      const hostR = host.getBoundingClientRect();
      const nR = node?.getBoundingClientRect();
      if (nR) {
        setHandles((prev) =>
          prev.map((h) =>
            h.name === ds.name
              ? { ...h, left: nR.left - hostR.left, top: nR.top - hostR.top, width: nR.width, height: nR.height }
              : h
          )
        );
      }
    }

    setGuides({});
    dragStateRef.current = null;
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
          className="pointer-events-auto absolute z-30 cursor-grab touch-none border-2 border-dashed border-[#c9a45c]/60 bg-[#c9a45c]/5 active:cursor-grabbing"
          style={{ left: h.left, top: h.top, width: h.width, height: h.height }}
          onPointerDown={(e) => onDragStart(e, h.name)}
        >
          <span
            className="pointer-events-none absolute -top-5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-[#c9a45c] px-2.5 py-1 text-[11px] font-medium text-white shadow-lg ring-1 ring-white/30"
          >
            <GripVertical className="h-3.5 w-3.5" />
            {h.name}
          </span>
          <button
            className="pointer-events-auto absolute -top-4 right-0 flex h-5 w-5 -translate-y-0 translate-x-1/2 items-center justify-center rounded-full border border-white bg-white text-gray-500 shadow-md hover:text-[#c9a45c]"
            title={`Warna teks "${h.name}"`}
            onClick={(e) => {
              e.stopPropagation();
              setColorPickerName(colorPickerName === h.name ? null : h.name);
            }}
          >
            <Palette className="h-3 w-3" />
          </button>
          {colorPickerName === h.name && (
            <div className="pointer-events-auto absolute -bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-xl">
              {['', '#000000', '#ffffff', '#c9a45c', '#4a443c', '#8B4513', '#1a5276', '#6c3483'].map((c) => (
                <button
                  key={c || 'reset'}
                  className="h-5 w-5 rounded-full border-2 hover:scale-110"
                  style={{
                    backgroundColor: c || 'transparent',
                    borderColor: c ? c : '#ccc',
                    backgroundImage: !c ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)' : undefined,
                    backgroundSize: !c ? '6px 6px' : undefined,
                    backgroundPosition: !c ? '0 0, 3px 3px' : undefined
                  }}
                  title={c || 'Default'}
                  onClick={() => {
                    setInnerColor(block.id, h.name, c || undefined);
                    setColorPickerName(null);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function FreeBlock({ block }: { block: Block }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: block.id });
  const selected = useBuilderStore((s) => s.selectedBlockId === block.id);
  const selectBlock = useBuilderStore((s) => s.selectBlock);
  const copyBlock = useBuilderStore((s) => s.copyBlock);
  const pasteBlock = useBuilderStore((s) => s.pasteBlock);
  const canPaste = useBuilderStore((s) => s.copiedBlock !== null);
  const bringForward = useBuilderStore((s) => s.bringForward);
  const sendBackward = useBuilderStore((s) => s.sendBackward);
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
              aria-label="Salin blok"
              title="Salin (Ctrl+C)"
              onClick={(e) => {
                e.stopPropagation();
                copyBlock(block.id);
              }}
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              className="rounded p-1 text-white transition-colors hover:bg-[#c9a45c]/30 disabled:opacity-40"
              aria-label="Tempel blok"
              title="Tempel (Ctrl+V)"
              disabled={!canPaste}
              onClick={(e) => {
                e.stopPropagation();
                pasteBlock();
              }}
            >
              <ClipboardPaste className="h-3.5 w-3.5" />
            </button>
            <button
              className="rounded p-1 text-white transition-colors hover:bg-[#c9a45c]/30"
              aria-label="Maju satu lapis"
              title="Maju satu lapis"
              onClick={(e) => {
                e.stopPropagation();
                bringForward(block.id);
              }}
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              className="rounded p-1 text-white transition-colors hover:bg-[#c9a45c]/30"
              aria-label="Mundur satu lapis"
              title="Mundur satu lapis"
              onClick={(e) => {
                e.stopPropagation();
                sendBackward(block.id);
              }}
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
            <span className="mx-0.5 self-stretch border-l border-white/20" />
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