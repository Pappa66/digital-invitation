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

export const metadata: Metadata = {
  title: 'Prasha Digital — Undangan Digital Pernikahan',
  description: 'Undangan digital mewah dan personal untuk hari bahagia Anda, dirancang oleh Prasha Digital Indonesia.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
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