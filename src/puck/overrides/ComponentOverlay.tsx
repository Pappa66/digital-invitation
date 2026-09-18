'use client';

import { useEffect, useRef } from 'react';
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
 * Override `componentOverlay` Puck. Drag & outline dipasang pada overlayWrapper
 * (parent ref, berisi komponen) di fase capture pada `document`, agar tidak
 * direbut DnD bawaan Puck. Mendukung pointer & mouse events.
 */
export default function ComponentOverlay({ children, isSelected, componentId, componentType }: ComponentOverlayProps) {
  const ref = useRef<HTMLDivElement>(null);
  const dispatch = usePuckStore((s) => s.dispatch);
  const getItemById = usePuckStore((s) => s.getItemById);

  useEffect(() => {
    if (!isSelected) return;
    const el = ref.current?.parentElement as HTMLElement | null;
    if (!el) return;

    el.style.outline = '2px dashed #c9a45c';
    el.style.outlineOffset = '2px';
    el.style.touchAction = 'none';
    el.classList.add('puck-selected-wrapper');

    const doc = el.ownerDocument;
    const win = doc.defaultView ?? window;
    let lastPointerAt = 0;

    const beginDrag = (clientX: number, clientY: number) => {
      const canvas = doc.querySelector('.invitation-canvas') as HTMLElement | null;
      if (!canvas) return;
      const item = getItemById(componentId) as { props?: { position?: Position } } | undefined;
      const pos = item?.props?.position;
      const measured = el.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      const origin =
        pos?.mode === 'absolute'
          ? { x: pos.x, y: pos.y }
          : { x: Math.round(measured.left - canvasRect.left), y: Math.round(measured.top - canvasRect.top) };

      if (pos?.mode !== 'absolute') {
        dispatch({ type: 'setData', data: (prev) => setComponentPosition(prev, componentId, initialAbsoluteFromRect(measured, canvasRect)) });
      }

      const onMove = (ev: PointerEvent | MouseEvent) => {
        const nx = Math.max(0, origin.x + (ev.clientX - clientX));
        const ny = Math.max(0, origin.y + (ev.clientY - clientY));
        dispatch({ type: 'setData', data: (prev) => setComponentPosition(prev, componentId, { mode: 'absolute', x: nx, y: ny }) });
      };
      const onUp = () => {
        win.removeEventListener('pointermove', onMove);
        win.removeEventListener('pointerup', onUp);
        win.removeEventListener('mousemove', onMove);
        win.removeEventListener('mouseup', onUp);
      };
      win.addEventListener('pointermove', onMove);
      win.addEventListener('pointerup', onUp);
      win.addEventListener('mousemove', onMove);
      win.addEventListener('mouseup', onUp);
    };

    const guard = (e: Event) => {
      if (!el.contains(e.target as Node)) return false;
      if ((e.target as HTMLElement).closest('input, textarea, select, button, a')) return false;
      e.stopPropagation();
      e.preventDefault();
      return true;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!guard(e)) return;
      lastPointerAt = Date.now();
      beginDrag(e.clientX, e.clientY);
    };
    const onMouseDown = (e: MouseEvent) => {
      if (Date.now() - lastPointerAt < 400) return; // pointerdown sudah menangani
      if (!guard(e)) return;
      beginDrag(e.clientX, e.clientY);
    };

    doc.addEventListener('pointerdown', onPointerDown, true);
    doc.addEventListener('mousedown', onMouseDown, true);
    return () => {
      doc.removeEventListener('pointerdown', onPointerDown, true);
      doc.removeEventListener('mousedown', onMouseDown, true);
      el.style.outline = '';
      el.style.outlineOffset = '';
      el.style.touchAction = '';
      el.classList.remove('puck-selected-wrapper');
    };
  }, [isSelected, componentId, dispatch, getItemById]);

  return (
    <div ref={ref} data-invitation-overlay={componentType}>
      {children}
    </div>
  );
}
