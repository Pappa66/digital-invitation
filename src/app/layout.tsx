import type { Metadata } from 'next';
import { Playfair_Display, Great_Vibes, Jost } from 'next/font/google';
import { Toaster } from 'sonner';
import MotionProvider from '@/components/ui/motion-provider';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap'
});

const greatVibes = Great_Vibes({
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

export const metadata: Metadata = {
  title: 'Prasha Digital — Undangan Digital Pernikahan',
  description: 'Undangan digital mewah dan personal untuk hari bahagia Anda, dirancang oleh Prasha Digital Indonesia.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${playfair.variable} ${greatVibes.variable} ${jost.variable} bg-background font-body text-foreground antialiased`}>
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