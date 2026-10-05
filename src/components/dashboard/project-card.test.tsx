import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProjectCard from '@/components/dashboard/project-card';
import type { Project } from '@/lib/types';

const { rpcMock, fromMock, demoModeMock } = vi.hoisted(() => ({
  rpcMock: vi.fn(),
  fromMock: vi.fn(),
  demoModeMock: vi.fn(() => false)
}));

vi.mock('@/lib/supabase/client', () => ({
  supabase: { rpc: rpcMock, from: fromMock }
}));

vi.mock('@/lib/env', () => ({
  demoIsDemoMode: demoModeMock
}));

vi.mock('@/lib/demo/demo-store', () => ({
  demoGetDesign: () => null
}));

// ShareDialog menarik server action yang mengimpor modul server-only; cukup di-mock.
vi.mock('@/lib/actions/share-token-actions', () => ({
  generateShareToken: vi.fn(),
  listShareTokens: vi.fn(),
  revokeShareToken: vi.fn()
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() })
}));

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src?: string; alt?: string }) => <img src={src} alt={alt ?? ''} />
}));

const PROJECT_ID = '123e4567-e89b-12d3-a456-426614174000';

const project: Project = {
  id: PROJECT_ID,
  user_id: 'user-1',
  title: 'Raka & Salma',
  slug: 'raka-salma',
  status: 'published',
  thumbnail: null,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-02T00:00:00.000Z'
};

beforeEach(() => {
  rpcMock.mockReset();
  rpcMock.mockResolvedValue({
    data: [{ rsvp_total: 3, rsvp_hadir: 2, checkin_total: 1, views_total: 9 }],
    error: null
  });
  fromMock.mockReset();
  fromMock.mockReturnValue({
    select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) })
  });
  demoModeMock.mockReset();
  demoModeMock.mockReturnValue(false);
  sessionStorage.clear();
});

describe('ProjectCard — akses statistik host', () => {
  it('tidak memuat statistik sebelum tombol diklik (lazy per kartu)', () => {
    render(<ProjectCard project={project} onDuplicated={() => {}} onDeleted={() => {}} />);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it('tombol Statistik membuka dialog dan memuat statistik undangan itu', async () => {
    const user = userEvent.setup();
    render(<ProjectCard project={project} onDuplicated={() => {}} onDeleted={() => {}} />);

    await user.click(screen.getByRole('button', { name: 'Statistik' }));

    expect(await screen.findByText('Total RSVP')).toBeInTheDocument();
    await waitFor(() =>
      expect(rpcMock).toHaveBeenCalledWith('get_project_stats', { p_project_id: PROJECT_ID })
    );
    expect(screen.getByText('9')).toBeInTheDocument();
  });

  it('mode demo menyembunyikan tombol Statistik dan tidak memanggil RPC', () => {
    demoModeMock.mockReturnValue(true);
    render(<ProjectCard project={project} onDuplicated={() => {}} onDeleted={() => {}} />);

    expect(screen.queryByRole('button', { name: 'Statistik' })).not.toBeInTheDocument();
    expect(rpcMock).not.toHaveBeenCalled();
  });
});
