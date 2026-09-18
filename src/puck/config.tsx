import type { Config } from '@puckeditor/core';
import Hero from '@/blocks/Hero';
import Couple from '@/blocks/Couple';
import Rsvp from '@/blocks/Rsvp';
import Countdown from '@/blocks/Countdown';
import EventDetail from '@/blocks/EventDetail';
import Gallery from '@/blocks/Gallery';
import Story from '@/blocks/Story';
import Quote from '@/blocks/Quote';
import Thanks from '@/blocks/Thanks';
import Maps from '@/blocks/Maps';
import GiftList from '@/blocks/GiftList';
import Divider from '@/blocks/Divider';
import Envelope from '@/blocks/Envelope';
import RunningText from '@/blocks/RunningText';
import PositionField from '@/puck/fields/PositionField';
import ColorField from '@/puck/fields/ColorField';
import AssetField from '@/puck/fields/AssetField';
import DecorField from '@/puck/fields/DecorField';
import DecorLayer from '@/blocks/DecorLayer';
import { defaultTheme } from '@/puck/theme';
import { RELIGIONS } from '@/lib/religions';
import type { InvitationRootProps, InvitationProps, Position } from '@/puck/types';

export const defaultPosition: Position = {
  mode: 'flow',
  x: 60,
  y: 60,
  width: 'auto',
  rotation: 0,
  zIndex: 0
};

const positionField = (label: string) => ({
  type: 'custom' as const,
  label,
  render: PositionField
});

const colorField = (label: string) => ({
  type: 'custom' as const,
  label,
  render: ColorField
});

const entranceField = {
  type: 'select' as const,
  label: 'Animasi Masuk',
  options: [
    { label: 'Fade', value: 'fade' },
    { label: 'Slide', value: 'slide' },
    { label: 'Zoom', value: 'zoom' },
    { label: 'Tanpa animasi', value: 'none' }
  ]
};

const FONTS = [
  'Cormorant Garamond',
  'Playfair Display',
  'Pinyon Script',
  'Great Vibes',
  'Jost',
  'Montserrat',
  'Lora',
  'DM Sans',
  'Poppins',
  'Karla'
];
const fontOptions = FONTS.map((f) => ({ label: f, value: f }));

export const config: Config<InvitationProps, InvitationRootProps> = {
  components: {
    Hero: {
      label: 'Hero',
      fields: {
        caption: { type: 'text' },
        groom: { type: 'text' },
        bride: { type: 'text' },
        date: { type: 'text' },
        place: { type: 'text' },
        bgImage: { type: 'custom', label: 'Gambar Latar', render: AssetField },
        entrance: entranceField,
        position: positionField('Posisi Hero')
      },
      defaultProps: {
        caption: 'The Wedding of',
        groom: 'Nama Pria',
        bride: 'Nama Wanita',
        date: 'Minggu, 1 Januari 2027',
        place: 'The Ritz-Carlton, Jakarta',
        bgImage: '',
        entrance: 'fade',
        position: defaultPosition
      },
      render: (props) => <Hero {...props} />
    },
    Couple: {
      label: 'Mempelai',
      fields: {
        title: { type: 'text' },
        groom: { type: 'text' },
        groomParents: { type: 'text' },
        bride: { type: 'text' },
        brideParents: { type: 'text' },
        entrance: entranceField,
        position: positionField('Posisi Mempelai')
      },
      defaultProps: {
        title: 'Mempelai',
        groom: 'Nama Pria',
        groomParents: 'Putra dari Bpk. & Ibu',
        bride: 'Nama Wanita',
        brideParents: 'Putri dari Bpk. & Ibu',
        entrance: 'fade',
        position: defaultPosition
      },
      render: (props) => <Couple {...props} />
    },
    Countdown: {
      label: 'Hitung Hari',
      fields: {
        title: { type: 'text' },
        targetDate: { type: 'text' },
        entrance: entranceField,
        position: positionField('Posisi Countdown')
      },
      defaultProps: {
        title: 'Menghitung Hari',
        targetDate: '2027-01-01T08:00:00+07:00',
        entrance: 'fade',
        position: defaultPosition
      },
      render: (props) => <Countdown {...props} />
    },
    EventDetail: {
      label: 'Detail Acara',
      fields: {
        title: { type: 'text' },
        events: {
          type: 'array',
          arrayFields: {
            label: { type: 'text' },
            date: { type: 'text' },
            time: { type: 'text' },
            place: { type: 'text' }
          },
          defaultItemProps: { label: 'Acara', date: 'Tanggal', time: 'Waktu', place: 'Tempat' }
        },
        entrance: entranceField,
        position: positionField('Posisi Acara')
      },
      defaultProps: {
        title: 'Waktu & Tempat',
        events: [
          { label: 'Akad Nikah', date: 'Sabtu, 12 Desember 2026', time: '08.00 - 10.00 WIB', place: 'The Ritz-Carlton Grand Ballroom' },
          { label: 'Resepsi', date: 'Sabtu, 12 Desember 2026', time: '11.00 - 14.00 WIB', place: 'The Ritz-Carlton Grand Ballroom' }
        ],
        entrance: 'fade',
        position: defaultPosition
      },
      render: (props) => <EventDetail {...props} />
    },
    Story: {
      label: 'Kisah Cinta',
      fields: {
        title: { type: 'text' },
        items: {
          type: 'array',
          arrayFields: {
            year: { type: 'text' },
            title: { type: 'text' },
            description: { type: 'textarea' }
          },
          defaultItemProps: { year: '2024', title: 'Momen', description: 'Cerita singkat momen ini.' }
        },
        entrance: entranceField,
        position: positionField('Posisi Kisah')
      },
      defaultProps: {
        title: 'Kisah Kami',
        items: [
          { year: '2019', title: 'Pertemuan Pertama', description: 'Kami bertemu pertama kali di kampus.' },
          { year: '2024', title: 'Lamaran', description: 'Kami memutuskan melangkah ke jenjang yang lebih serius.' }
        ],
        entrance: 'fade',
        position: defaultPosition
      },
      render: (props) => <Story {...props} />
    },
    Gallery: {
      label: 'Galeri',
      fields: {
        title: { type: 'text' },
        variant: {
          type: 'select',
          label: 'Tampilan',
          options: [
            { label: 'Grid', value: 'grid' },
            { label: 'Carousel (geser)', value: 'carousel' }
          ]
        },
        images: {
          type: 'array',
          arrayFields: {
            url: { type: 'custom', label: 'Gambar', render: AssetField },
            caption: { type: 'text' }
          },
          defaultItemProps: { url: '', caption: '' }
        },
        entrance: entranceField,
        position: positionField('Posisi Galeri')
      },
      defaultProps: {
        title: 'Momen Bahagia Kami',
        variant: 'grid',
        images: [],
        entrance: 'fade',
        position: defaultPosition
      },
      render: (props) => <Gallery {...props} />
    },
    Quote: {
      label: 'Kutipan',
      fields: {
        text: { type: 'textarea' },
        source: { type: 'text' },
        entrance: entranceField,
        position: positionField('Posisi Kutipan')
      },
      defaultProps: {
        text: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri.',
        source: 'QS. Ar-Rum: 21',
        entrance: 'fade',
        position: defaultPosition
      },
      render: (props) => <Quote {...props} />
    },
    Maps: {
      label: 'Lokasi (Maps)',
      fields: {
        title: { type: 'text' },
        address: { type: 'text' },
        embedUrl: { type: 'text' },
        entrance: entranceField,
        position: positionField('Posisi Lokasi')
      },
      defaultProps: {
        title: 'Lokasi Acara',
        address: 'The Ritz-Carlton Grand Ballroom, Jakarta',
        embedUrl: '',
        entrance: 'fade',
        position: defaultPosition
      },
      render: (props) => <Maps {...props} />
    },
    GiftList: {
      label: 'Daftar Kado',
      fields: {
        title: { type: 'text' },
        accounts: {
          type: 'array',
          arrayFields: {
            bankName: { type: 'text' },
            accountNumber: { type: 'text' },
            accountHolder: { type: 'text' }
          },
          defaultItemProps: { bankName: 'Bank', accountNumber: '0000000000', accountHolder: 'Nama' }
        },
        address: { type: 'textarea' },
        entrance: entranceField,
        position: positionField('Posisi Kado')
      },
      defaultProps: {
        title: 'Kirim Hadiah',
        accounts: [{ bankName: 'Bank Mandiri', accountNumber: '1234567890', accountHolder: 'Sena Ayudia' }],
        address: '',
        entrance: 'fade',
        position: defaultPosition
      },
      render: (props) => <GiftList {...props} />
    },
    Divider: {
      label: 'Pembatas',
      fields: {
        variant: {
          type: 'select',
          label: 'Gaya',
          options: [
            { label: 'Garis', value: 'line' },
            { label: 'Titik', value: 'dots' },
            { label: 'Diamond', value: 'diamond' },
            { label: 'Hati', value: 'hearts' },
            { label: 'Daun', value: 'leaves' }
          ]
        },
        entrance: entranceField,
        position: positionField('Posisi Pembatas')
      },
      defaultProps: {
        variant: 'line',
        entrance: 'none',
        position: defaultPosition
      },
      render: (props) => <Divider {...props} />
    },
    RunningText: {
      label: 'Teks Berjalan',
      fields: {
        text: { type: 'text' },
        speed: { type: 'number', label: 'Kecepatan' },
        separator: { type: 'text', label: 'Pemisah' },
        entrance: entranceField,
        position: positionField('Posisi Teks Berjalan')
      },
      defaultProps: {
        text: 'The Wedding of Sena & Panca · 12 Desember 2026',
        speed: 40,
        separator: '✦',
        entrance: 'none',
        position: defaultPosition
      },
      render: (props) => <RunningText {...props} />
    },
    Thanks: {
      label: 'Ucapan Terima Kasih',
      fields: {
        title: { type: 'text' },
        message: { type: 'textarea' },
        entrance: entranceField,
        position: positionField('Posisi Terima Kasih')
      },
      defaultProps: {
        title: 'Terima Kasih',
        message: 'Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.',
        entrance: 'fade',
        position: defaultPosition
      },
      render: (props) => <Thanks {...props} />
    },
    Envelope: {
      label: 'Amplop Online',
      fields: {
        title: { type: 'text' },
        note: { type: 'text' },
        accounts: {
          type: 'array',
          arrayFields: {
            bankName: { type: 'text' },
            accountNumber: { type: 'text' },
            accountHolder: { type: 'text' }
          },
          defaultItemProps: { bankName: 'Bank', accountNumber: '0000000000', accountHolder: 'Nama' }
        },
        entrance: entranceField,
        position: positionField('Posisi Amplop')
      },
      defaultProps: {
        title: 'Amplop Online',
        note: 'Doa restu Anda adalah hadiah terbaik. Namun jika ingin memberi tanda kasih, silakan gunakan rekening berikut.',
        accounts: [{ bankName: 'Bank Mandiri', accountNumber: '1234567890', accountHolder: 'Panca Priyantoro' }],
        entrance: 'fade',
        position: defaultPosition
      },
      render: (props) => <Envelope {...props} />
    },
    Rsvp: {
      label: 'Konfirmasi Kehadiran',
      fields: {
        title: { type: 'text' },
        note: { type: 'textarea' },
        buttonText: { type: 'text' },
        entrance: entranceField,
        position: positionField('Posisi RSVP')
      },
      defaultProps: {
        title: 'Konfirmasi Kehadiran',
        note: 'Mohon konfirmasi kehadiran Anda sebelum 30 November 2026.',
        buttonText: 'Kirim Konfirmasi',
        entrance: 'fade',
        position: defaultPosition
      },
      render: (props) => <Rsvp {...props} />
    }
  },
  root: {
    fields: {
      primary: colorField('Warna Utama'),
      secondary: colorField('Warna Aksen'),
      background: colorField('Warna Latar'),
      text: colorField('Warna Teks'),
      fontHeading: { type: 'select', label: 'Font Judul', options: fontOptions },
      fontBody: { type: 'select', label: 'Font Isi', options: fontOptions },
      decor: { type: 'custom', label: 'Dekor Kanvas', render: DecorField },
      showCover: {
        type: 'select',
        label: 'Cover "Buka Undangan"',
        options: [
          { label: 'Tampilkan', value: 'yes' },
          { label: 'Sembunyikan', value: 'no' }
        ]
      },
      coverGreeting: { type: 'text', label: 'Sapaan Cover' },
      coverButtonText: { type: 'text', label: 'Teks Tombol Cover' },
      coverStyle: {
        type: 'select',
        label: 'Gaya Cover',
        options: [
          { label: 'Floral', value: 'floral' },
          { label: 'Buku', value: 'book' },
          { label: 'Roll Film', value: 'filmroll' },
          { label: 'TV Jadul', value: 'oldtv' },
          { label: 'Koran', value: 'newspaper' }
        ]
      },
      musicUrl: { type: 'text', label: 'URL Musik (MP3/YouTube)' },
      musicAutoplay: {
        type: 'select',
        label: 'Musik Autoplay',
        options: [
          { label: 'Ya', value: 'yes' },
          { label: 'Tidak', value: 'no' }
        ]
      },
      musicOffsetSec: { type: 'number', label: 'Mulai Musik dari Detik' },
      guestBookEnabled: {
        type: 'select',
        label: 'Buku Tamu & Ucapan',
        options: [
          { label: 'Tampilkan', value: 'yes' },
          { label: 'Sembunyikan', value: 'no' }
        ]
      },
      guestBookTitle: { type: 'text', label: 'Judul Buku Tamu' },
      checkinEnabled: {
        type: 'select',
        label: 'Absensi QR (Check-in)',
        options: [
          { label: 'Tampilkan', value: 'yes' },
          { label: 'Sembunyikan', value: 'no' }
        ]
      },
      religion: {
        type: 'select',
        label: 'Agama (Preset Ucapan)',
        options: RELIGIONS.map((r) => ({ label: r.label, value: r.key }))
      }
    },
    defaultProps: {
      ...defaultTheme,
      decor: [],
      showCover: 'yes',
      coverGreeting: 'Kepada Yth.',
      coverButtonText: 'Buka Undangan',
      coverStyle: 'floral',
      musicUrl: '',
      musicAutoplay: 'yes',
      musicOffsetSec: 0,
      guestBookEnabled: 'yes',
      guestBookTitle: 'Buku Tamu & Ucapan',
      checkinEnabled: 'yes',
      religion: 'islam'
    },
    render: ({ children, primary, secondary, background, text, fontHeading, fontBody, decor }) => (
      <div
        className="invitation-canvas relative mx-auto min-h-[100dvh] w-full max-w-[430px] overflow-x-hidden"
        style={
          {
            '--color-primary': primary,
            '--color-secondary': secondary,
            '--color-background': background,
            '--color-text': text,
            '--font-heading': `'${fontHeading}', serif`,
            '--font-body': `'${fontBody}', sans-serif`,
            backgroundColor: background,
            color: text,
            fontFamily: `'${fontBody}', sans-serif`
          } as React.CSSProperties
        }
      >
        <link
          rel="stylesheet"
          href={`https://fonts.googleapis.com/css2?${Array.from(new Set([fontHeading, fontBody]))
            .map((f) => `family=${encodeURIComponent(f)}`)
            .join('&')}&display=swap`}
        />
        {children}
        <DecorLayer decor={decor} />
      </div>
    )
  },
  categories: {
    intro: { title: 'Header & Intro', components: ['Hero', 'Couple', 'Quote'] },
    konten: { title: 'Konten', components: ['Countdown', 'EventDetail', 'Story', 'Thanks'] },
    media: { title: 'Media & Lokasi', components: ['Gallery', 'Maps'] },
    interaktif: { title: 'Interaktif', components: ['Rsvp', 'GiftList', 'Envelope'] },
    dekorasi: { title: 'Dekorasi', components: ['Divider', 'RunningText'] }
  }
};
