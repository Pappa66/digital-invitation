'use client';

import { useRef } from 'react';
import { createUsePuck } from '@puckeditor/core';
import type { Position } from '@/puck/types';
import type { config } from '@/puck/config';
import { initialAbsoluteFromRect, setComponentPosition } from './position-utils';

const usePuckStore = createUsePuck<typeof config>();

interface ComponentOverlayProps {
  children: React.ReactNode;
  hover?: boolean;
  isSelected?: boolean;
  componentId: string;
  componentType: string;
}

/**
 * Override `componentOverlay` Puck: memberi bingkai + drag bebas pada komponen
 * yang sedang terpilih. Drag pertama mengubah mode flow → absolute tanpa lompat,
 * lalu memperbarui `position` lewat setData (imutabel).
 * Butuh iframe preview dimatikan (lihat editor) agar koordinat/event seragam.
 */
export default function ComponentOverlay({ children, isSelected, componentId, componentType }: ComponentOverlayProps) {
  const ref = useRef<HTMLDivElement>(null);
  const dispatch = usePuckStore((s) => s.dispatch);
  const getItemById = usePuckStore((s) => s.getItemById);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!isSelected) return;
    const target = e.target as HTMLElement;
    if (target.closest('input, textarea, select, button, a')) return;

    const wrapper = ref.current;
    const canvas = document.querySelector('.poc-canvas') as HTMLElement | null;
    if (!wrapper || !canvas) return;

    const item = getItemById(componentId) as { props?: { position?: Position } } | undefined;
    const pos = item?.props?.position;
    const measured = wrapper.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    const startX = e.clientX;
    const startY = e.clientY;
    const origin =
      pos?.mode === 'absolute'
        ? { x: pos.x, y: pos.y }
        : { x: Math.round(measured.left - canvasRect.left), y: Math.round(measured.top - canvasRect.top) };

    if (pos?.mode !== 'absolute') {
      dispatch({
        type: 'setData',
        data: (prev) => setComponentPosition(prev, componentId, initialAbsoluteFromRect(measured, canvasRect))
      });
    }

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }

    const onMove = (ev: PointerEvent) => {
      const nx = Math.max(0, origin.x + (ev.clientX - startX));
      const ny = Math.max(0, origin.y + (ev.clientY - startY));
      dispatch({
        type: 'setData',
        data: (prev) => setComponentPosition(prev, componentId, { mode: 'absolute', x: nx, y: ny })
      });
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  return (
    <div
      ref={ref}
      data-poc-overlay={componentType}
      onPointerDown={handlePointerDown}
      style={isSelected ? { outline: '2px dashed #c9a45c', outlineOffset: 2, cursor: 'move' } : undefined}
    >
      {children}
    </div>
  );
}
