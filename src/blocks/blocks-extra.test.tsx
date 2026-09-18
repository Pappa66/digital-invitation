import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import Story from '@/blocks/Story';
import Quote from '@/blocks/Quote';
import Thanks from '@/blocks/Thanks';
import Maps from '@/blocks/Maps';
import GiftList from '@/blocks/GiftList';
import Envelope from '@/blocks/Envelope';
import Divider from '@/blocks/Divider';
import type { Position } from '@/puck/types';

const flow: Position = { mode: 'flow', x: 0, y: 0 };

describe('Story', () => {
  it('merender judul dan item kisah', () => {
    render(
      <Story
        title="Kisah Kami"
        items={[{ year: '2019', title: 'Pertemuan', description: 'Di kampus.' }]}
        position={flow}
      />
    );
    expect(screen.getByText('Kisah Kami')).toBeInTheDocument();
    expect(screen.getByText('Pertemuan')).toBeInTheDocument();
  });
});

describe('Quote', () => {
  it('merender kutipan dan sumber', () => {
    render(<Quote text="Cinta itu sabar." source="QS. Ar-Rum" position={flow} />);
    expect(screen.getByText('Cinta itu sabar.')).toBeInTheDocument();
    expect(screen.getByText(/QS. Ar-Rum/)).toBeInTheDocument();
  });
});

describe('Thanks', () => {
  it('merender pesan terima kasih', () => {
    render(<Thanks title="Terima Kasih" message="Sampai jumpa di hari bahagia kami." position={flow} />);
    expect(screen.getByText('Terima Kasih')).toBeInTheDocument();
    expect(screen.getByText(/Sampai jumpa/)).toBeInTheDocument();
  });
});

describe('Maps', () => {
  it('menampilkan alamat dan tombol Google Maps', () => {
    render(<Maps title="Lokasi" address="Grand Ballroom, Jakarta" position={flow} />);
    expect(screen.getByText('Grand Ballroom, Jakarta')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /google maps/i })).toBeInTheDocument();
  });
});

describe('GiftList & Envelope', () => {
  it('GiftList merender rekening', () => {
    render(
      <GiftList
        title="Kirim Hadiah"
        accounts={[{ bankName: 'Bank Mandiri', accountNumber: '1234567890', accountHolder: 'Sena' }]}
        position={flow}
      />
    );
    expect(screen.getByText('1234567890')).toBeInTheDocument();
    expect(screen.getByText(/Sena/)).toBeInTheDocument();
  });

  it('Envelope merender rekening', () => {
    render(
      <Envelope
        title="Amplop Online"
        accounts={[{ bankName: 'BCA', accountNumber: '999', accountHolder: 'Panca' }]}
        position={flow}
      />
    );
    expect(screen.getByText('999')).toBeInTheDocument();
  });
});

describe('Divider', () => {
  it('merender pembatas (aria-hidden)', () => {
    const { container } = render(<Divider variant="diamond" position={flow} />);
    expect(container.querySelector('[aria-hidden]')).toBeTruthy();
  });
});
