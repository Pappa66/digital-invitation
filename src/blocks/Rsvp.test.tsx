import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

vi.mock('@/lib/supabase/client', () => ({
  supabase: { from: () => ({ insert: async () => ({ error: null }) }) }
}));
vi.mock('@/lib/env', () => ({ demoIsDemoMode: () => false }));
vi.mock('@/lib/site', () => ({ getSiteOrigin: () => 'https://example.com' }));

import Rsvp from './Rsvp';

const flow = { mode: 'flow' as const, x: 0, y: 0 };

describe('Rsvp (blok baru)', () => {
  it('menyimpan konfirmasi lalu menampilkan QR absensi personal', async () => {
    render(<Rsvp title="Konfirmasi" position={flow} puck={{ metadata: { projectId: 'p1' } }} />);
    fireEvent.change(screen.getByPlaceholderText('Nama Anda'), { target: { value: 'Budi Santoso' } });
    fireEvent.click(screen.getByRole('button', { name: /kirim konfirmasi/i }));

    await waitFor(() => {
      expect(screen.getByText(/terima kasih/i)).toBeInTheDocument();
    });
    // QR berisi URL absen dengan token (react-qr-code menaruh <title> di dalam svg)
    const title = document.querySelector('svg title');
    expect(title?.textContent || '').toContain('/absen/p1?t=');
  });
});
