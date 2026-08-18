import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from '@/app/api/maps/route';

afterEach(() => {
  vi.unstubAllGlobals();
});

/** Helper panggil handler GET dengan query url. */
function call(rawUrl: string) {
  const url = `http://localhost:3000/api/maps?url=${encodeURIComponent(rawUrl)}`;
  return GET(new Request(url));
}

describe('apps/api/maps — SSRF guard (whitelist host)', () => {
  it('menolak URL non-whitelisted (host asing)', async () => {
    const res = await call('https://evil.example.com/map');
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ src: null });
  });

  it('menolak domain yang hanya menyerupai google (bukan subdomain/google.com)', async () => {
    for (const u of [
      'https://google.com.evil.com/maps',
      'https://evilgoogle.com/maps',
      'https://notgoogle.com/maps',
      'https://goog1e.com/maps'
    ]) {
      const res = await call(u);
      expect(res.status, u).toBe(400);
    }
  });

  it('menolak skema berbahaya (javascript:, file:, data:)', async () => {
    for (const u of [
      'javascript:alert(1)',
      'file:///etc/passwd',
      'data:text/html,<script>1</script>',
      'file:///proc/self/environ'
    ]) {
      const res = await call(u);
      expect(res.status, u).toBe(400);
    }
  });

  it('menolak target jaringan internal (loopback / link-local)', async () => {
    for (const u of [
      'http://127.0.0.1:3000/admin',
      'http://169.254.169.254/latest/meta-data/',
      'http://localhost:5432',
      'http://10.0.0.1/internal'
    ]) {
      const res = await call(u);
      expect(res.status, u).toBe(400);
    }
  });

  it('menerima URL google yang valid dan mengembalikan src embed', async () => {
    // Stub fetch agar tes offline: route meng-catch error jaringan dan memakai URL asli.
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const res = await call('https://maps.google.com/maps?q=Jakarta');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.src).toContain('output=embed');
    expect(body.src).toContain('maps.google.com');
  });

  it('menerima short link maps.app.goo.gl setelah redirect disimulasikan ke URL maps penuh', async () => {
    // fetch mengikuti redirect ke URL Google Maps yang valid, lalu host diverifikasi ulang.
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ url: 'https://maps.google.com/maps?q=Jakarta+Selatan' }));
    const res = await call('https://maps.app.goo.gl/abc123');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.src).toContain('output=embed');
    expect(body.src).toContain('maps.google.com');
  });

  it('menolak redirect ke host non-whitelisted (SSRF via redirect)', async () => {
    // fetch "berhasil" tapi URL akhir yang dipakai attacker mengarah ke internal.
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ url: 'http://169.254.169.254/latest/meta-data/' }));
    const res = await call('https://maps.google.com/maps?q=xyz');
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ src: null });
  });

  it('menolak redirect ke host menyamar google (mencegah DNS-rebinding sederhana)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ url: 'http://google.com.evil.com/steal' }));
    const res = await call('https://maps.google.com/maps?q=xyz');
    expect(res.status).toBe(400);
  });

  it('mengembalikan src null untuk URL kosong', async () => {
    const url = 'http://localhost:3000/api/maps';
    const res = await GET(new Request(url));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ src: null });
  });
});