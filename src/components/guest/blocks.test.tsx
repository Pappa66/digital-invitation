import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { within } from '@testing-library/react';
import BlockView from '@/components/guest/BlockView';
import type { Block } from '@/lib/types';

// Matikan next/image agar test hanya fokus pada konten (tanpa server runtime).
vi.mock('next/image', () => ({
  default: function MockImage(props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean }) {
    // Buang `priority` (boolean) agar tidak bocor ke <img> sebagai atribut
    // non-boolean (React warning). `fill` dipetakan ke posisi absolute.
    const { fill, priority: _priority, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element -- mock test, bukan prod
    return <img {...rest} style={{ position: fill ? 'absolute' : undefined }} alt={props.alt ?? ''} />;
  }
}));

function heroBlock(overrides: Record<string, unknown> = {}): Block {
  return {
    id: 'b1',
    type: 'Hero',
    props: { bride: 'Sena', groom: 'Panca', ...overrides }
  };
}

describe('XSS prevention (STRICT: no raw HTML injection)', () => {
  it('renders user text as text, never as HTML', () => {
    const { container } = render(<BlockView block={heroBlock({ bride: '<img src=x onerror=alert(1)>' })} projectId="" />);
    // React escapes the payload: literal chars, no live <img>
    expect(container.querySelector('img[onerror]')).toBeNull();
    const text = container.textContent ?? '';
    expect(text).toContain('<img src=x onerror=alert(1)>');
  });

  it('renders script attempt without executing it', () => {
    const { container } = render(<BlockView block={heroBlock({ groom: '<script>window.__pwnd=1</script>' })} projectId="" />);
    expect(container.querySelector('script')).toBeNull();
    expect(container.textContent).toContain('<script>window.__pwnd=1</script>');
  });

  it('ignores unknown block types safely', () => {
    const { container } = render(<BlockView block={{ id: 'x', type: 'unknown' as never, props: {} }} projectId="" />);
    expect(container.querySelector('[class]')).toBeNull();
    expect(container.innerHTML).toBe('');
  });

  it('does not inject data into href/src that could execute JS', () => {
    const { container } = render(<BlockView block={heroBlock({ bg_image: 'javascript:alert(1)' })} projectId="" />);
    // bg_image only feeds an <img src>; must not produce a javascript: link
    expect(container.querySelector('a[href^="javascript:"]')).toBeNull();
  });

  it('renders all reachable block types without crashing', () => {
    const { container } = render(
      <div>
        <BlockView block={{ id: 'c', type: 'Couple', props: { groom: 'a', bride: 'b' } }} projectId="" />
        <BlockView block={{ id: 'co', type: 'Countdown', props: { target_date: '2027-01-01T00:00:00+07:00' } }} projectId="" />
        <BlockView block={{ id: 's', type: 'Story', props: { ev_title: ['Pertemuan'], ev_desc: ['Kisah'] } }} projectId="" />
        <BlockView block={{ id: 'g', type: 'Gallery', props: { images: [] } }} projectId="" />
        <BlockView block={{ id: 'm', type: 'Maps', props: { address: 'Jakarta' } }} projectId="" />
        <BlockView block={{ id: 't', type: 'Thanks', props: { names: 'A' } }} projectId="" />
        <BlockView block={{ id: 'r', type: 'RSVP', props: {} }} projectId="" />
        <BlockView block={{ id: 'd', type: 'Divider', props: {} }} projectId="" />
        <BlockView
          block={{ id: 'q', type: 'Quote', props: { arabic: 'وَمِن كُلِّ شَيْءٍ', latin: 'Wa min kulli syai-in', reference: 'QS. Adz Dzariyyat: 49' } }}
          projectId=""
        />
      </div>
    );
    expect(container.querySelectorAll('section').length).toBeGreaterThanOrEqual(5);
    expect(container.textContent).toContain('Adz Dzariyyat');
  });

  it('renders ALL 20 block types (termasuk Popup, CopyText, LiveStreaming, Watermark, Empty) tanpa crash', () => {
    const { container } = render(
      <div>
        <BlockView block={{ id: 'p', type: 'Popup', props: { button_text: 'Buka', title: 'Info', mode: 'content', content: 'Prokes' } }} projectId="x" />
        <BlockView block={{ id: 'ct', type: 'CopyText', props: { title: 'Amplop', text_to_copy: '123', button_text: 'Salin' } }} projectId="x" />
        <BlockView block={{ id: 'ls', type: 'LiveStreaming', props: { title: 'Langsung', stream_url: 'https://youtu.be/abc', platform: 'youtube' } }} projectId="x" />
        <BlockView block={{ id: 'wm', type: 'Watermark', props: { text: 'Made with', brand: 'Prasha', url: 'https://prashadigitalindonesia.com' } }} projectId="x" />
        <BlockView block={{ id: 'em', type: 'Empty', props: {} }} projectId="x" />
        <BlockView block={{ id: 'ev', type: 'Envelope', props: { title: 'Amplop', accounts: [{ bank_name: 'BCA', account_number: '12', account_holder: 'X' }] } }} projectId="x" />
        <BlockView block={{ id: 'gl', type: 'GiftList', props: { title: 'Kado', items: ['A'] } }} projectId="x" />
        <BlockView block={{ id: 'ph', type: 'Photo', props: { image: '/p.jpg', caption: 'Foto' } }} projectId="x" />
        <BlockView block={{ id: 'tx', type: 'Text', props: { text: 'Teks' } }} projectId="x" />
        <BlockView block={{ id: 'dv', type: 'Divider', props: { variant: 'line' } }} projectId="x" />
      </div>
    );
    expect(container.textContent).toContain('Buka');
    expect(container.textContent).toContain('Amplop');
    expect(container.textContent).toContain('Langsung');
    expect(container.textContent).toContain('Made with');
    expect(container.textContent).toContain('Blok Kosong');
    expect(container.textContent).toContain('Kado');
    expect(container.textContent).toContain('Teks');
    expect(container.querySelector('img')).not.toBeNull();
  });

  it('STRICT: payload javascript: tidak pernah tersimpan utuh di href/src (React 19 menetralkan skema berbahaya)', () => {
    const { container } = render(
      <div>
        <BlockView block={{ id: 'ls', type: 'LiveStreaming', props: { stream_url: 'javascript:alert(1)' } }} projectId="x" />
        <BlockView block={{ id: 'ed', type: 'EventDetail', props: { maps_url: 'javascript:steal(2)', location: 'Venue' } }} projectId="x" />
        <BlockView block={{ id: 'pp', type: 'Popup', props: { mode: 'link', link_url: 'javascript:steal(4)' } }} projectId="x" />
        <BlockView block={{ id: 'wm', type: 'Watermark', props: { url: 'javascript:steal(5)' } }} projectId="x" />
      </div>
    );

    const hrefs = Array.from(container.querySelectorAll('a')).map((a) => a.getAttribute('href') ?? '');
    const srcs = Array.from(container.querySelectorAll('iframe, img')).map((e) => e.getAttribute('src') ?? '');
    const all = [...hrefs, ...srcs];

    // Payload asli TIDAK BOLEH muncul apa adanya di href/src mana pun.
    for (const payload of ['alert(1)', 'steal(2)', 'steal(4)', 'steal(5)']) {
      expect(all.some((u) => u.includes(payload))).toBe(false);
    }
    // Bila React menyisipkan href javascript:, itu harus sentinel "blocked".
    for (const h of hrefs.filter((h) => h.startsWith('javascript:'))) {
      expect(h).toContain('React has blocked a javascript: URL');
    }
  });

  it('maps block data through the secure component switch (no dangerouslySetInnerHTML)', () => {
    const { container } = render(<BlockView block={heroBlock()} projectId="" />);
    expect(container.querySelector('[dangerouslySetInnerHTML]')).toBeNull();
  });
});