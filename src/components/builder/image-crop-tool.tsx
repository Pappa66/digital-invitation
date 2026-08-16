'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Check, Move } from 'lucide-react';

interface ImageCropToolProps {
  src: string;
  initialPosition?: string;
  initialFit?: string;
  onApply: (position: string, fit: string) => void;
  onClose: () => void;
}

/**
 * Interactive crop tool for hero background images.
 * Allows zoom, pan, and position selection before applying.
 */
export default function ImageCropTool({
  src,
  initialPosition = 'center',
  initialFit = 'cover',
  onApply,
  onClose
}: ImageCropToolProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPan, setLastPan] = useState({ x: 0, y: 0 });

  // Convert position keyword to percentage offsets
  const positionToPerc = useCallback((pos: string): { x: number; y: number } => {
    switch (pos) {
      case 'top': return { x: 50, y: 0 };
      case 'bottom': return { x: 50, y: 100 };
      case 'left': return { x: 0, y: 50 };
      case 'right': return { x: 100, y: 50 };
      case 'top left': return { x: 0, y: 0 };
      case 'top right': return { x: 100, y: 0 };
      case 'bottom left': return { x: 0, y: 100 };
      case 'bottom right': return { x: 100, y: 100 };
      default: return { x: 50, y: 50 };
    }
  }, []);

  // Convert percentage to nearest position keyword (or custom percentage)
  const percToPosition = useCallback((px: number, py: number): string => {
    const snap = 15;
    if (Math.abs(px - 50) <= snap && Math.abs(py - 50) <= snap) return 'center';
    if (Math.abs(px - 50) <= snap && py <= snap) return 'top';
    if (Math.abs(px - 50) <= snap && py >= 100 - snap) return 'bottom';
    if (px <= snap && Math.abs(py - 50) <= snap) return 'left';
    if (px >= 100 - snap && Math.abs(py - 50) <= snap) return 'right';
    if (px <= snap && py <= snap) return 'top left';
    if (px >= 100 - snap && py <= snap) return 'top right';
    if (px <= snap && py >= 100 - snap) return 'bottom left';
    if (px >= 100 - snap && py >= 100 - snap) return 'bottom right';
    // Fall back to custom percentage
    return `${Math.round(px)}% ${Math.round(py)}%`;
  }, []);

  // Initialize from position keyword
  useEffect(() => {
    const init = positionToPerc(initialPosition);
    setPanX((init.x - 50) * 2);
    setPanY((init.y - 50) * 2);
    setZoom(initialFit === 'contain' ? 0.8 : 1);
  }, [initialPosition, initialFit, positionToPerc]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setLastPan({ x: panX, y: panY });
  }, [panX, panY]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    const sensitivity = 1.5 / zoom;
    setPanX(Math.max(-100, Math.min(100, lastPan.x + dx * sensitivity)));
    setPanY(Math.max(-100, Math.min(100, lastPan.y + dy * sensitivity)));
  }, [isDragging, dragStart, lastPan, zoom]);

  const onPointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Calculate CSS object-position from pan values
  const currentPosX = 50 + panX / 2;
  const currentPosY = 50 + panY / 2;
  const positionStr = percToPosition(currentPosX, currentPosY);

  const previewStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: zoom > 1 ? 'cover' : 'contain',
    transform: `scale(${zoom}) translate(${panX / zoom}%, ${panY / zoom}%)`,
    objectPosition: 'center',
    transition: isDragging ? 'none' : 'transform 0.15s ease',
    cursor: isDragging ? 'grabbing' : 'grab'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative mx-4 flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Crop & Posisi Hero</h3>
            <p className="text-[10px] text-gray-400">Geser untuk memposisikan, scroll atau slider untuk zoom</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Preview */}
        <div
          ref={containerRef}
          className="relative mx-5 mt-4 aspect-[4/3] overflow-hidden rounded-xl border border-gray-200 bg-gray-100"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          style={{ touchAction: 'none' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="Crop preview" className="pointer-events-none select-none" style={previewStyle} />
          {/* Grid overlay */}
          <div className="pointer-events-none absolute inset-0">
            <div className="h-full w-1/3 border-r border-white/20" />
            <div className="absolute inset-0 h-full w-1/3 ml-1/3 border-r border-white/20" />
            <div className="h-1/3 w-full border-b border-white/20" />
            <div className="absolute inset-0 h-1/3 mt-1/3 w-full border-b border-white/20" />
          </div>
          {/* Center crosshair */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white/40">
            <Move className="h-6 w-6" />
          </div>
        </div>

        {/* Controls */}
        <div className="px-5 py-4">
          {/* Zoom slider */}
          <div className="mb-4 flex items-center gap-3">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="rounded-md border border-gray-200 p-1.5 hover:bg-gray-50"
            >
              <ZoomOut className="h-4 w-4 text-gray-600" />
            </button>
            <input
              type="range"
              min={50}
              max={200}
              value={zoom * 100}
              onChange={(e) => setZoom(parseInt(e.target.value) / 100)}
              className="flex-1 accent-[#c9a45c]"
            />
            <button
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              className="rounded-md border border-gray-200 p-1.5 hover:bg-gray-50"
            >
              <ZoomIn className="h-4 w-4 text-gray-600" />
            </button>
            <span className="w-10 text-center text-xs text-gray-500">{Math.round(zoom * 100)}%</span>
          </div>

          {/* Position display */}
          <div className="mb-4 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
            Posisi: <span className="font-medium text-gray-800">{positionStr}</span>
          </div>

          {/* Quick position buttons */}
          <div className="mb-4 grid grid-cols-3 gap-1">
            {[
              { label: '↖', pos: 'top left' },
              { label: '↑', pos: 'top' },
              { label: '↗', pos: 'top right' },
              { label: '←', pos: 'left' },
              { label: '●', pos: 'center' },
              { label: '→', pos: 'right' },
              { label: '↙', pos: 'bottom left' },
              { label: '↓', pos: 'bottom' },
              { label: '↘', pos: 'bottom right' }
            ].map((item) => (
              <button
                key={item.pos}
                onClick={() => {
                  const p = positionToPerc(item.pos);
                  setPanX((p.x - 50) * 2);
                  setPanY((p.y - 50) * 2);
                }}
                className={`rounded-md border py-1.5 text-sm font-medium transition ${
                  positionStr === item.pos
                    ? 'border-[#c9a45c] bg-[#c9a45c] text-white'
                    : 'border-gray-200 text-gray-600 hover:border-[#c9a45c]/50 hover:bg-[#c9a45c]/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setZoom(1);
                setPanX(0);
                setPanY(0);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              onClick={() => {
                onApply(positionStr, zoom > 1 ? 'cover' : zoom < 0.8 ? 'contain' : 'cover');
              }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              <Check className="h-3.5 w-3.5" /> Terapkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
