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
  },
  {
    id: 'navy-elegance',
    name: 'Navy Elegance',
    category: 'classic',
    description: 'Biru navy klasik dengan aksen emas — formal dan berkelas.',
    primary: '#1F3A5F',
    secondary: '#C9A227',
    background: '#F6F7F9',
    text: '#232B36',
    fontHeading: 'Playfair Display',
    fontBody: 'Jost',
    decor: decor('navy-elegance', [
      { imageUrl: '/stickers/gold-frame.svg', x: 30, y: 40, width: 370, rotation: 0, opacity: 0.25, zIndex: 2, loop: 'none' }
    ]),
    blocks: [
      hero('navy-elegance-hero', 'The Wedding of', 'Anindya Kirana', 'Raka Wijaya', 'Sabtu, 14 Maret 2026', 'Hotel Indonesia Kempinski, Jakarta'),
      quote('navy-elegance-quote', 'Dan di antara tanda-tanda kekuasaan-Nya, Dia menciptakan untukmu pasangan agar kamu merasa tenteram.', 'QS. Ar-Rum: 21'),
      couple('navy-elegance-couple', 'Raka Wijaya', 'Putra dari Bpk. & Ibu Wijaya', 'Anindya Kirana', 'Putri dari Bpk. & Ibu Kirana'),
      countdown('navy-elegance-countdown', '2026-03-14T09:00:00+07:00'),
      events('navy-elegance-event', 'Sabtu, 14 Maret 2026', 'Hotel Indonesia Kempinski'),
      story('navy-elegance-story'),
      gallery('navy-elegance-gallery'),
      maps('navy-elegance-maps', 'Hotel Indonesia Kempinski, Jakarta'),
      gift('navy-elegance-gift', 'Bank BCA', '2468013579', 'Anindya Kirana'),
      thanks('navy-elegance-thanks'),
      rsvp('navy-elegance-rsvp')
    ]
  },
  {
    id: 'sage-minimal',
    name: 'Sage Minimal',
    category: 'modern',
    description: 'Hijau sage tenang dan minimalis untuk undangan kontemporer.',
    primary: '#6B7F6B',
    secondary: '#C9A227',
    background: '#F7F8F5',
    text: '#333A33',
    fontHeading: 'Cormorant Garamond',
    fontBody: 'Karla',
    decor: decor('sage-minimal', [
      { imageUrl: '/stickers/leaf-garland.svg', x: -30, y: 0, width: 490, rotation: 0, opacity: 0.35, zIndex: 2, loop: 'none' }
    ]),
    blocks: [
      hero('sage-minimal-hero', 'The Wedding of', 'Maia Larasati', 'Bima Aditya', 'Minggu, 7 Juni 2026', 'Plataran Komodo, Labuan Bajo'),
      couple('sage-minimal-couple', 'Bima Aditya', 'Putra dari Bpk. & Ibu Aditya', 'Maia Larasati', 'Putri dari Bpk. & Ibu Larasati'),
      countdown('sage-minimal-countdown', '2026-06-07T10:00:00+08:00'),
      events('sage-minimal-event', 'Minggu, 7 Juni 2026', 'Plataran Komodo'),
      story('sage-minimal-story'),
      gallery('sage-minimal-gallery'),
      maps('sage-minimal-maps', 'Plataran Komodo, Labuan Bajo'),
      thanks('sage-minimal-thanks'),
      rsvp('sage-minimal-rsvp')
    ]
  },
  {
    id: 'rose-blush',
    name: 'Rose Blush',
    category: 'romance',
    description: 'Nuansa rose lembut dan romantis.',
    primary: '#C97B84',
    secondary: '#C9A227',
    background: '#FDF6F7',
    text: '#4A3A3C',
    fontHeading: 'Cormorant Garamond',
    fontBody: 'Poppins',
    decor: decor('rose-blush', [
      { imageUrl: '/stickers/rose-left.svg', x: -20, y: 80, width: 150, rotation: -6, opacity: 0.9, zIndex: 2, loop: 'float' },
      { imageUrl: '/stickers/rose-right.svg', x: 310, y: 980, width: 150, rotation: 6, opacity: 0.9, zIndex: 2, loop: 'float' }
    ]),
    blocks: [
      hero('rose-blush-hero', 'The Wedding of', 'Alika Pramesti', 'Dion Saputra', 'Sabtu, 25 April 2026', 'The Grand Ballroom, Surabaya'),
      quote('rose-blush-quote', 'Cinta bukan tentang menemukan yang sempurna, melainkan memilih untuk tumbuh bersama.', 'Kami'),
      couple('rose-blush-couple', 'Dion Saputra', 'Putra dari Bpk. & Ibu Saputra', 'Alika Pramesti', 'Putri dari Bpk. & Ibu Pramesti'),
      countdown('rose-blush-countdown', '2026-04-25T09:00:00+07:00'),
      events('rose-blush-event', 'Sabtu, 25 April 2026', 'The Grand Ballroom Surabaya'),
      story('rose-blush-story'),
      gallery('rose-blush-gallery'),
      maps('rose-blush-maps', 'The Grand Ballroom, Surabaya'),
      envelope('rose-blush-envelope', 'Bank Mandiri', '1397531888', 'Alika Pramesti'),
      thanks('rose-blush-thanks'),
      rsvp('rose-blush-rsvp')
    ]
  },
  {
    id: 'noir-gold',
    name: 'Noir Gold',
    category: 'modern',
    description: 'Hitam elegan dengan aksen emas — mewah dan dramatis.',
    primary: '#C9A227',
    secondary: '#E7C873',
    background: '#14110C',
    text: '#F3ECDD',
    fontHeading: 'Playfair Display',
    fontBody: 'DM Sans',
    decor: decor('noir-gold', [
      { imageUrl: '/stickers/sparkle.svg', x: 70, y: 240, width: 60, rotation: 0, opacity: 0.8, zIndex: 2, loop: 'pulse' },
      { imageUrl: '/stickers/gold-frame.svg', x: 30, y: 40, width: 370, rotation: 0, opacity: 0.2, zIndex: 2, loop: 'none' }
    ]),
    blocks: [
      hero('noir-gold-hero', 'The Wedding of', 'Gita Maharani', 'Arga Pratama', 'Jumat, 20 Februari 2026', 'The Langham, Jakarta'),
      couple('noir-gold-couple', 'Arga Pratama', 'Putra dari Bpk. & Ibu Pratama', 'Gita Maharani', 'Putri dari Bpk. & Ibu Maharani'),
      countdown('noir-gold-countdown', '2026-02-20T18:00:00+07:00'),
      events('noir-gold-event', 'Jumat, 20 Februari 2026', 'The Langham Grand Ballroom'),
      story('noir-gold-story'),
      gallery('noir-gold-gallery'),
      maps('noir-gold-maps', 'The Langham, Jakarta'),
      envelope('noir-gold-envelope', 'Bank BCA', '8642097531', 'Arga Pratama'),
      thanks('noir-gold-thanks'),
      rsvp('noir-gold-rsvp')
    ]
  },
  {
    id: 'emerald-khaki',
    name: 'Emerald Khaki',
    category: 'outdoor',
    description: 'Hijau emerald dengan aksen khaki — botanical, natural, dan tenang.',
    primary: '#2F5D50',
    secondary: '#B5A27C',
    background: '#F4F1E8',
    text: '#2E3A34',
    fontHeading: 'Cormorant Garamond',
    fontBody: 'Jost',
    decor: decor('emerald-khaki', [
      { imageUrl: '/stickers/leaf-garland.svg', x: -40, y: 0, width: 510, rotation: 0, opacity: 0.45, zIndex: 2, loop: 'none' },
      { imageUrl: '/stickers/leaf-garland.svg', x: -40, y: 1500, width: 510, rotation: 180, opacity: 0.35, zIndex: 2, loop: 'none' },
      { imageUrl: '/stickers/butterfly.svg', x: 320, y: 620, width: 84, rotation: -8, opacity: 0.9, zIndex: 3, loop: 'float' }
    ]),
    blocks: [
      hero('emerald-khaki-hero', 'The Wedding of', 'Ayu Paramita', 'Damar Wicaksono', 'Sabtu, 3 Oktober 2026', 'Bogor Botanical Garden'),
      quote('emerald-khaki-quote', 'Dan segala sesuatu Kami ciptakan berpasang-pasangan supaya kamu mengingat kebesaran Allah.', 'QS. Adz-Dzariyat: 49'),
      couple('emerald-khaki-couple', 'Damar Wicaksono', 'Putra dari Bpk. & Ibu Wicaksono', 'Ayu Paramita', 'Putri dari Bpk. & Ibu Paramita'),
      countdown('emerald-khaki-countdown', '2026-10-03T09:00:00+07:00'),
      events('emerald-khaki-event', 'Sabtu, 3 Oktober 2026', 'Bogor Botanical Garden'),
      story('emerald-khaki-story'),
      gallery('emerald-khaki-gallery'),
      maps('emerald-khaki-maps', 'Kebun Raya Bogor, Jawa Barat'),
      gift('emerald-khaki-gift', 'Bank BNI', '0987654321', 'Ayu Paramita'),
      thanks('emerald-khaki-thanks'),
      rsvp('emerald-khaki-rsvp')
    ]
  },
  {
    id: 'lavender-mist',
    name: 'Lavender Mist',
    category: 'romance',
    description: 'Ungu lavender lembut dan dreamy.',
    primary: '#8E7CC3',
    secondary: '#C9A227',
    background: '#F8F6FC',
    text: '#3E3A4A',
    fontHeading: 'Playfair Display',
    fontBody: 'Poppins',
    decor: decor('lavender-mist', [
      { imageUrl: '/stickers/sparkle.svg', x: 60, y: 220, width: 60, rotation: 0, opacity: 0.7, zIndex: 2, loop: 'pulse' },
      { imageUrl: '/stickers/rose-right.svg', x: 300, y: 1000, width: 140, rotation: 8, opacity: 0.8, zIndex: 2, loop: 'float' }
    ]),
    blocks: [
      hero('lavender-mist-hero', 'The Wedding of', 'Nadira Ayu', 'Fajar Ramadhan', 'Minggu, 12 Juli 2026', 'The Trans Luxury, Bandung'),
      couple('lavender-mist-couple', 'Fajar Ramadhan', 'Putra dari Bpk. & Ibu Ramadhan', 'Nadira Ayu', 'Putri dari Bpk. & Ibu Ayu'),
      countdown('lavender-mist-countdown', '2026-07-12T10:00:00+07:00'),
      events('lavender-mist-event', 'Minggu, 12 Juli 2026', 'The Trans Luxury Hotel'),
      story('lavender-mist-story'),
      gallery('lavender-mist-gallery'),
      maps('lavender-mist-maps', 'The Trans Luxury, Bandung'),
      thanks('lavender-mist-thanks'),
      rsvp('lavender-mist-rsvp')
    ]
  },
  {
    id: 'pearl-ivory',
    name: 'Pearl Ivory',
    category: 'classic',
    description: 'Ivory mutiara, minimal, dan abadi.',
    primary: '#9C8E76',
    secondary: '#D9CBB0',
    background: '#FBF9F4',
    text: '#3B372F',
    fontHeading: 'Cormorant Garamond',
    fontBody: 'Karla',
    decor: decor('pearl-ivory', [
      { imageUrl: '/stickers/gold-frame.svg', x: 30, y: 40, width: 370, rotation: 0, opacity: 0.18, zIndex: 2, loop: 'none' }
    ]),
    blocks: [
      hero('pearl-ivory-hero', 'The Wedding of', 'Laras Widuri', 'Krisna Bayu', 'Sabtu, 8 Agustus 2026', 'Amanjiwo, Magelang'),
      quote('pearl-ivory-quote', 'Siapa mendapat isteri, mendapat sesuatu yang baik, dan ia dikenan TUHAN.', 'Amsal 18:22'),
      couple('pearl-ivory-couple', 'Krisna Bayu', 'Putra dari Bpk. & Ibu Bayu', 'Laras Widuri', 'Putri dari Bpk. & Ibu Widuri'),
      countdown('pearl-ivory-countdown', '2026-08-08T09:00:00+07:00'),
      events('pearl-ivory-event', 'Sabtu, 8 Agustus 2026', 'Amanjiwo Resort'),
      story('pearl-ivory-story'),
      gallery('pearl-ivory-gallery'),
      maps('pearl-ivory-maps', 'Amanjiwo, Magelang'),
      thanks('pearl-ivory-thanks'),
      rsvp('pearl-ivory-rsvp')
    ]
  },
  {
    id: 'golden-marigold',
    name: 'Golden Marigold',
    category: 'outdoor',
    description: 'Kuning marigold hangat dan ceria, khas garden party.',
    primary: '#C98A1E',
    secondary: '#6B7F4B',
    background: '#FFF9EC',
    text: '#4A3B22',
    fontHeading: 'Lora',
    fontBody: 'Montserrat',
    decor: decor('golden-marigold', [
      { imageUrl: '/stickers/leaf-garland.svg', x: -30, y: 0, width: 490, rotation: 0, opacity: 0.4, zIndex: 2, loop: 'none' },
      { imageUrl: '/stickers/butterfly.svg', x: 80, y: 700, width: 80, rotation: 6, opacity: 0.9, zIndex: 3, loop: 'float' }
    ]),
    blocks: [
      hero('golden-marigold-hero', 'The Wedding of', 'Sekar Ayu', 'Bagas Prakoso', 'Sabtu, 19 September 2026', 'Plataran Puncak, Bogor'),
      couple('golden-marigold-couple', 'Bagas Prakoso', 'Putra dari Bpk. & Ibu Prakoso', 'Sekar Ayu', 'Putri dari Bpk. & Ibu Ayu'),
      countdown('golden-marigold-countdown', '2026-09-19T09:00:00+07:00'),
      events('golden-marigold-event', 'Sabtu, 19 September 2026', 'Plataran Puncak'),
      story('golden-marigold-story'),
      gallery('golden-marigold-gallery'),
      maps('golden-marigold-maps', 'Plataran Puncak, Bogor'),
      envelope('golden-marigold-envelope', 'Bank Mandiri', '1029384756', 'Sekar Ayu'),
      thanks('golden-marigold-thanks'),
      rsvp('golden-marigold-rsvp')
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
