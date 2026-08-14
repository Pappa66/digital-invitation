import { describe, expect, it } from 'vitest';
import type { TemplateMeta, CanvasData } from '@/lib/types';
import { TEMPLATE_LIST, getTemplate, emptyCanvas } from '@/lib/templates';

const TEMPLATE_IDS = TEMPLATE_LIST.map((t) => t.id);
const VALID_TYPES = ['Hero', 'Couple', 'Countdown', 'EventDetail', 'Story', 'Gallery', 'RSVP', 'Maps', 'Thanks', 'Divider'];

function loadTemplateRaw(id: string): CanvasData {
  // cjs require dengan path relatif ke folder templates/
  const raw: unknown = require(`../../../templates/${id}.json`);
  return raw as CanvasData;
}

describe('templates registry', () => {
  it('provides at least 10 templates', () => {
    expect(TEMPLATE_LIST.length).toBeGreaterThanOrEqual(10);
  });

  it('index matches actual template files (no broken reference)', () => {
    for (const id of TEMPLATE_IDS) {
      expect(loadTemplateRaw(id)).toBeDefined();
    }
  });

  it('each template registration has unique id', () => {
    const ids = TEMPLATE_LIST.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('metadata has all required fields', () => {
    for (const t of TEMPLATE_LIST as TemplateMeta[]) {
      expect(t.name).toBeTruthy();
      expect(t.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(t.secondary).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it('exposes emerald-khaki as the newest template', () => {
    expect(TEMPLATE_IDS).toContain('emerald-khaki');
  });
});

describe('template structure (canvas_data)', () => {
  it('every template has required theme + settings + blocks', () => {
    for (const id of TEMPLATE_IDS) {
      const t = loadTemplateRaw(id);
      expect(t.theme.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(t.theme.secondary).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(t.theme.background).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(t.theme.font_heading).toBeTruthy();
      expect(t.theme.font_body).toBeTruthy();
      expect(typeof t.settings).toBe('object');
      expect(Array.isArray(t.blocks)).toBe(true);
      expect(t.blocks.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('every block has unique id, valid type, and props object', () => {
    for (const id of TEMPLATE_IDS) {
      const t = loadTemplateRaw(id);
      const ids = t.blocks.map((b) => b.id);
      expect(new Set(ids).size, `${id}: duplicate block id`).toBe(ids.length);
      for (const block of t.blocks) {
        expect(VALID_TYPES, `${id}: unknown type ${block.type}`).toContain(block.type);
        expect(block.props).toBeInstanceOf(Object);
      }
    }
  });

  it('RSVP blocks must carry a deadline', () => {
    for (const id of TEMPLATE_IDS) {
      const t = loadTemplateRaw(id);
      for (const block of t.blocks) {
        if (block.type === 'RSVP') {
          expect(block.props.deadline, `${id}: RSVP tanpa deadline`).toBeTruthy();
        }
      }
    }
  });
});

describe('getTemplate', () => {
  it('returns a deep clone so store edits never mutate the raw template', () => {
    const a = getTemplate('elegant-gold')!;
    const b = getTemplate('elegant-gold')!;
    expect(a).not.toBe(b);
    (a.blocks[0].props as Record<string, string>).title = 'HACKED';
    const c = getTemplate('elegant-gold')!;
    expect((c.blocks[0].props as Record<string, string>).title).not.toBe('HACKED');
  });

  it('returns null for unknown id', () => {
    expect(getTemplate('does-not-exist')).toBeNull();
  });
});

describe('emptyCanvas', () => {
  it('produces an empty but well-formed canvas', () => {
    const c = emptyCanvas();
    expect(c.blocks).toEqual([]);
    expect(c.theme.primary).toBeTruthy();
    expect(c.settings.guest_book_enabled).toBe(false);
  });
});