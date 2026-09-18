'use client';

import { useEffect, useRef, useState } from 'react';
import { ImageIcon, Plus, Upload } from 'lucide-react';
import type { DecorAsset } from '@/lib/types';
import { DecorAssetView } from '@/components/guest/blocks';
import { CANVAS_STICKER_SCOPE, useBuilderStore } from '@/store/builder-store';
import { STICKER_PRESETS } from '@/lib/stickers/presets';
import { DESIGN_WIDTH } from '@/components/ui/device-toggle';

function stickerUid() {
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function DecorNode({ asset }: { asset: DecorAsset }) {
  const flip = `${asset.flipX ? ' scaleX(-1)' : ''}${asset.flipY ? ' scaleY(-1)' : ''}`;
  const transform = `${asset.rotation ? `rotate(${asset.rotation}deg)` : ''}${flip}`;
  return (
    <div
      className="absolute"
      style={{
        left: asset.x,
        top: asset.y,
        transform: transform || undefined,
        zIndex: (asset.layer ?? 0) + 50
      }}
    >
      <DecorAssetView asset={asset} />
    </div>
  );
}

/** Render sticker kanvas (mode tamu — pasif). */
export function CanvasStickersGuest({ stickers }: { stickers?: DecorAsset[] }) {
  if (!stickers?.length) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-[15] overflow-visible">
      {stickers.map((asset) => (
        <DecorNode key={asset.id} asset={asset} />
      ))}
    </div>
  );
}

/** Editor sticker kanvas penuh (mode builder). */
export function CanvasStickersBuilder({ stickers }: { stickers?: DecorAsset[] }) {
  const selectedDecor = useBuilderStore((s) => s.selectedDecor);
  const selectDecor = useBuilderStore((s) => s.selectDecor);
  const selectBlock = useBuilderStore((s) => s.selectBlock);
  const updateCanvasSticker = useBuilderStore((s) => s.updateCanvasSticker);
  const removeCanvasSticker = useBuilderStore((s) => s.removeCanvasSticker);
  const addCanvasSticker = useBuilderStore((s) => s.addCanvasSticker);
  const [menuOpen, setMenuOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    w: number;
    h: number;
  } | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const items = stickers ?? [];
  const isSelected = (id: string) => selectedDecor === `${CANVAS_STICKER_SCOPE}::${id}`;

  function addFromPreset(preset: (typeof STICKER_PRESETS)[number]) {
    addCanvasSticker({
      id: stickerUid(),
      kind: 'image',
      imageUrl: preset.url,
      width: preset.width,
      height: preset.height,
      x: Math.max(0, Math.round((DESIGN_WIDTH - preset.width) / 2)),
      y: 80,
      opacity: 1,
      layer: 2
    });
    setMenuOpen(false);
  }

  function addEmptyUpload() {
    addCanvasSticker({
      id: stickerUid(),
      kind: 'image',
      imageUrl: '',
      width: 120,
      height: 120,
      x: 140,
      y: 120,
      opacity: 1,
      layer: 2
    });
    setMenuOpen(false);
  }

  function startDrag(e: React.PointerEvent, asset: DecorAsset) {
    e.stopPropagation();
    e.preventDefault();
    selectBlock(null);
    selectDecor(`${CANVAS_STICKER_SCOPE}::${asset.id}`);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dragRef.current = {
      id: asset.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: asset.x,
      origY: asset.y,
      w: rect.width,
      h: rect.height
    };
    setDraggingId(asset.id);
  }

  useEffect(() => {
    if (!dragRef.current) return;
    const onMove = (ev: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const host = boxRef.current;
      const hostH = host?.offsetHeight ?? 2000;
      const nx = Math.max(0, Math.min(DESIGN_WIDTH - 20, d.origX + (ev.clientX - d.startX)));
      const ny = Math.max(0, Math.min(hostH - 20, d.origY + (ev.clientY - d.startY)));
      updateCanvasSticker(d.id, { x: Math.round(nx), y: Math.round(ny) });
    };
    const onUp = () => {
      dragRef.current = null;
      setDraggingId(null);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [draggingId, updateCanvasSticker]);

  return (
    <div ref={boxRef} className="pointer-events-none absolute inset-0 z-[25] overflow-visible">
      {items.map((asset) => (
        <div
          key={asset.id}
          data-sticker
          className={`pointer-events-auto absolute cursor-move ${isSelected(asset.id) ? 'outline-2 outline-dashed outline-[#c9a45c] outline-offset-1' : ''}`}
          style={{
            left: asset.x,
            top: asset.y,
            transform: asset.rotation ? `rotate(${asset.rotation}deg)` : undefined,
            zIndex: (asset.layer ?? 0) + 100
          }}
          onPointerDown={(e) => startDrag(e, asset)}
        >
          <DecorAssetView asset={asset} />
          {isSelected(asset.id) && (
            <button
              type="button"
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white shadow"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                removeCanvasSticker(asset.id);
              }}
            >
              ✕
            </button>
          )}
        </div>
      ))}

      <div className="pointer-events-auto absolute right-2 top-2 z-[200]">
        {menuOpen ? (
          <div className="w-52 rounded-lg border border-[#e7ddcc] bg-[#fffdf8] p-2 shadow-xl">
            <p className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#b39a65]">Sticker / Gambar PNG</p>
            <div className="grid grid-cols-3 gap-1">
              {STICKER_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  title={p.label}
                  onClick={() => addFromPreset(p)}
                  className="flex flex-col items-center gap-0.5 rounded-md border border-[#eee4cf] bg-white p-1 hover:border-[#c9a45c]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt="" className="h-10 w-10 object-contain" />
                  <span className="truncate text-[8px] text-[#6b5f4d]">{p.label}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={addEmptyUpload}
              className="mt-2 flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-[#c9a45c] px-2 py-1.5 text-[10px] font-medium text-[#8a6d2f] hover:bg-[#c9a45c]/10"
            >
              <Upload className="h-3 w-3" /> Upload PNG (panel kanan)
            </button>
            <button type="button" onClick={() => setMenuOpen(false)} className="mt-1 w-full rounded-md bg-[#6b5f4d] py-1 text-[10px] text-white">
              Tutup
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex items-center gap-1 rounded-full border border-[#c9a45c] bg-[#fffdf8]/95 px-2.5 py-1.5 text-[10px] font-semibold text-[#8a6d2f] shadow-md backdrop-blur hover:bg-[#c9a45c]/10"
          >
            <Plus className="h-3.5 w-3.5" />
            <ImageIcon className="h-3.5 w-3.5" />
            Sticker
          </button>
        )}
      </div>
    </div>
  );
}

/** Layer sticker: builder interaktif atau guest pasif. */
export default function CanvasStickerLayer({ stickers, editable = false }: { stickers?: DecorAsset[]; editable?: boolean }) {
  if (editable) return <CanvasStickersBuilder stickers={stickers} />;
  return <CanvasStickersGuest stickers={stickers} />;
}
