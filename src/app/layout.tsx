import type { Metadata } from 'next';
import { Playfair_Display, Great_Vibes, Jost } from 'next/font/google';
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
      <body className={`${playfair.variable} ${greatVibes.variable} ${jost.variable} bg-dashboard-bg font-body text-gray-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}