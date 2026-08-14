import { beforeEach, describe, expect, it } from 'vitest';
import { useBuilderStore } from '@/store/builder-store';

beforeEach(() => {
  useBuilderStore.getState().reset();
});

describe('builder-store', () => {
  it('adds a new block with a unique id and selects it', () => {
    const store = useBuilderStore.getState();
    store.addBlock('Hero');
    const blocks = useBuilderStore.getState().canvas.blocks;
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe('Hero');
    expect(blocks[0].id).toMatch(/^b-/);
    expect(useBuilderStore.getState().selectedBlockId).toBe(blocks[0].id);
  });

  it('adds a block at a specific index', () => {
    const store = useBuilderStore.getState();
    store.addBlock('Hero');
    store.addBlock('Countdown');
    store.addBlock('Maps', 1);
    const types = useBuilderStore.getState().canvas.blocks.map((b) => b.type);
    expect(types).toEqual(['Hero', 'Maps', 'Countdown']);
  });

  it('removes a block and clears selection', () => {
    const store = useBuilderStore.getState();
    store.addBlock('Hero');
    const id = useBuilderStore.getState().canvas.blocks[0].id;
    store.removeBlock(id);
    expect(useBuilderStore.getState().canvas.blocks).toHaveLength(0);
    expect(useBuilderStore.getState().selectedBlockId).toBeNull();
  });

  it('duplicates a block right after the original', () => {
    const store = useBuilderStore.getState();
    store.addBlock('Hero');
    store.addBlock('Countdown');
    const heroId = useBuilderStore.getState().canvas.blocks[0].id;
    store.duplicateBlock(heroId);
    const blocks = useBuilderStore.getState().canvas.blocks;
    expect(blocks).toHaveLength(3);
    expect(blocks[1].type).toBe('Hero');
    expect(blocks[1].id).not.toBe(heroId);
    expect(useBuilderStore.getState().selectedBlockId).toBe(blocks[1].id);
  });

  it('updates block props immutably', () => {
    const store = useBuilderStore.getState();
    store.addBlock('Hero');
    const id = useBuilderStore.getState().canvas.blocks[0].id;
    store.setBlockProps(id, { bride: 'Kalya' });
    store.setBlockProps(id, { groom: 'Raka' });
    const block = useBuilderStore.getState().canvas.blocks[0];
    expect(block.props.bride).toBe('Kalya');
    expect(block.props.groom).toBe('Raka');
  });

  it('reorders blocks on reorderBlock', () => {
    let idHero = '';
    let idRsvp = '';
    const store = useBuilderStore.getState();
    store.addBlock('Hero');
    idHero = useBuilderStore.getState().canvas.blocks[0].id;
    store.addBlock('RSVP');
    idRsvp = useBuilderStore.getState().canvas.blocks[1].id;
    store.reorderBlock(idRsvp, idHero);
    const types = useBuilderStore.getState().canvas.blocks.map((b) => b.type);
    expect(types).toEqual(['RSVP', 'Hero']);
  });

  it('updates theme partials', () => {
    const store = useBuilderStore.getState();
    store.setTheme({ primary: '#FF0000' });
    expect(useBuilderStore.getState().canvas.theme.primary).toBe('#FF0000');
    expect(useBuilderStore.getState().canvas.theme.background).toBe('#FAF6EF');
  });

  it('init() only applies once to avoid clobbering autosave state', () => {
    const store = useBuilderStore.getState();
    store.init({
      theme: { ...store.canvas.theme },
      settings: { music_url: '', guest_book_enabled: false },
      blocks: [{ id: 'x', type: 'Hero', props: { bride: 'A' } }]
    });
    store.init({
      theme: { ...store.canvas.theme },
      settings: { music_url: '', guest_book_enabled: false },
      blocks: [{ id: 'y', type: 'Hero', props: { bride: 'B' } }]
    });
    const blocks = useBuilderStore.getState().canvas.blocks;
    expect(blocks).toHaveLength(1);
    expect(blocks[0].id).toBe('x');
  });

  it('init() reloads when switching to a different project (memuat ulang kanvas)', () => {
    const store = useBuilderStore.getState();
    store.init(
      {
        theme: { ...store.canvas.theme },
        settings: { music_url: '', guest_book_enabled: false },
        blocks: [{ id: 'a', type: 'Hero', props: { bride: 'A' } }]
      },
      'proj-a'
    );
    store.init(
      {
        theme: { ...store.canvas.theme },
        settings: { music_url: '', guest_book_enabled: false },
        blocks: [{ id: 'b', type: 'Hero', props: { bride: 'B' } }]
      },
      'proj-b'
    );
    const blocks = useBuilderStore.getState().canvas.blocks;
    expect(blocks).toHaveLength(1);
    expect(blocks[0].id).toBe('b');
  });
});