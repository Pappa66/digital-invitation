'use client';

import { create } from 'zustand';
import { temporal } from 'zundo';
import { useSyncExternalStore } from 'react';
import type { Block, BlockLayout, BlockProps, BlockStyle, BlockType, CanvasData, DecorAsset, Settings, Theme } from '@/lib/types';
import { emptyCanvas } from '@/lib/templates';
import { getReligion, isKnownDefault, type ReligionKey } from '@/lib/religions';

/** Sentinel selectedBlockId untuk seleksi cover "Buka Undangan" di kanvas. */
export const COVER_BLOCK_ID = '__cover__';

interface BuilderState {
  canvas: CanvasData;
  selectedBlockId: string | null;
  /** Elemen teks yang sedang difokus di kanvas (kunci = `${prop}` atau `${prop}.${index}`). */
  selectedText: string | null;
  /** Asset dekor yang sedang dipilih dalam blok ("${blockId}::${decorId}"). */
  selectedDecor: string | null;
  initialized: boolean;
  /** Project id terakhir yang dimuat lewat init(), agar ganti project bisa dimuat ulang. */
  lastProjectId: string | null;
  /** Blok yang disalin pengguna (clipboard internal builder). */
  copiedBlock: Block | null;
  /** Style blok yang disalin (copy/paste style antar blok). */
  copiedStyle: BlockStyle | null;

  init: (data: CanvasData, projectToken?: string) => void;
  setTheme: (theme: Partial<Theme>) => void;
  setSettings: (settings: Partial<Settings>) => void;
  setReligion: (religion: ReligionKey) => void;
  setBlockProps: (blockId: string, props: Partial<BlockProps>) => void;
  setBlockLayout: (blockId: string, partial: Partial<BlockLayout>) => void;
  setBlockStyle: (blockId: string, partial: Partial<BlockStyle>) => void;
  clearBlockStyle: (blockId: string) => void;
  /** Set ukuran font override per elemen teks. size kosong = reset ke default. */
  setBlockTextSize: (blockId: string, key: string, size: string) => void;
  setBlockTextFont: (blockId: string, key: string, font: string) => void;
  /** Tandai elemen teks yang sedang difokus (kunci `${prop}.${index}` atau `${prop}`). */
  setSelectedText: (key: string | null) => void;
  setBlockInner: (blockId: string, key: string, pos: { x: number; y: number }) => void;
  setInnerColor: (blockId: string, key: string, color: string | undefined) => void;
  addDecor: (blockId: string, asset: DecorAsset) => void;
  updateDecor: (blockId: string, decorId: string, partial: Partial<DecorAsset>) => void;
  removeDecor: (blockId: string, decorId: string) => void;
  selectDecor: (key: string | null) => void;
  setFlow: (flow: 'stack' | 'free') => void;
  addBlock: (type: BlockType, index?: number) => void;
  removeBlock: (blockId: string) => void;
  duplicateBlock: (blockId: string) => void;
  reorderBlock: (activeId: string, overId: string) => void;
  /** Salin blok ke clipboard internal (tanpa mengubah kanvas). */
  copyBlock: (blockId: string) => void;
  /** Tempel blok dari clipboard internal ke akhir kanvas. Valah tanpa isi clipboard. */
  pasteBlock: () => void;
  /** Salin style blok (border/radius/shadow/dll) untuk ditempel ke blok lain. */
  copyStyle: (blockId: string) => void;
  /** Tempel style ke blok target. */
  pasteStyle: (blockId: string) => void;
  /** Pindah satu langkah ke depan dalam urutan (z-index naik di mode free). */
  bringForward: (blockId: string) => void;
  /** Pindah satu langkah ke belakang dalam urutan (z-index turun di mode free). */
  sendBackward: (blockId: string) => void;
  /** Pindah ke paling depan. */
  bringToFront: (blockId: string) => void;
  /** Pindah ke paling belakang. */
  sendToBack: (blockId: string) => void;
  selectBlock: (blockId: string | null) => void;
  reset: () => void;
}

function uid() {
  return `b-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const BLOCK_PRESETS: Record<BlockType, Block> = {
  Hero: {
    id: '',
    type: 'Hero',
    props: {
      groom: 'Nama Pria',
      bride: 'Nama Wanita',
      date: 'Minggu, 1 Januari 2027',
      place: 'Tempat Acara',
      caption: 'The Wedding of',
      bg_image: '',
      show_ornament: true,
      variant: 'center'
    }
  },
  Couple: {
    id: '',
    type: 'Couple',
    props: {
      introduction: 'Dengan penuh rasa syukur',
      bismillah: '',

      groom: 'Nama Pria',
      groom_parents: 'Putra dari Bpk. & Ibu',
      bride: 'Nama Wanita',
      bride_parents: 'Putri dari Bpk. & Ibu',
      quote: '',
      variant: 'vertical'
    }
  },
  Countdown: {
    id: '',
    type: 'Countdown',
    props: {
      target_date: '2027-01-01T08:00:00+07:00',
      title: 'Menghitung Hari',
      variant: 'circles'
    }
  },
  Story: {
    id: '',
    type: 'Story',
    props: {
      title: 'Our Story',
      subtitle: 'Perjalanan cinta kami',
      ev_title: ['Pertemuan Pertama', 'Menjadi Pasangan', 'Lamaran'],
      ev_date: ['2019', '2022', '2025'],
      ev_desc: [
        'Ceritakan bagaimana kalian bertemu pertama kali.',
        'Ceritakan momen jadi sepasang kekasih.',
        'Ceritakan kisah lamaran yang tak terlupakan.'
      ]
    }
  },
  EventDetail: {
    id: '',
    type: 'EventDetail',
    props: {
      title: 'Akad Nikah',
      icon: 'rings',
      date: 'Minggu, 1 Januari 2027',
      time: '08.00 - 10.00 WIB',
      location: 'Nama Venue',
      address: 'Alamat Lengkap',
      maps_url: '',
      variant: 'card'
    }
  },
  Gallery: {
    id: '',
    type: 'Gallery',
    props: {
      title: 'Galeri',
      images: [],
      variant: 'grid',
      animation: 'fade',
      interval_sec: 3
    }
  },
  RSVP: {
    id: '',
    type: 'RSVP',
    props: {
      title: 'Konfirmasi Kehadiran',
      note: 'Mohon konfirmasi sebelum hari H',
      deadline: '2026-12-25',
      button_text: 'Kirim Konfirmasi',
      success_message: 'Terima kasih atas konfirmasinya.'
    }
  },
  Envelope: {
    id: '',
    type: 'Envelope',
    props: {
      title: 'Amplop Online',
      note: 'Apabila ingin mengirimkan tanda kasih, doa restu dapat disalurkan melalui rekening berikut.',
      accounts: [],
      gift_registry_enabled: false,
      gift_items: []
    }
  },
  Maps: {
    id: '',
    type: 'Maps',
    props: {
      title: 'Lokasi Acara',
      address: '',
      embed_url: ''
    }
  },
  Thanks: {
    id: '',
    type: 'Thanks',
    props: {
      title: 'Doa Restu',
      message: '',
      closing: 'Kami yang berbahagia',
      names: ''
    }
  },
  Divider: {
    id: '',
    type: 'Divider',
    props: {
      variant: 'line'
    }
  },
  Text: {
    id: '',
    type: 'Text',
    props: {
      text: 'Tulis teks di sini',
      align: 'center'
    }
  },
  Photo: {
    id: '',
    type: 'Photo',
    props: {
      image: '',
      caption: '',
      rounded: true
    }
  },
  GiftList: {
    id: '',
    type: 'GiftList',
    props: {
      title: 'Daftar Kado',
      note: '',
      items: ['Amplop / tanda kasih', 'Perlengkapan rumah tangga', 'Gift / yang bermanfaat']
    }
  },
  Quote: {
    id: '',
    type: 'Quote',
    props: {
      religion: 'islam',
      original: '',
      latin: '',
      translation: '',
      reference: ''
    }
  },
  LiveStreaming: {
    id: '',
    type: 'LiveStreaming',
    props: {
      title: 'Siaran Langsung',
      stream_url: '',
      platform: 'youtube',
      note: 'Saksikan secara langsung melalui tautan berikut.'
    }
  },
  Watermark: {
    id: '',
    type: 'Watermark',
    props: {
      text: 'Made with Love by',
      brand: '',
      url: 'https://prashadigitalindonesia.com'
    }
  },
  Popup: {
    id: '',
    type: 'Popup',
    props: {
      button_text: 'Buka Popup',
      title: 'Informasi Penting',
      mode: 'content',
      content: 'Tulis isi popup di sini (protokol kesehatan, info acara, dsb.).',
      image: '',
      link_url: ''
    }
  },
  CopyText: {
    id: '',
    type: 'CopyText',
    props: {
      title: 'Amplop Online',
      note: 'Salin nomor rekening lalu tempel di aplikasi bank Anda.',
      text_to_copy: '',
      button_text: 'Salin'
    }
  },
  Empty: {
    id: '',
    type: 'Empty',
    props: {}
  }
};

export const useBuilderStore = create<BuilderState>()(
  temporal(
    (set, get) => ({
      canvas: emptyCanvas(),
      selectedBlockId: null,
      selectedText: null,
selectedDecor: null,
  initialized: false,
  lastProjectId: '',
  copiedBlock: null,
  copiedStyle: null,

  init: (data, projectToken) => {
    const token = projectToken ?? '';
    if (get().initialized && get().lastProjectId === token) return;
    const canvas = structuredClone(data);
    if (!canvas.flow) canvas.flow = 'stack';
    set({
      canvas,
      initialized: true,
      lastProjectId: token,
      selectedBlockId: null
    });
    // Muat awal bukan aksi user — buang history agar undo dimulai dari state ini.
    useBuilderStore.temporal.getState().clear();
  },

  setTheme: (theme) =>
    set((state) => ({
      canvas: { ...state.canvas, theme: { ...state.canvas.theme, ...theme } }
    })),

  setSettings: (settings) =>
    set((state) => ({
      canvas: { ...state.canvas, settings: { ...state.canvas.settings, ...settings } }
    })),

  /**
   * Ganti agama undangan: update settings.religion dan rombak wording religius
   * di blok (bismillah di Couple, closing di Thanks) HANYA jika masih bernilai
   * default — teks kustom pengguna dipertahankan.
   */
  setReligion: (religion) =>
    set((state) => {
      const cfg = getReligion(religion);
      const blocks = state.canvas.blocks.map((b) => {
        const next = { ...b.props };
        let changed = false;
        if (b.type === 'Couple' && typeof next.bismillah === 'string') {
          const v = next.bismillah;
          if (cfg.invitation.bismillah ? isKnownDefault('bismillah', v) : !!v) {
            next.bismillah = cfg.invitation.bismillah;
            changed = true;
          }
        }
        if (b.type === 'Thanks' && typeof next.closing === 'string') {
          const v = next.closing;
          if (cfg.invitation.closing ? isKnownDefault('closing', v) : !!v) {
            next.closing = cfg.invitation.closing;
            changed = true;
          }
        }
        return changed ? { ...b, props: next } : b;
      });
      return {
        canvas: {
          ...state.canvas,
          settings: { ...state.canvas.settings, religion },
          blocks
        }
      };
    }),

  setBlockProps: (blockId, props) =>
    set((state) => ({
      canvas: {
        ...state.canvas,
        blocks: state.canvas.blocks.map((b) =>
          b.id === blockId ? { ...b, props: { ...b.props, ...props } } : b
        )
      }
    })),

  setBlockLayout: (blockId, partial) =>
    set((state) => ({
      canvas: {
        ...state.canvas,
        blocks: state.canvas.blocks.map((b) =>
          b.id === blockId
            ? { ...b, layout: { ...(b.layout ?? { x: 0, y: 0, width: 420 }), ...partial } }
            : b
        )
      }
    })),

  setBlockStyle: (blockId, partial) =>
    set((state) => ({
      canvas: {
        ...state.canvas,
        blocks: state.canvas.blocks.map((b) =>
          b.id === blockId ? { ...b, style: { ...(b.style ?? {}), ...partial } } : b
        )
      }
    })),

  clearBlockStyle: (blockId) =>
    set((state) => ({
      canvas: {
        ...state.canvas,
        blocks: state.canvas.blocks.map((b) => (b.id === blockId ? { ...b, style: undefined } : b))
      }
    })),

  setBlockTextSize: (blockId, key, size) =>
    set((state) => ({
      canvas: {
        ...state.canvas,
        blocks: state.canvas.blocks.map((b) => {
          if (b.id !== blockId) return b;
          const next = { ...(b.style?.textSizes ?? {}) };
          if (size) next[key] = size;
          else delete next[key];
          return { ...b, style: { ...(b.style ?? {}), textSizes: next } };
        })
      }
    })),

  setBlockTextFont: (blockId, key, font) =>
    set((state) => ({
      canvas: {
        ...state.canvas,
        blocks: state.canvas.blocks.map((b) => {
          if (b.id !== blockId) return b;
          const next = { ...(b.style?.textFonts ?? {}) };
          if (font) next[key] = font;
          else delete next[key];
          return { ...b, style: { ...(b.style ?? {}), textFonts: next } };
        })
      }
    })),

  setSelectedText: (key) => set({ selectedText: key }),

  setBlockInner: (blockId, key, pos) =>
    set((state) => ({
      canvas: {
        ...state.canvas,
        blocks: state.canvas.blocks.map((b) =>
          b.id === blockId ? { ...b, inner: { ...(b.inner ?? {}), [key]: pos } } : b
        )
      }
    })),

  setInnerColor: (blockId, key, color) =>
    set((state) => ({
      canvas: {
        ...state.canvas,
        blocks: state.canvas.blocks.map((b) => {
          if (b.id !== blockId) return b;
          const prev = b.inner ?? {};
          const elem = prev[key] ?? { x: 0, y: 0 };
          return { ...b, inner: { ...prev, [key]: { ...elem, color } } };
        })
      }
    })),

  addDecor: (blockId, asset) =>
    set((state) => ({
      canvas: {
        ...state.canvas,
        blocks: state.canvas.blocks.map((b) =>
          b.id === blockId ? { ...b, decor: [...(b.decor ?? []), asset] } : b
        )
      },
      selectedDecor: `${blockId}::${asset.id}`
    })),

  updateDecor: (blockId, decorId, partial) =>
    set((state) => ({
      canvas: {
        ...state.canvas,
        blocks: state.canvas.blocks.map((b) =>
          b.id === blockId
            ? {
                ...b,
                decor: (b.decor ?? []).map((d) => (d.id === decorId ? { ...d, ...partial } : d))
              }
            : b
        )
      }
    })),

  removeDecor: (blockId, decorId) =>
    set((state) => ({
      canvas: {
        ...state.canvas,
        blocks: state.canvas.blocks.map((b) =>
          b.id === blockId ? { ...b, decor: (b.decor ?? []).filter((d) => d.id !== decorId) } : b
        )
      },
      selectedDecor: state.selectedDecor === `${blockId}::${decorId}` ? null : state.selectedDecor
    })),

  selectDecor: (key) => set({ selectedDecor: key }),

  setFlow: (flow) => set((state) => ({ canvas: { ...state.canvas, flow } })),

  addBlock: (type, index) =>
    set((state) => {
      const block: Block = { ...BLOCK_PRESETS[type], id: uid() };
      // Auto-fill brand for Watermark from localStorage
      if (type === 'Watermark') {
        try {
          const bn = localStorage.getItem('di_business_name');
          if (bn) block.props = { ...block.props, brand: bn };
        } catch { /* ignore */ }
      }
      const flow = state.canvas.flow ?? 'stack';
      if (flow === 'free') {
        const maxY = state.canvas.blocks.reduce((m, b) => (b.layout ? Math.max(m, b.layout.y) : m), 0);
        block.layout = { x: 0, y: maxY + 24, width: 420 };
      }
      const blocks = [...state.canvas.blocks];
      const at = index ?? blocks.length;
      blocks.splice(at, 0, block);
      return {
        canvas: { ...state.canvas, blocks },
        selectedBlockId: block.id
      };
    }),

  removeBlock: (blockId) =>
    set((state) => ({
      canvas: {
        ...state.canvas,
        blocks: state.canvas.blocks.filter((b) => b.id !== blockId)
      },
      selectedBlockId: state.selectedBlockId === blockId ? null : state.selectedBlockId,
      selectedDecor: state.selectedDecor?.startsWith(`${blockId}::`) ? null : state.selectedDecor
    })),

  duplicateBlock: (blockId) =>
    set((state) => {
      const idx = state.canvas.blocks.findIndex((b) => b.id === blockId);
      if (idx === -1) return state;
      const src = state.canvas.blocks[idx];
      const copy: Block = {
        ...src,
        id: uid(),
        props: { ...src.props },
        layout: src.layout ? { ...src.layout } : undefined,
        style: src.style
          ? {
              ...src.style,
              textSizes: src.style.textSizes ? { ...src.style.textSizes } : undefined,
              textFonts: src.style.textFonts ? { ...src.style.textFonts } : undefined
            }
          : undefined,
        inner: src.inner ? { ...src.inner } : null,
        decor: src.decor ? src.decor.map((d) => ({ ...d, id: uid() })) : undefined
      };
      const blocks = [...state.canvas.blocks];
      blocks.splice(idx + 1, 0, copy);
      return {
        canvas: { ...state.canvas, blocks },
        selectedBlockId: copy.id,
        selectedDecor: null
      };
    }),

  reorderBlock: (activeId, overId) =>
    set((state) => {
      const blocks = [...state.canvas.blocks];
      const from = blocks.findIndex((b) => b.id === activeId);
      const to = blocks.findIndex((b) => b.id === overId);
      if (from === -1 || to === -1) return state;
      const [moved] = blocks.splice(from, 1);
      blocks.splice(to, 0, moved);
      return { canvas: { ...state.canvas, blocks } };
    }),

  copyBlock: (blockId) =>
    set((state) => {
      const src = state.canvas.blocks.find((b) => b.id === blockId);
      if (!src) return state;
      return { copiedBlock: structuredClone(src) };
    }),

  copyStyle: (blockId) =>
    set((state) => {
      const src = state.canvas.blocks.find((b) => b.id === blockId);
      if (!src) return state;
      return { copiedStyle: src.style ? structuredClone(src.style) : null };
    }),

  pasteStyle: (blockId) =>
    set((state) => {
      if (!state.copiedStyle) return state;
      const style: BlockStyle = structuredClone(state.copiedStyle);
      return {
        canvas: {
          ...state.canvas,
          blocks: state.canvas.blocks.map((b) =>
            b.id === blockId ? { ...b, style } : b
          )
        }
      };
    }),

  pasteBlock: () =>
    set((state) => {
      if (!state.copiedBlock) return state;
      const copy: Block = {
        ...structuredClone(state.copiedBlock),
        id: uid(),
        layout: state.copiedBlock.layout
          ? {
              ...state.copiedBlock.layout,
              x: (state.copiedBlock.layout.x ?? 0) + 16,
              y: (state.copiedBlock.layout.y ?? 0) + 16
            }
          : undefined
      };
      return {
        canvas: { ...state.canvas, blocks: [...state.canvas.blocks, copy] },
        selectedBlockId: copy.id,
        selectedDecor: null
      };
    }),

  bringForward: (blockId) =>
    set((state) => {
      const blocks = [...state.canvas.blocks];
      const idx = blocks.findIndex((b) => b.id === blockId);
      if (idx === -1 || idx === blocks.length - 1) return state;
      [blocks[idx], blocks[idx + 1]] = [blocks[idx + 1], blocks[idx]];
      return { canvas: { ...state.canvas, blocks } };
    }),

  sendBackward: (blockId) =>
    set((state) => {
      const blocks = [...state.canvas.blocks];
      const idx = blocks.findIndex((b) => b.id === blockId);
      if (idx <= 0) return state;
      [blocks[idx], blocks[idx - 1]] = [blocks[idx - 1], blocks[idx]];
      return { canvas: { ...state.canvas, blocks } };
    }),

  bringToFront: (blockId) =>
    set((state) => {
      const blocks = [...state.canvas.blocks];
      const idx = blocks.findIndex((b) => b.id === blockId);
      if (idx === -1 || idx === blocks.length - 1) return state;
      const [moved] = blocks.splice(idx, 1);
      blocks.push(moved);
      return { canvas: { ...state.canvas, blocks } };
    }),

  sendToBack: (blockId) =>
    set((state) => {
      const blocks = [...state.canvas.blocks];
      const idx = blocks.findIndex((b) => b.id === blockId);
      if (idx <= 0) return state;
      const [moved] = blocks.splice(idx, 1);
      blocks.unshift(moved);
      return { canvas: { ...state.canvas, blocks } };
    }),

  selectBlock: (blockId) => set({ selectedBlockId: blockId, selectedDecor: null }),

  reset: () =>
    set({
      canvas: emptyCanvas(),
      selectedBlockId: null,
      selectedText: null,
      selectedDecor: null,
      initialized: false,
      lastProjectId: null,
      copiedBlock: null,
      copiedStyle: null
    })
    }),
    {
      partialize: (state) => ({ canvas: state.canvas }),
      limit: 60,
      equality: (past, current) => (past as { canvas: CanvasData } | undefined)?.canvas === (current as { canvas: CanvasData } | undefined)?.canvas
    }
  )
);

/** Operasi undo/redo untuk builder. */
export function undoBuilder() {
  useBuilderStore.temporal.getState().undo();
}

export function redoBuilder() {
  useBuilderStore.temporal.getState().redo();
}

export function canUndoBuilder(): boolean {
  return useBuilderStore.temporal.getState().pastStates.length > 0;
}

export function canRedoBuilder(): boolean {
  return useBuilderStore.temporal.getState().futureStates.length > 0;
}

/** Hook reactive: berapa banyak past/future di history undo/redo. */
export function useBuilderHistory() {
  return useSyncExternalStore(
    (cb) => {
      const storeApi = useBuilderStore.temporal;
      const unsub = storeApi.subscribe(cb);
      return unsub;
    },
    () => ({
      canUndo: useBuilderStore.temporal.getState().pastStates.length > 0,
      canRedo: useBuilderStore.temporal.getState().futureStates.length > 0
    }),
    () => ({ canUndo: false, canRedo: false })
  );
}