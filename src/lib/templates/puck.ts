import type { PuckData } from '@/lib/canvas/puck-format';
import type { DecorItem } from '@/puck/types';

export interface PuckTemplateMeta {
  id: string;
  name: string;
  category: string;
  description: string;
  primary: string;
  secondary: string;
}

export interface PuckTemplate extends PuckTemplateMeta {
  data: PuckData;
}

type Block = PuckData['content'][number];

const flow = { mode: 'flow' as const, x: 60, y: 60, width: 'auto' as const, rotation: 0, zIndex: 0 };

function decor(tpl: string, items: Omit<DecorItem, 'id'>[]): DecorItem[] {
  return items.map((d, i) => ({ id: `${tpl}-decor-${i + 1}`, ...d }));
}

interface Blueprint {
  id: string;
  name: string;
  category: string;
  description: string;
  primary: string;
  secondary: string;
  background: string;
  text: string;
  fontHeading: string;
  fontBody: string;
  decor: DecorItem[];
  blocks: Block[];
}

function hero(id: string, caption: string, bride: string, groom: string, date: string, place: string, bgImage = ''): Block {
  return {
    type: 'Hero',
    props: { id, caption, bride, groom, date, place, bgImage, entrance: 'fade', position: flow }
  } as Block;
}
function couple(id: string, groom: string, groomParents: string, bride: string, brideParents: string): Block {
  return {
    type: 'Couple',
    props: { id, title: 'Mempelai', groom, groomParents, bride, brideParents, entrance: 'fade', position: flow }
  } as Block;
}
function quote(id: string, text: string, source: string): Block {
  return { type: 'Quote', props: { id, text, source, entrance: 'fade', position: flow } } as Block;
}
function countdown(id: string, targetDate: string): Block {
  return { type: 'Countdown', props: { id, title: 'Menghitung Hari', targetDate, entrance: 'fade', position: flow } } as Block;
}
function events(id: string, date: string, place: string): Block {
  return {
    type: 'EventDetail',
    props: {
      id,
      title: 'Waktu & Tempat',
      events: [
        { label: 'Akad Nikah', date, time: '08.00 - 10.00 WIB', place },
        { label: 'Resepsi', date, time: '11.00 - 14.00 WIB', place }
      ],
      entrance: 'fade',
      position: flow
    }
  } as Block;
}
function story(id: string): Block {
  return {
    type: 'Story',
    props: {
      id,
      title: 'Kisah Kami',
      items: [
        { year: '2019', title: 'Pertemuan Pertama', description: 'Kami dipertemukan pada sebuah acara kampus.' },
        { year: '2022', title: 'Mulai Menjalani', description: 'Kami belajar tumbuh bersama.' },
        { year: '2025', title: 'Lamaran', description: 'Kami memutuskan melangkah ke jenjang yang lebih serius.' }
      ],
      entrance: 'fade',
      position: flow
    }
  } as Block;
}
function gallery(id: string): Block {
  return { type: 'Gallery', props: { id, title: 'Momen Bahagia Kami', images: [], entrance: 'fade', position: flow } } as Block;
}
function maps(id: string, place: string): Block {
  return { type: 'Maps', props: { id, title: 'Lokasi Acara', address: place, embedUrl: '', entrance: 'fade', position: flow } } as Block;
}
function gift(id: string, bank: string, acc: string, holder: string): Block {
  return {
    type: 'GiftList',
    props: { id, title: 'Kirim Hadiah', accounts: [{ bankName: bank, accountNumber: acc, accountHolder: holder }], address: '', entrance: 'fade', position: flow }
  } as Block;
}
function envelope(id: string, bank: string, acc: string, holder: string): Block {
  return {
    type: 'Envelope',
    props: { id, title: 'Amplop Online', note: 'Doa restu Anda adalah hadiah terbaik bagi kami.', accounts: [{ bankName: bank, accountNumber: acc, accountHolder: holder }], entrance: 'fade', position: flow }
  } as Block;
}
function thanks(id: string): Block {
  return {
    type: 'Thanks',
    props: {
      id,
      title: 'Terima Kasih',
      message: 'Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.',
      entrance: 'fade',
      position: flow
    }
  } as Block;
}
function rsvp(id: string): Block {
  return {
    type: 'Rsvp',
    props: { id, title: 'Konfirmasi Kehadiran', note: 'Mohon konfirmasi kehadiran Anda sebelum hari acara.', buttonText: 'Kirim Konfirmasi', entrance: 'fade', position: flow }
  } as Block;
}

function build(bp: Blueprint): PuckTemplate {
  return {
    id: bp.id,
    name: bp.name,
    category: bp.category,
    description: bp.description,
    primary: bp.primary,
    secondary: bp.secondary,
    data: {
      root: {
        props: {
          primary: bp.primary,
          secondary: bp.secondary,
          background: bp.background,
          text: bp.text,
          fontHeading: bp.fontHeading,
          fontBody: bp.fontBody,
          decor: bp.decor
        }
      },
      content: bp.blocks
    }
  };
}

const BLUEPRINTS: Blueprint[] = [
  {
    id: 'ivory-gold',
    name: 'Ivory Gold',
    category: 'classic',
    description: 'Ivory hangat dengan aksen emas dan tipografi klasik.',
    primary: '#A9894A',
    secondary: '#D9A7A4',
    background: '#FBF7F1',
    text: '#4A4036',
    fontHeading: 'Cormorant Garamond',
    fontBody: 'Jost',
    decor: decor('ivory-gold', [
      { imageUrl: '/stickers/rose-left.svg', x: -20, y: 60, width: 140, rotation: -6, opacity: 0.9, zIndex: 2, loop: 'float' },
      { imageUrl: '/stickers/rose-right.svg', x: 320, y: 900, width: 140, rotation: 6, opacity: 0.9, zIndex: 2, loop: 'float' }
    ]),
    blocks: [
      hero('ivory-gold-hero', 'The Wedding of', 'Sena Ayudia', 'Panca Priyantoro', 'Sabtu, 12 Desember 2026', 'The Ritz-Carlton, Jakarta'),
      quote('ivory-gold-quote', 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri.', 'QS. Ar-Rum: 21'),
      couple('ivory-gold-couple', 'Panca Priyantoro, S.T.', 'Putra dari Bpk. H. Darmo & Ibu Hj. Wulan', 'Sena Ayudia, S.E.', 'Putri dari Bpk. Ir. Rendra & Ibu Hj. Lily'),
      countdown('ivory-gold-countdown', '2026-12-12T08:00:00+07:00'),
      events('ivory-gold-event', 'Sabtu, 12 Desember 2026', 'The Ritz-Carlton Grand Ballroom'),
      story('ivory-gold-story'),
      gallery('ivory-gold-gallery'),
      maps('ivory-gold-maps', 'The Ritz-Carlton Grand Ballroom, Jakarta'),
      gift('ivory-gold-gift', 'Bank Mandiri', '1234567890', 'Sena Ayudia'),
      thanks('ivory-gold-thanks'),
      rsvp('ivory-gold-rsvp')
    ]
  },
  {
    id: 'emerald-botanical',
    name: 'Emerald Botanical',
    category: 'outdoor',
    description: 'Hijau botanical segar dengan nuansa taman.',
    primary: '#2F6B4F',
    secondary: '#C9A227',
    background: '#F4F8F3',
    text: '#2C3A2F',
    fontHeading: 'Playfair Display',
    fontBody: 'DM Sans',
    decor: decor('emerald-botanical', [
      { imageUrl: '/stickers/leaf-garland.svg', x: -40, y: 0, width: 500, rotation: 0, opacity: 0.5, zIndex: 2, loop: 'none' },
      { imageUrl: '/stickers/leaf-garland.svg', x: -40, y: 1400, width: 500, rotation: 180, opacity: 0.4, zIndex: 2, loop: 'none' }
    ]),
    blocks: [
      hero('emerald-botanical-hero', 'The Wedding of', 'Kintan Maharani', 'Bayu Pratama', 'Minggu, 18 Oktober 2026', 'Kebun Raya Bogor'),
      couple('emerald-botanical-couple', 'Bayu Pratama', 'Putra dari Bpk. & Ibu Pratama', 'Kintan Maharani', 'Putri dari Bpk. & Ibu Maharani'),
      countdown('emerald-botanical-countdown', '2026-10-18T09:00:00+07:00'),
      events('emerald-botanical-event', 'Minggu, 18 Oktober 2026', 'Kebun Raya Bogor'),
      story('emerald-botanical-story'),
      gallery('emerald-botanical-gallery'),
      maps('emerald-botanical-maps', 'Kebun Raya Bogor, Jawa Barat'),
      thanks('emerald-botanical-thanks'),
      rsvp('emerald-botanical-rsvp')
    ]
  },
  {
    id: 'midnight-rose',
    name: 'Midnight Rose',
    category: 'modern',
    description: 'Gelap elegan dengan aksen rose — cocok untuk malam.',
    primary: '#D98CA0',
    secondary: '#C9A227',
    background: '#17181C',
    text: '#F2EAE6',
    fontHeading: 'Playfair Display',
    fontBody: 'Poppins',
    decor: decor('midnight-rose', [
      { imageUrl: '/stickers/sparkle.svg', x: 60, y: 200, width: 70, rotation: 0, opacity: 0.8, zIndex: 2, loop: 'pulse' },
      { imageUrl: '/stickers/sparkle.svg', x: 330, y: 760, width: 50, rotation: 0, opacity: 0.7, zIndex: 2, loop: 'pulse' }
    ]),
    blocks: [
      hero('midnight-rose-hero', 'The Wedding of', 'Larasati', 'Adrian Wibowo', 'Jumat, 20 November 2026', 'The Langham, Jakarta'),
      couple('midnight-rose-couple', 'Adrian Wibowo', 'Putra dari Bpk. & Ibu Wibowo', 'Larasati', 'Putri dari Bpk. & Ibu Laras'),
      countdown('midnight-rose-countdown', '2026-11-20T18:00:00+07:00'),
      events('midnight-rose-event', 'Jumat, 20 November 2026', 'The Langham Grand Ballroom'),
      story('midnight-rose-story'),
      gallery('midnight-rose-gallery'),
      maps('midnight-rose-maps', 'The Langham, Jakarta'),
      envelope('midnight-rose-envelope', 'BCA', '9876543210', 'Adrian Wibowo'),
      thanks('midnight-rose-thanks'),
      rsvp('midnight-rose-rsvp')
    ]
  },
  {
    id: 'terracotta-boho',
    name: 'Terracotta Boho',
    category: 'romance',
    description: 'Bumi terracotta hangat dengan sentuhan bohemian.',
    primary: '#B4623F',
    secondary: '#7C8B6B',
    background: '#FBF3EA',
    text: '#42332A',
    fontHeading: 'Lora',
    fontBody: 'Karla',
    decor: decor('terracotta-boho', [
      { imageUrl: '/stickers/butterfly.svg', x: 320, y: 160, width: 90, rotation: -10, opacity: 0.9, zIndex: 2, loop: 'float' },
      { imageUrl: '/stickers/leaf-garland.svg', x: -30, y: 1200, width: 460, rotation: 0, opacity: 0.35, zIndex: 2, loop: 'none' }
    ]),
    blocks: [
      hero('terracotta-boho-hero', 'The Wedding of', 'Amara Putri', 'Raka Nugraha', 'Sabtu, 5 September 2026', 'Ubud, Bali'),
      quote('terracotta-boho-quote', 'Cinta bukan tentang menemukan yang sempurna, melainkan memilih untuk terus tumbuh bersama.', 'Kami'),
      couple('terracotta-boho-couple', 'Raka Nugraha', 'Putra dari Bpk. & Ibu Nugraha', 'Amara Putri', 'Putri dari Bpk. & Ibu Putra'),
      countdown('terracotta-boho-countdown', '2026-09-05T10:00:00+08:00'),
      events('terracotta-boho-event', 'Sabtu, 5 September 2026', 'The Ubud Garden, Bali'),
      story('terracotta-boho-story'),
      gallery('terracotta-boho-gallery'),
      maps('terracotta-boho-maps', 'Ubud, Gianyar, Bali'),
      gift('terracotta-boho-gift', 'Bank BNI', '1357924680', 'Amara Putri'),
      thanks('terracotta-boho-thanks'),
      rsvp('terracotta-boho-rsvp')
    ]
  }
];

export const PUCK_TEMPLATES: PuckTemplate[] = BLUEPRINTS.map(build);

export const PUCK_TEMPLATE_LIST: PuckTemplateMeta[] = PUCK_TEMPLATES.map((t) => ({
  id: t.id,
  name: t.name,
  category: t.category,
  description: t.description,
  primary: t.primary,
  secondary: t.secondary
}));

export function getPuckTemplate(id: string): PuckData | null {
  const tpl = PUCK_TEMPLATES.find((t) => t.id === id);
  if (!tpl) return null;
  // Clone deep agar state editor tidak memutasi template.
  return JSON.parse(JSON.stringify(tpl.data)) as PuckData;
}
