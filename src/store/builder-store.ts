'use client';

import { create } from 'zustand';
import type { Block, BlockLayout, BlockProps, BlockStyle, BlockType, CanvasData, Settings, Theme } from '@/lib/types';
import { emptyCanvas } from '@/lib/templates';
import { getReligion, isKnownDefault, type ReligionKey } from '@/lib/religions';

interface BuilderState {
  canvas: CanvasData;
  selectedBlockId: string | null;
  initialized: boolean;

  init: (data: CanvasData) => void;
  setTheme: (theme: Partial<Theme>) => void;
  setSettings: (settings: Partial<Settings>) => void;
  setReligion: (religion: ReligionKey) => void;
  setBlockProps: (blockId: string, props: Partial<BlockProps>) => void;
  setBlockLayout: (blockId: string, partial: Partial<BlockLayout>) => void;
  setBlockStyle: (blockId: string, partial: Partial<BlockStyle>) => void;
  clearBlockStyle: (blockId: string) => void;
  setBlockInner: (blockId: string, key: string, pos: { x: number; y: number }) => void;
  setFlow: (flow: 'stack' | 'free') => void;
  addBlock: (type: BlockType, index?: number) => void;
  removeBlock: (blockId: string) => void;
  duplicateBlock: (blockId: string) => void;
  reorderBlock: (activeId: string, overId: string) => void;
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
      success_message: 'Terima kasih atas konfirmasinya.',
      envelope_note: '',
      bank_name: '',
      account_number: '',
      account_holder: ''
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
  }
};

export const useBuilderStore = create<BuilderState>((set, get) => ({
  canvas: emptyCanvas(),
  selectedBlockId: null,
  initialized: false,

  init: (data) => {
    if (get().initialized) return;
    const canvas = structuredClone(data);
    if (!canvas.flow) canvas.flow = 'stack';
    set({
      canvas,
      initialized: true,
      selectedBlockId: null
    });
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

  setBlockInner: (blockId, key, pos) =>
    set((state) => ({
      canvas: {
        ...state.canvas,
        blocks: state.canvas.blocks.map((b) =>
          b.id === blockId ? { ...b, inner: { ...(b.inner ?? {}), [key]: pos } } : b
        )
      }
    })),

  setFlow: (flow) => set((state) => ({ canvas: { ...state.canvas, flow } })),

  addBlock: (type, index) =>
    set((state) => {
      const block: Block = { ...BLOCK_PRESETS[type], id: uid() };
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
      selectedBlockId: state.selectedBlockId === blockId ? null : state.selectedBlockId
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
        layout: src.layout ? { ...src.layout } : undefined
      };
      const blocks = [...state.canvas.blocks];
      blocks.splice(idx + 1, 0, copy);
      return {
        canvas: { ...state.canvas, blocks },
        selectedBlockId: copy.id
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

  selectBlock: (blockId) => set({ selectedBlockId: blockId }),

  reset: () =>
    set({
      canvas: emptyCanvas(),
      selectedBlockId: null,
      initialized: false
    })
}));