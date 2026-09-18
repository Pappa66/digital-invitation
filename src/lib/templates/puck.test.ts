import { describe, expect, it } from 'vitest';
import { PUCK_TEMPLATE_LIST, PUCK_TEMPLATES, getPuckTemplate } from './puck';
import { isPuckData } from '@/lib/canvas/puck-format';

describe('PUCK templates', () => {
  it('punya minimal 4 template', () => {
    expect(PUCK_TEMPLATES.length).toBeGreaterThanOrEqual(4);
    expect(PUCK_TEMPLATE_LIST.length).toBe(PUCK_TEMPLATES.length);
  });

  it('setiap template valid sebagai data Puck + punya tema & dekor', () => {
    for (const t of PUCK_TEMPLATES) {
      expect(isPuckData(t.data), t.id).toBe(true);
      expect(t.data.content.length).toBeGreaterThan(0);
      expect(t.data.root.props?.primary, `${t.id} primary`).toBeTruthy();
      expect(Array.isArray(t.data.root.props?.decor), `${t.id} decor`).toBe(true);
    }
  });

  it('getPuckTemplate mengembalikan null bila tidak ada', () => {
    expect(getPuckTemplate('tidak-ada')).toBeNull();
  });

  it('getPuckTemplate mengembalikan clone deep (mutasi tidak bocor)', () => {
    const first = getPuckTemplate('ivory-gold')!;
    (first.content[0].props as Record<string, unknown>).bride = 'HACKED';
    const second = getPuckTemplate('ivory-gold')!;
    expect((second.content[0].props as Record<string, unknown>).bride).not.toBe('HACKED');
  });
});
