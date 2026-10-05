import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import CoverModal from '@/components/guest/cover-modal';

// Matikan next/image agar test fokus pada perilaku dialog (tanpa server runtime).
vi.mock('next/image', () => ({
  default: function MockImage(props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean }) {
    const { fill, priority: _priority, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element -- mock test, bukan prod
    return <img {...rest} style={{ position: fill ? 'absolute' : undefined }} alt={props.alt ?? ''} />;
  }
}));

const baseProps = {
  caption: 'Undangan Pernikahan',
  bride: 'Sena',
  groom: 'Panca',
  date: '12 Desember 2026',
  background: '#FAF6EF',
  text: '#2b2620',
  primary: '#C9A45C',
  secondary: '#7C5D2E',
  // Beri gambar agar floral curtain (lazy + three.js) tidak dirender saat test.
  bgImage: '/cover.jpg',
  greetingName: 'Budi'
};

beforeEach(() => {
  document.body.style.overflow = '';
});

afterEach(() => {
  cleanup();
});

describe('CoverModal — aksesibilitas sampul', () => {
  it('memfokuskan tombol "Buka Undangan" saat sampul tampil', async () => {
    render(<CoverModal {...baseProps} />);
    const main = screen.getByRole('button', { name: 'Buka Undangan' });
    await waitFor(() => expect(main).toHaveFocus());
  });

  it('ESC memicu event invite-opened (sampul tidak menutup diam-diam)', () => {
    const spy = vi.fn();
    window.addEventListener('invite-opened', spy);
    render(<CoverModal {...baseProps} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(spy).toHaveBeenCalledTimes(1);
    window.removeEventListener('invite-opened', spy);
  });

  it('Tab dari elemen terakhir berputar ke elemen pertama (focus trap)', async () => {
    render(<CoverModal {...baseProps} />);
    const main = screen.getByRole('button', { name: 'Buka Undangan' });
    const skip = screen.getByRole('button', { name: 'Lewati sampul dan buka undangan' });
    await waitFor(() => expect(main).toHaveFocus());

    fireEvent.keyDown(document, { key: 'Tab' });

    expect(skip).toHaveFocus();
  });

  it('Shift+Tab dari elemen pertama berputar ke elemen terakhir (focus trap)', () => {
    render(<CoverModal {...baseProps} />);
    const main = screen.getByRole('button', { name: 'Buka Undangan' });
    const skip = screen.getByRole('button', { name: 'Lewati sampul dan buka undangan' });
    skip.focus();

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });

    expect(main).toHaveFocus();
  });
});
