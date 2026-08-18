'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createServerSupabase, requireInternalUser } from '@/lib/supabase/server';

const OrderStatusSchema = z.enum(['pending', 'approved', 'rejected']);
const UuidSchema = z.string().uuid('ID tidak valid');

type OrderResult = { error?: string };

/**
 * Ubah status pesanan. Hanya internal (operator) — RLS orders.update
 * menegakkan is_internal() di database, dan gate email ganda di app.
 * Update tidak lagi dari client langsung (mencegah bypass otorisasi).
 */
export async function updateOrderStatus(orderId: string, status: string): Promise<OrderResult> {
  const user = await requireInternalUser();
  if (!user) return { error: 'Unauthorized' };

  const parsedId = UuidSchema.safeParse(orderId);
  const parsedStatus = OrderStatusSchema.safeParse(status);
  if (!parsedId.success || !parsedStatus.success) return { error: 'Input tidak valid' };

  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from('orders')
    .update({ status: parsedStatus.data })
    .eq('id', parsedId.data);

  if (error) return { error: error.message };
  revalidatePath('/orders');
  return {};
}

/** Tautkan pesanan ke project yang baru dibuat (status otomatis approved). */
export async function setOrderProject(orderId: string, projectId: string): Promise<OrderResult> {
  const user = await requireInternalUser();
  if (!user) return { error: 'Unauthorized' };

  const parsedId = UuidSchema.safeParse(orderId);
  const parsedProject = UuidSchema.safeParse(projectId);
  if (!parsedId.success || !parsedProject.success) return { error: 'Input tidak valid' };

  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from('orders')
    .update({ project_id: parsedProject.data, status: 'approved' })
    .eq('id', parsedId.data);

  if (error) return { error: error.message };
  revalidatePath('/orders');
  return {};
}

/** Hapus pesanan (internal only). */
export async function deleteOrder(orderId: string): Promise<OrderResult> {
  const user = await requireInternalUser();
  if (!user) return { error: 'Unauthorized' };

  const parsedId = UuidSchema.safeParse(orderId);
  if (!parsedId.success) return { error: 'Input tidak valid' };

  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', parsedId.data);

  if (error) return { error: error.message };
  revalidatePath('/orders');
  return {};
}
