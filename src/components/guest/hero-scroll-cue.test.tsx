import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HeroBlock } from '@/components/guest/blocks';

vi.mock('next/image', () => ({
  default: function MockImage(props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean }) {
    const { fill, priority: _priority, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element -- mock test, bukan prod
    return <img {...rest} style={{ position: fill ? 'absolute' : undefined }} alt={props.alt ?? ''} />;
  }
}));

beforeEach(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

describe('HeroBlock — scroll cue', () => {
  it('menampilkan tombol gulir dengan label aksesibel', () => {
    render(<HeroBlock props={{ bride: 'Sena', groom: 'Panca' }} />);
    expect(screen.getByRole('button', { name: 'Gulir ke bagian berikutnya' })).toBeInTheDocument();
  });

  it('klik scroll cue menggulir ke section berikutnya tanpa memicu invite-opened', () => {
    const spy = vi.fn();
    window.addEventListener('invite-opened', spy);
    render(<HeroBlock props={{ bride: 'Sena', groom: 'Panca' }} />);

    fireEvent.click(screen.getByRole('button', { name: 'Gulir ke bagian berikutnya' }));

    expect(window.scrollTo).toHaveBeenCalled();
    expect(spy).not.toHaveBeenCalled();
    window.removeEventListener('invite-opened', spy);
  });
});
