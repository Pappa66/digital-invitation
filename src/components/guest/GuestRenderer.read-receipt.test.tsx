import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import GuestRenderer from '@/components/guest/GuestRenderer';
import { emptyCanvas } from '@/lib/templates';
import type { CanvasData } from '@/lib/types';

const { rpcMock, demoModeMock } = vi.hoisted(() => ({
  rpcMock: vi.fn(),
  demoModeMock: vi.fn(() => false)
}));

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    rpc: rpcMock,
    from: () => ({ insert: vi.fn() })
  }
}));

vi.mock('@/lib/env', () => ({
  demoIsDemoMode: demoModeMock
}));

const PROJECT_ID = '123e4567-e89b-12d3-a456-426614174000';

/** Canvas ramping: tanpa cover/guestbook/checkin agar fokus ke efek read-receipt. */
function minimalCanvas(): CanvasData {
  const base = emptyCanvas();
  return {
    ...base,
    settings: {
      ...base.settings,
      show_cover: false,
      guest_book_enabled: false,
      checkin_enabled: false,
      music_url: ''
    }
  };
}

beforeEach(() => {
  rpcMock.mockReset();
  rpcMock.mockResolvedValue({ data: true, error: null });
  demoModeMock.mockReset();
  demoModeMock.mockReturnValue(false);
  sessionStorage.clear();
});

describe('GuestRenderer — read-receipt "undangan dibuka"', () => {
  it('mencatat kunjungan sekali per sesi saat undangan immersive dibuka', async () => {
    render(<GuestRenderer canvas={minimalCanvas()} projectId={PROJECT_ID} />);

    await waitFor(() => expect(rpcMock).toHaveBeenCalledTimes(1));
    expect(rpcMock).toHaveBeenCalledWith('record_invitation_view', { p_project_id: PROJECT_ID });
    expect(sessionStorage.getItem(`di_viewed_${PROJECT_ID}`)).toBe('1');
  });

  it('tidak mencatat ulang bila sesi sudah menandai project ini', async () => {
    sessionStorage.setItem(`di_viewed_${PROJECT_ID}`, '1');
    render(<GuestRenderer canvas={minimalCanvas()} projectId={PROJECT_ID} />);

    await waitFor(() => expect(sessionStorage.getItem(`di_viewed_${PROJECT_ID}`)).toBe('1'));
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it('tidak mencatat saat preview builder', async () => {
    render(<GuestRenderer canvas={minimalCanvas()} projectId={PROJECT_ID} preview />);
    await waitFor(() => expect(rpcMock).not.toHaveBeenCalled());
  });

  it('tidak mencatat tanpa projectId', async () => {
    render(<GuestRenderer canvas={minimalCanvas()} />);
    await waitFor(() => expect(rpcMock).not.toHaveBeenCalled());
  });

  it('tidak mencatat saat mode demo (env) aktif', async () => {
    demoModeMock.mockReturnValue(true);
    render(<GuestRenderer canvas={minimalCanvas()} projectId={PROJECT_ID} />);
    await waitFor(() => expect(rpcMock).not.toHaveBeenCalled());
  });

  it('tidak mencatat saat prop demo aktif', async () => {
    render(<GuestRenderer canvas={minimalCanvas()} projectId={PROJECT_ID} demo />);
    await waitFor(() => expect(rpcMock).not.toHaveBeenCalled());
  });

  it('error RPC diabaikan (fire-and-forget) tanpa mengganggu render', async () => {
    rpcMock.mockRejectedValue(new Error('network down'));
    const { container } = render(<GuestRenderer canvas={minimalCanvas()} projectId={PROJECT_ID} />);

    await waitFor(() => expect(rpcMock).toHaveBeenCalledTimes(1));
    expect(container.querySelector('.guest-root')).not.toBeNull();
  });
});
