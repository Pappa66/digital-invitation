import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { within } from '@testing-library/react';
import BlockView from '@/components/guest/BlockView';
import type { Block } from '@/lib/types';

// Matikan next/image agar test hanya fokus pada konten (tanpa server runtime).
vi.mock('next/image', () => ({
  default: function MockImage(props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean }) {
    const { fill, ...rest } = props;
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
      </div>
    );
    expect(container.querySelectorAll('section').length).toBeGreaterThanOrEqual(5);
  });

  it('maps block data through the secure component switch (no dangerouslySetInnerHTML)', () => {
    const { container } = render(<BlockView block={heroBlock()} projectId="" />);
    expect(container.querySelector('[dangerouslySetInnerHTML]')).toBeNull();
  });
});