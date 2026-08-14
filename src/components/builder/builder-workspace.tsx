'use client';

import { useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragMoveEvent,
  type DragEndEvent
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { BlockType } from '@/lib/types';
import ElementsSidebar from '@/components/builder/elements-sidebar';
import BuilderCanvas from '@/components/builder/builder-canvas';
import PropertiesPanel from '@/components/builder/properties-panel';
import { useBuilderStore } from '@/store/builder-store';
import { saveCanvasNow } from '@/hooks/use-autosave';
import type { Device } from '@/components/ui/device-toggle';

const CANVAS_W = 420;
const CANVAS_W_DESKTOP = 900;

/**
 * Pembungkus workspace builder. DndContext diletakkan DI SINI agar
 * draggable dari ElementsSidebar (widget-*) terdaftar dalam konteks yang
 * sama dengan droppable kanvas — tanpa ini, seret widget putus di tengah.
 */
export default function BuilderWorkspace({ projectId }: { projectId: string }) {
  const canvas = useBuilderStore((s) => s.canvas);
  const [activeType, setActiveType] = useState<BlockType | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [device, setDevice] = useState<Device>('mobile');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const dragStartLayoutRef = useRef<Record<string, { x: number; y: number }>>({});
  const dragTranslatedRef = useRef<Record<string, { left: number; top: number }>>({});
  const freeCanvasRef = useRef<HTMLDivElement | null>(null);
  const [guides, setGuides] = useState<{ x?: number; y?: number }>({});

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
      const b = useBuilderStore.getState().canvas.blocks.find((x) => x.id === id);
      if (b?.layout) {
        dragStartLayoutRef.current[id] = { x: b.layout.x, y: b.layout.y };
      }
    }
  }

  function handleDragMove(event: DragMoveEvent) {
    const id = String(event.active.id);
    const r = event.active.rect.current.translated;
    if (r) dragTranslatedRef.current[id] = { left: r.left, top: r.top };

    if (flow === 'free' && !id.startsWith('widget-') && freeCanvasRef.current && r) {
      const cb = freeCanvasRef.current.getBoundingClientRect();
      const store = useBuilderStore.getState();
      const b = store.canvas.blocks.find((x) => x.id === id);
      if (!b?.layout) return;
      const x = Math.max(0, Math.min(canvasW - 40, r.left - cb.left));
      const y = Math.max(0, r.top - cb.top);
      const width = b.layout.width;
      const SNAP = 8;
      const cx = canvasW / 2;

      let guideX: number | undefined;
      for (const [tx, kind] of [
        [cx - width / 2, 'center'],
        [0, 'left'],
        [canvasW - width, 'right']
      ] as [number, string][]) {
        if (Math.abs(x - tx) <= SNAP) {
          guideX = kind === 'center' ? cx : tx;
          break;
        }
      }

      let guideY: number | undefined;
      for (const [ty, kind] of [
        [cb.height / 2, 'center'],
        [0, 'top']
      ] as [number, string][]) {
        if (Math.abs(y - ty) <= SNAP) {
          guideY = kind === 'center' ? ty : ty;
          break;
        }
      }

      setGuides({ x: guideX, y: guideY });
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveType(null);
    const activeString = String(active.id);
    const overString = over ? String(over.id) : null;
    const store = useBuilderStore.getState();
    setGuides({});

    if (activeString.startsWith('widget-')) {
      const type = activeString.replace('widget-', '') as BlockType;
      if (flow === 'free') {
        const rect = dragTranslatedRef.current[activeString];
        store.addBlock(type);
        const newId = store.selectedBlockId;
        if (newId && rect && freeCanvasRef.current) {
          const cb = freeCanvasRef.current.getBoundingClientRect();
          store.setBlockLayout(newId, {
            x: Math.max(0, Math.min(canvasW - 40, rect.left - cb.left)),
            y: Math.max(0, rect.top - cb.top)
          });
        }
      } else if (!overString) {
        store.addBlock(type);
      } else {
        const overIndex = store.canvas.blocks.findIndex((b) => b.id === overString);
        store.addBlock(type, overIndex === -1 ? undefined : overIndex);
      }
      triggerSave();
      return;
    }

    if (flow === 'free') {
      const rect = dragTranslatedRef.current[activeString];
      if (rect && freeCanvasRef.current) {
        const cb = freeCanvasRef.current.getBoundingClientRect();
        const b = store.canvas.blocks.find((x) => x.id === activeString);
        const width = b?.layout?.width ?? 420;
        const x = Math.max(0, Math.min(canvasW - 40, rect.left - cb.left));
        const y = Math.max(0, rect.top - cb.top);
        const SNAP = 8;
        const cx = canvasW / 2;
        const targetX = (() => {
          if (Math.abs(x - (cx - width / 2)) <= SNAP) return cx - width / 2;
          if (Math.abs(x - 0) <= SNAP) return 0;
          if (Math.abs(x - (canvasW - width)) <= SNAP) return canvasW - width;
          return x;
        })();
        store.setBlockLayout(activeString, { x: targetX, y });
      } else {
        const start = dragStartLayoutRef.current[activeString];
        const b = store.canvas.blocks.find((x) => x.id === activeString);
        if (b && start) {
          store.setBlockLayout(activeString, {
            x: Math.max(0, Math.min(canvasW - 40, start.x + event.delta.x)),
            y: Math.max(0, start.y + event.delta.y)
          });
        }
      }
      setGuides({});
      triggerSave();
      return;
    }

    if (!overString || activeString === overString) return;
    const from = store.canvas.blocks.findIndex((b) => b.id === activeString);
    const to = store.canvas.blocks.findIndex((b) => b.id === overString);
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
    <div className="flex min-h-0 flex-1">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <ElementsSidebar />
        <BuilderCanvas
          projectId={projectId}
          activeType={activeType}
          device={device}
          onDeviceChange={setDevice}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid((v) => !v)}
          freeCanvasRef={freeCanvasRef}
          saveState={saveState}
          guides={guides}
        />
        <PropertiesPanel />

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
  );
}
