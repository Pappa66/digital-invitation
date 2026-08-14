import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Digital Invitation Builder',
  description: 'Internal invitation builder platform by Prasha Digital Indonesia'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-dashboard-bg text-gray-900 antialiased">{children}</body>
    </html>
  );
}