import type { Data } from '@puckeditor/core';
import { defaultPosition } from '@/puck/config';
import { defaultTheme } from '@/puck/theme';
import type { InvitationRootProps, InvitationProps } from '@/puck/types';

const flow = defaultPosition;

/** Data contoh untuk membuktikan render (termasuk di SSR). */
export const sampleData: Data<InvitationProps, InvitationRootProps> = {
  root: {
    props: {
      ...defaultTheme,
      decor: [
        { id: 'decor-demo-1', imageUrl: '/stickers/rose-left.svg', x: 0, y: 120, width: 120, rotation: -8, opacity: 0.9, zIndex: 2, loop: 'float' },
        { id: 'decor-demo-2', imageUrl: '/stickers/rose-right.svg', x: 300, y: 520, width: 120, rotation: 8, opacity: 0.9, zIndex: 2, loop: 'float' }
      ]
    }
  },
  content: [
    {
      type: 'Cover',
      props: {
        id: 'cover-1',
        caption: 'The Wedding of',
        bride: 'Sena Ayudia',
        groom: 'Panca Priyantoro',
        date: 'Sabtu, 12 Desember 2026',
        place: 'The Ritz-Carlton, Jakarta',
        bgImage: '',
        greeting: 'Kepada Yth.',
        buttonText: 'Buka Undangan',
        coverStyle: 'floral',
        entrance: 'none',
        position: flow
      }
    },
    {
      type: 'Hero',
      props: {
        id: 'hero-1',
        caption: 'The Wedding of',
        groom: 'Panca Priyantoro',
        bride: 'Sena Ayudia',
        date: 'Sabtu, 12 Desember 2026',
        place: 'The Ritz-Carlton, Jakarta',
        bgImage: '',
        entrance: 'fade',
        position: flow
      }
    },
    {
      type: 'Couple',
      props: {
        id: 'couple-1',
        title: 'Mempelai',
        groom: 'Panca Priyantoro, S.T.',
        groomParents: 'Putra dari Bpk. H. Darmo & Ibu Hj. Wulan',
        bride: 'Sena Ayudia, S.E.',
        brideParents: 'Putri dari Bpk. Ir. Rendra & Ibu Hj. Lily',
        entrance: 'fade',
        position: flow
      }
    },
    {
      type: 'Quote',
      props: {
        id: 'quote-1',
        text: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri.',
        source: 'QS. Ar-Rum: 21',
        entrance: 'fade',
        position: flow
      }
    },
    {
      type: 'Countdown',
      props: {
        id: 'countdown-1',
        title: 'Menghitung Hari',
        targetDate: '2026-12-12T08:00:00+07:00',
        entrance: 'fade',
        position: flow
      }
    },
    {
      type: 'EventDetail',
      props: {
        id: 'event-1',
        title: 'Waktu & Tempat',
        events: [
          { label: 'Akad Nikah', date: 'Sabtu, 12 Desember 2026', time: '08.00 - 10.00 WIB', place: 'The Ritz-Carlton Grand Ballroom' },
          { label: 'Resepsi', date: 'Sabtu, 12 Desember 2026', time: '11.00 - 14.00 WIB', place: 'The Ritz-Carlton Grand Ballroom' }
        ],
        entrance: 'fade',
        position: flow
      }
    },
    {
      type: 'Story',
      props: {
        id: 'story-1',
        title: 'Kisah Kami',
        items: [
          { year: '2019', title: 'Pertemuan Pertama', description: 'Kami bertemu pertama kali di kampus.' },
          { year: '2024', title: 'Lamaran', description: 'Kami memutuskan melangkah lebih serius.' }
        ],
        entrance: 'fade',
        position: flow
      }
    },
    {
      type: 'Gallery',
      props: { id: 'gallery-1', title: 'Momen Bahagia Kami', images: [], entrance: 'fade', position: flow }
    },
    {
      type: 'Maps',
      props: {
        id: 'maps-1',
        title: 'Lokasi Acara',
        address: 'The Ritz-Carlton Grand Ballroom, Jakarta',
        embedUrl: '',
        entrance: 'fade',
        position: flow
      }
    },
    {
      type: 'GiftList',
      props: {
        id: 'gift-1',
        title: 'Kirim Hadiah',
        accounts: [{ bankName: 'Bank Mandiri', accountNumber: '1234567890', accountHolder: 'Sena Ayudia' }],
        address: '',
        entrance: 'fade',
        position: flow
      }
    },
    {
      type: 'Divider',
      props: { id: 'divider-1', variant: 'diamond', entrance: 'none', position: flow }
    },
    {
      type: 'Envelope',
      props: {
        id: 'envelope-1',
        title: 'Amplop Online',
        note: 'Doa restu Anda adalah hadiah terbaik bagi kami.',
        accounts: [{ bankName: 'Bank Mandiri', accountNumber: '1234567890', accountHolder: 'Panca Priyantoro' }],
        entrance: 'fade',
        position: flow
      }
    },
    {
      type: 'Thanks',
      props: {
        id: 'thanks-1',
        title: 'Terima Kasih',
        message: 'Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.',
        entrance: 'fade',
        position: flow
      }
    },
    {
      type: 'Rsvp',
      props: {
        id: 'rsvp-1',
        title: 'Konfirmasi Kehadiran',
        note: 'Mohon konfirmasi kehadiran Anda sebelum 30 November 2026.',
        buttonText: 'Kirim Konfirmasi',
        entrance: 'fade',
        position: flow
      }
    }
  ]
};
