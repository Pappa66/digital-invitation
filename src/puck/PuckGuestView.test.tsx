import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/image', () => ({
  default: function MockImage(props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean }) {
    const { fill, priority, ...rest } = props;
    void priority;
    // eslint-disable-next-line @next/next/no-img-element -- mock test
    return <img {...rest} style={{ position: fill ? 'absolute' : undefined }} alt={props.alt ?? ''} />;
  }
}));

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

// lottie-web butuh canvas (tidak tersedia di jsdom).
vi.mock('lottie-react', () => ({ default: () => null }));

import PuckGuestView from './PuckGuestView';
import { sampleData } from '@/puck/sample';

describe('PuckGuestView', () => {
  it('merender blok undangan + cover dengan nama pasangan', () => {
    render(<PuckGuestView canvas={sampleData} projectId="p1" greetingName="Bapak Tamu" />);
    // Nama muncul di cover & blok
    expect(screen.getAllByText(/Sena Ayudia/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Buka Undangan/i)).toBeInTheDocument();
    expect(screen.getByText(/Bapak Tamu/)).toBeInTheDocument();
  });

  it('menyembunyikan cover saat showCover = no', () => {
    const data = { ...sampleData, root: { props: { ...sampleData.root.props, showCover: 'no' as const } } } as typeof sampleData;
    render(<PuckGuestView canvas={data} projectId="p1" />);
    expect(screen.queryByText(/Buka Undangan/i)).toBeNull();
  });

  it('menampilkan bagian absensi saat checkinEnabled (default)', () => {
    const data = { ...sampleData, root: { props: { ...sampleData.root.props, showCover: 'no' as const, checkinEnabled: 'yes' as const } } } as typeof sampleData;
    render(<PuckGuestView canvas={data} projectId="p1" />);
    expect(screen.getByText(/Absensi/i)).toBeInTheDocument();
  });
});
