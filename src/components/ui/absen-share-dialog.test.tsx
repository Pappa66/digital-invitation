import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AbsenShareDialog from '@/components/ui/absen-share-dialog';

const PROJECT_ID = '123e4567-e89b-12d3-a456-426614174000';

describe('AbsenShareDialog — QR absen per project (menu dashboard/builder)', () => {
  beforeEach(() => {
    // jsdom tidak punya clipboard API; sediakan mock yang sukses secara default.
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true
    });
  });

  it('merender dialog berjudul QR Absen dengan QR SVG terkait URL absen proyek', async () => {
    const { unmount } = render(<AbsenShareDialog open projectId={PROJECT_ID} onClose={() => {}} />);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'QR Absen' })).toBeInTheDocument();

    // react-qr-code v2 tanpa <title>; QR adalah SVG lebar 180 dengan <path d> berisi banyak perintah.
    const qrSvg = document.querySelector<SVGSVGElement>('svg[width="180"]');
    expect(qrSvg).toBeInTheDocument();
    const d = qrSvg!.querySelector('path')?.getAttribute('d');
    expect(d?.length ?? 0).toBeGreaterThan(200);
    const firstHash = qrSvg!.outerHTML;

    // Proyek berbeda → nilai QR berbeda (QR benar-benar mengkodekan URL absen proyek).
    unmount();
    render(<AbsenShareDialog open projectId="another-project-id" onClose={() => {}} />);
    await screen.findByRole('dialog');
    const secondSvg = document.querySelector<SVGAElement>('svg[width="180"]');
    expect(secondSvg).toBeInTheDocument();
    expect(secondSvg!.outerHTML).not.toBe(firstHash);
  });

  it('link "Buka halaman absen" mengarah ke URL absen yang sama (tab baru + rel noopener)', async () => {
    render(<AbsenShareDialog open projectId={PROJECT_ID} onClose={() => {}} />);

    const link = await screen.findByRole('link', { name: /Buka halaman absen/i });
    expect(link).toHaveAttribute('href', `${window.location.origin}/absen/${PROJECT_ID}`);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('tombol Salin menyalin URL absen ke clipboard dan menampilkan feedback "Tersalin"', async () => {
    // userEvent.setup() MENGANGGURKAN navigator.clipboard dengan stub miliknya,
    // maka setup dulu, baru timpa dengan mock kita.
    const user = userEvent.setup();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
      writable: true
    });
    render(<AbsenShareDialog open projectId={PROJECT_ID} onClose={() => {}} />);

    await user.click(await screen.findByRole('button', { name: /Salin Link/i }));

    const writeText = (navigator.clipboard as unknown as { writeText: ReturnType<typeof vi.fn> }).writeText;
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/absen/${PROJECT_ID}`));
    expect(await screen.findByRole('button', { name: /Tersalin/i })).toBeInTheDocument();
  });

  it('saat clipboard ditolak, tombol tetap "Salin Link" tanpa feedback palsu', async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockRejectedValue(new Error('Permission denied')) },
      configurable: true,
      writable: true
    });
    render(<AbsenShareDialog open projectId={PROJECT_ID} onClose={() => {}} />);

    await user.click(await screen.findByRole('button', { name: /Salin Link/i }));

    expect(await screen.findByRole('button', { name: /Salin Link/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Tersalin/i })).not.toBeInTheDocument();
  });

  it('open=false tidak merender dialog sama sekali', () => {
    const { container } = render(<AbsenShareDialog open={false} projectId={PROJECT_ID} onClose={() => {}} />);
    expect(container.innerHTML).toBe('');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('menutup dialog (tombol Close) memanggil onClose', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<AbsenShareDialog open projectId={PROJECT_ID} onClose={onClose} />);

    // Radix Dialog mengekspos tombol tutup bernama "Close" di pojok kanan atas.
    await user.click(await screen.findByRole('button', { name: /Close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});