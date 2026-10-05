import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTemplateAutosave } from '@/hooks/use-template-autosave';
import type { CanvasData } from '@/lib/types';

const { updateTemplateMock, demoModeMock } = vi.hoisted(() => ({
  updateTemplateMock: vi.fn(),
  demoModeMock: vi.fn(() => false)
}));

vi.mock('@/lib/api/custom-templates', () => ({
  updateTemplate: updateTemplateMock
}));

vi.mock('@/lib/env', () => ({
  demoIsDemoMode: demoModeMock
}));

const canvasA = { theme: {}, settings: {}, blocks: [] } as unknown as CanvasData;
const canvasB = { ...canvasA, blocks: [{ id: 'b1' }] } as unknown as CanvasData;

beforeEach(() => {
  updateTemplateMock.mockReset();
  updateTemplateMock.mockResolvedValue({});
  demoModeMock.mockReturnValue(false);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useTemplateAutosave', () => {
  it('tidak menulis saat pertama kali diaktifkan (hasil muat awal bukan aksi user)', async () => {
    const { rerender } = renderHook(
      ({ canvas, enabled }: { canvas: CanvasData; enabled: boolean }) =>
        useTemplateAutosave('tpl-1', canvas, enabled),
      { initialProps: { canvas: canvasA, enabled: false } }
    );

    rerender({ canvas: canvasA, enabled: true });
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(updateTemplateMock).not.toHaveBeenCalled();
  });

  it('menulis canvas_data secara debounced setelah canvas berubah', async () => {
    const { result, rerender } = renderHook(
      ({ canvas, enabled }: { canvas: CanvasData; enabled: boolean }) =>
        useTemplateAutosave('tpl-1', canvas, enabled),
      { initialProps: { canvas: canvasA, enabled: false } }
    );

    rerender({ canvas: canvasA, enabled: true });
    rerender({ canvas: canvasB, enabled: true });

    await act(async () => {
      vi.advanceTimersByTime(900);
    });

    expect(updateTemplateMock).toHaveBeenCalledWith('tpl-1', { canvas_data: canvasB });
    expect(result.current.status).toBe('saved');
  });

  it('menandai status error bila updateTemplate mengembalikan error', async () => {
    updateTemplateMock.mockResolvedValue({ error: 'RLS menolak' });

    const { result, rerender } = renderHook(
      ({ canvas, enabled }: { canvas: CanvasData; enabled: boolean }) =>
        useTemplateAutosave('tpl-1', canvas, enabled),
      { initialProps: { canvas: canvasA, enabled: false } }
    );

    rerender({ canvas: canvasA, enabled: true });
    rerender({ canvas: canvasB, enabled: true });

    await act(async () => {
      vi.advanceTimersByTime(900);
    });

    expect(result.current.status).toBe('error');
  });

  it('flush perubahan yang menunggu debounce saat unmount', async () => {
    const { rerender, unmount } = renderHook(
      ({ canvas, enabled }: { canvas: CanvasData; enabled: boolean }) =>
        useTemplateAutosave('tpl-1', canvas, enabled),
      { initialProps: { canvas: canvasA, enabled: false } }
    );

    rerender({ canvas: canvasA, enabled: true });
    rerender({ canvas: canvasB, enabled: true });
    expect(updateTemplateMock).not.toHaveBeenCalled();

    unmount();
    await act(async () => {
      await Promise.resolve();
    });

    expect(updateTemplateMock).toHaveBeenCalledWith('tpl-1', { canvas_data: canvasB });
  });

  it('saveNow tidak menyentuh database pada mode demo', async () => {
    demoModeMock.mockReturnValue(true);

    const { result } = renderHook(() => useTemplateAutosave('tpl-1', canvasA, false));

    let outcome: { error?: string } = {};
    await act(async () => {
      outcome = await result.current.saveNow(canvasA);
    });

    expect(updateTemplateMock).not.toHaveBeenCalled();
    expect(outcome.error).toBeTruthy();
    expect(result.current.status).toBe('error');
  });
});
