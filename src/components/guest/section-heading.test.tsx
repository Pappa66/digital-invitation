import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import SectionHeading from '@/components/guest/section-heading';

describe('SectionHeading — heading section seragam', () => {
  it('menampilkan kicker uppercase, judul h2, dan pembatas intan emas', () => {
    const { container } = render(<SectionHeading kicker="Doa & Ucapan" title="Buku Tamu" />);

    expect(screen.getByText('Doa & Ucapan')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Buku Tamu' })).toBeInTheDocument();
    // Pembatas: intan diputar 45° sebagai aksen emas.
    expect(container.querySelector('.rotate-45')).not.toBeNull();
  });

  it('meneruskan id ke elemen judul (anchor / aria-labelledby)', () => {
    render(<SectionHeading id="penutup" title="Terima Kasih" />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveAttribute('id', 'penutup');
  });
});
