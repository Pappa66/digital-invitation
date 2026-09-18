import { describe, expect, it } from 'vitest';
import { config } from '@/puck/config';
import { defaultTheme } from '@/puck/theme';

const CORE_COMPONENTS = [
  'Hero',
  'Couple',
  'Countdown',
  'EventDetail',
  'Story',
  'Gallery',
  'Quote',
  'Maps',
  'GiftList',
  'Divider',
  'Thanks',
  'Envelope',
  'RunningText',
  'Rsvp'
];

describe('puck config', () => {
  it('mendaftarkan seluruh komponen inti', () => {
    const components = config.components as Record<string, unknown>;
    for (const name of CORE_COMPONENTS) {
      expect(components[name], `komponen ${name} terdaftar`).toBeTruthy();
    }
  });

  it('setiap komponen inti punya defaultProps.position dan entrance', () => {
    const components = config.components as Record<string, { defaultProps?: Record<string, unknown> }>;
    for (const name of CORE_COMPONENTS) {
      expect(components[name]?.defaultProps, `${name}.defaultProps`).toHaveProperty('position');
      expect(components[name]?.defaultProps, `${name}.defaultProps`).toHaveProperty('entrance');
    }
  });

  it('root menyediakan field tema lengkap', () => {
    const fields = config.root?.fields as Record<string, unknown> | undefined;
    expect(fields).toBeTruthy();
    for (const key of Object.keys(defaultTheme)) {
      expect(fields, `field tema ${key}`).toHaveProperty(key);
    }
  });

  it('root defaultProps memuat tema default + decor', () => {
    const props = config.root?.defaultProps as Record<string, unknown> | undefined;
    for (const [key, value] of Object.entries(defaultTheme)) {
      expect(props?.[key], `root.${key}`).toBe(value);
    }
    expect(Array.isArray(props?.decor)).toBe(true);
  });
});
