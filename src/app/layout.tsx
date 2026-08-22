import type { Metadata } from 'next';
import { Cormorant_Garamond, Pinyon_Script, Jost } from 'next/font/google';
import { Toaster } from 'sonner';
import MotionProvider from '@/components/ui/motion-provider';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heading',
  display: 'swap'
});

const pinyon = Pinyon_Script({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-script',
  display: 'swap'
});

const jost = Jost({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap'
});

const SITE_URL = 'https://undangan-digital.prashadigitalindonesia.com';
const SITE_NAME = 'Prasha Digital';
const DEFAULT_OG = `${SITE_URL}/og-default.png`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Prasha Digital — Undangan Digital Pernikahan',
    template: '%s | Prasha Digital'
  },
  description: 'Undangan digital mewah dan personal untuk hari bahagia Anda. Desain elegan, mudah dibagikan, fitur lengkap — RSVP, musik, galeri, peta, dan absensi QR. Dirancang oleh Prasha Digital Indonesia.',
  keywords: ['undangan digital', 'undangan pernikahan online', 'wedding invitation', 'digital invitation', 'undangan elegan', 'Prasha Digital'],
  authors: [{ name: 'Prasha Digital Indonesia' }],
  creator: 'Prasha Digital Indonesia',
  publisher: 'Prasha Digital Indonesia',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'Prasha Digital — Undangan Digital Pernikahan',
    description: 'Undangan digital mewah dan personal untuk hari bahagia Anda. Desain elegan, mudah dibagikan, fitur lengkap.',
    images: [
      {
        url: DEFAULT_OG,
        width: 1200,
        height: 630,
        alt: 'Prasha Digital — Undangan Digital Pernikahan'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prasha Digital — Undangan Digital Pernikahan',
    description: 'Undangan digital mewah dan personal untuk hari bahagia Anda.',
    images: [DEFAULT_OG]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  alternates: {
    canonical: SITE_URL
  },
  icons: {
    icon: '/logo/prasha.png',
    apple: '/logo/prasha.png'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/logo/prasha.png" sizes="any" />
        <link rel="apple-touch-icon" href="/logo/prasha.png" />
        <meta name="theme-color" content="#c9a45c" />
      </head>
      <body className={`${cormorant.variable} ${pinyon.variable} ${jost.variable} bg-background font-body text-foreground antialiased`}>
        <MotionProvider>{children}</MotionProvider>
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            duration: 3000,
            style: {
              background: 'hsl(var(--foreground))',
              color: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))'
            }
          }}
        />
      </body>
    </html>
  );
}
