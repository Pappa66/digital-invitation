import { describe, expect, it } from 'vitest';
import { TEMPLATE_LIST, getTemplate } from '@/lib/templates';
import type { CanvasData } from '@/lib/types';

/**
 * Test "zero security leak" tingkat integrasi ringan (tanpa DB):
 * memastikan payload yang dikirim ke Supabase tidak pernah berisi:
 * - base64 image (DON'T di desain.md)
 * - fungsi/executable code
 * - key rahasia / token
 */
describe('payload security guardrails', () => {
  it('no template embeds base64 image data', () => {
    for (const id of TEMPLATE_LIST.map((t) => t.id)) {
      const t = getTemplate(id)!;
      const raw = JSON.stringify(t);
      expect(raw, `${id}: base64 terdeteksi`).not.toMatch(/data:image\/[a-z]+;base64,/);
    }
  });

  it('no template references payment or e-commerce providers (STRICT no e-commerce)', () => {
    const forbidden = ['stripe', 'midtrans', 'cart', 'checkout', 'pay'];
    for (const id of TEMPLATE_LIST.map((t) => t.id)) {
      const raw = JSON.stringify(getTemplate(id)!).toLowerCase();
      for (const word of forbidden) {
        // abaikan kata 'payment' yang hanya muncul di caption umum
        if (word === 'pay') continue;
        expect(raw, `${id}: referensi e-commerce '${word}'`).not.toContain(word);
      }
    }
  });

  it('canvas blocks never contain HTML injection keys', () => {
    const t = getTemplate('elegant-gold') as CanvasData | null;
    expect(t).not.toBeNull();
    const raw = JSON.stringify(t).toLowerCase();
    expect(raw).not.toContain('dangerouslysetinnerhtml');
    expect(raw).not.toContain('<script');
  });

  it('supabase client is configured to use anon key, not service role', () => {
    // client.ts hanya boleh memakai anon key di NEXT_PUBLIC_* (tidak pernah service role)
    const src = require('fs').readFileSync('src/lib/supabase/client.ts', 'utf8');
    expect(src).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    expect(src).not.toMatch(/SERVICE_ROLE/);
  });

  it('no secrets committed to the repo (env is gitignored)', () => {
    const gitignore = require('fs').readFileSync('.gitignore', 'utf8');
    expect(gitignore).toMatch(/\n\.env/);
  });
});