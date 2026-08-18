import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AbsenPage from '@/app/absen/[projectId]/page';

const { getAbsProjectMetaMock } = vi.hoisted(() => ({
  getAbsProjectMetaMock: vi.fn()
}));

vi.mock('@/lib/actions/checkin-actions', () => ({
  getAbsProjectMeta: getAbsProjectMetaMock
}));

const { scannerProps } = vi.hoisted(() => ({
  scannerProps: vi.fn()
}));

vi.mock('@/components/absen/AbsenScanner', () => ({
  default: (props: { projectId: string }) => {
    scannerProps(props);
    return <div data-testid="mock-scanner" />;
  }
}));

const PROJECT_ID = '123e4567-e89b-12d3-a456-426614174001';

beforeEach(() => {
  getAbsProjectMetaMock.mockReset();
  scannerProps.mockReset();
});

describe('AbsenPage — route /absen/[projectId] tanpa login (AC C)', () => {
  it('project published: render metadata + scanner, tanpa bocorkan data lain', async () => {
    getAbsProjectMetaMock.mockResolvedValue({
      meta: { id: PROJECT_ID, title: 'Panca & Sena', slug: 'panca-sena' }
    });

    render(await AbsenPage({ params: Promise.resolve({ projectId: PROJECT_ID }) }));

    expect(screen.getByRole('heading', { name: 'Panca & Sena' })).toBeInTheDocument();
    expect(screen.getByTestId('mock-scanner')).toBeInTheDocument();
    // Scanner menerima project id asli untuk verifikasi token.
    expect(scannerProps).toHaveBeenCalledWith({ projectId: PROJECT_ID });
    // SECURITY: slug (jalur undangan publik) tidak dirender di halaman absen.
    expect(screen.queryByText('panca-sena')).not.toBeInTheDocument();
  });

  it('project draft / tidak ditemukan: menolak tanpa metadata & tanpa scanner', async () => {
    getAbsProjectMetaMock.mockResolvedValue({ error: 'Proyek tidak ditemukan atau belum dipublikasikan' });

    render(await AbsenPage({ params: Promise.resolve({ projectId: PROJECT_ID }) }));

    expect(screen.getByText(/Undangan tidak ditemukan atau belum dipublikasikan/)).toBeInTheDocument();
    expect(screen.queryByTestId('mock-scanner')).not.toBeInTheDocument();
    // Judul undangan (metadata) TIDAK boleh bocor untuk project draft.
    expect(screen.queryByRole('heading', { name: /Panca|Sena/i })).not.toBeInTheDocument();
    expect(scannerProps).not.toHaveBeenCalled();
  });

  it('menyaring id non-uuid sebelum memanggil RPC metadata', async () => {
    getAbsProjectMetaMock.mockResolvedValue({ error: 'ID proyek tidak valid' });

    render(await AbsenPage({ params: Promise.resolve({ projectId: 'bukan-uuid' }) }));

    expect(screen.getByText(/Undangan tidak ditemukan atau belum dipublikasikan/)).toBeInTheDocument();
  });
});