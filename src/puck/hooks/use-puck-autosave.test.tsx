import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, act, fireEvent } from '@testing-library/react';
import { useState } from 'react';

const hoisted = vi.hoisted(() => {
  const update = vi.fn();
  const eq = vi.fn(async () => ({ error: null }));
  return { update, eq };
});

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: () => ({
      update: (payload: unknown) => {
        hoisted.update(payload);
        return { eq: hoisted.eq };
      }
    })
  }
}));

import { usePuckAutosave } from './use-puck-autosave';
import { emptyPuckData, type PuckData } from '@/lib/canvas/puck-format';

function Harness() {
  const [data, setData] = useState<PuckData>(() => emptyPuckData());
  const status = usePuckAutosave({ projectId: 'p1', data, enabled: true });
  return (
    <div>
      <span data-testid="status">{status}</span>
      <button type="button" onClick={() => setData((prev) => ({ ...prev, content: [...prev.content] }))}>
        change
      </button>
    </div>
  );
}

describe('usePuckAutosave', () => {
  beforeEach(() => {
    hoisted.update.mockClear();
    hoisted.eq.mockClear();
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('tidak menyimpan saat render pertama, lalu menyimpan setelah data berubah', async () => {
    const { getByText, getByTestId } = render(<Harness />);
    expect(hoisted.update).not.toHaveBeenCalled();
    expect(getByTestId('status').textContent).toBe('idle');

    fireEvent.click(getByText('change'));
    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    expect(hoisted.update).toHaveBeenCalledTimes(1);
    const payload = hoisted.update.mock.calls[0][0] as Record<string, unknown>;
    expect(payload).toHaveProperty('canvas_data');
    expect(payload).toHaveProperty('updated_at');
    expect(hoisted.eq).toHaveBeenCalledWith('project_id', 'p1');
  });
});
