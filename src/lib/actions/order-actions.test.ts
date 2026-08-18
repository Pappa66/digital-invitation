import { beforeEach, describe, expect, it, vi } from 'vitest';
import { updateOrderStatus, setOrderProject, deleteOrder } from '@/lib/actions/order-actions';

const { requireInternalUserMock, createServerSupabaseMock } = vi.hoisted(() => ({
  requireInternalUserMock: vi.fn(),
  createServerSupabaseMock: vi.fn()
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabase: createServerSupabaseMock,
  requireInternalUser: requireInternalUserMock
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}));

const USER = { id: 'u1', email: 'digitalprasha@gmail.com' };

function chainError(error: { message: string } | null) {
  // Rantai .from().update({...}).eq(...) yang biasa dipakai server actions.
  return {
    update: vi.fn(() => ({ eq: vi.fn(async () => ({ error })) })),
    delete: vi.fn(() => ({ eq: vi.fn(async () => ({ error })) }))
  };
}

function mockSupabaseOk() {
  createServerSupabaseMock.mockReturnValue({
    from: vi.fn(() => chainError(null))
  });
}

beforeEach(() => {
  requireInternalUserMock.mockReset();
  createServerSupabaseMock.mockReset();
  requireInternalUserMock.mockResolvedValue(USER);
  mockSupabaseOk();
});

// Pastikan tidak ada aksi internal yang berjalan TANPA gate operator.
describe('order-actions (server actions internal) — gate otorisasi', () => {
  it('updateOrderStatus: menolak tanpa user internal', async () => {
    requireInternalUserMock.mockResolvedValue(null);
    expect(await updateOrderStatus('valid-uuid', 'approved')).toEqual({ error: 'Unauthorized' });
    expect(createServerSupabaseMock).not.toHaveBeenCalled();
  });

  it('updateOrderStatus: menolak order id / status tidak valid (input validation)', async () => {
    expect(await updateOrderStatus('not-a-uuid', 'approved')).toEqual({ error: 'Input tidak valid' });
    expect(await updateOrderStatus('00000000-0000-0000-0000-000000000000', 'hacked')).toEqual({ error: 'Input tidak valid' });
    expect(createServerSupabaseMock).not.toHaveBeenCalled();
  });

  it('updateOrderStatus: sukses untuk operator internal dengan status valid', async () => {
    const result = await updateOrderStatus('00000000-0000-0000-0000-000000000000', 'approved');
    expect(result).toEqual({});
    const fromMock = createServerSupabaseMock.mock.results[0].value.from;
    expect(fromMock).toHaveBeenCalledWith('orders');
  });

  it('setOrderProject: menolak tanpa user internal', async () => {
    requireInternalUserMock.mockResolvedValue(null);
    expect(await setOrderProject('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000')).toEqual({ error: 'Unauthorized' });
  });

  it('setOrderProject: menolak id non-uuid', async () => {
    expect(await setOrderProject('bad', '00000000-0000-0000-0000-000000000000')).toEqual({ error: 'Input tidak valid' });
    expect(await setOrderProject('00000000-0000-0000-0000-000000000000', 'bad')).toEqual({ error: 'Input tidak valid' });
  });

  it('setOrderProject: sukses mengaitkan + status otomatis approved', async () => {
    const result = await setOrderProject('123e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174002');
    expect(result).toEqual({});
  });

  it('deleteOrder: menolak tanpa user internal', async () => {
    requireInternalUserMock.mockResolvedValue(null);
    expect(await deleteOrder('00000000-0000-0000-0000-000000000000')).toEqual({ error: 'Unauthorized' });
  });

  it('deleteOrder: sukses untuk internal', async () => {
    expect(await deleteOrder('00000000-0000-0000-0000-000000000000')).toEqual({});
  });

  it('updateOrderStatus: meneruskan error dari Supabase', async () => {
    createServerSupabaseMock.mockReturnValue({
      from: vi.fn(() => chainError({ message: 'db: RLS denied' }))
    });
    expect(await updateOrderStatus('00000000-0000-0000-0000-000000000000', 'rejected')).toEqual({ error: 'db: RLS denied' });
  });
});