import { readFileSync, writeFileSync, readdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(process.cwd(), 'templates');
const files = readdirSync(dir).filter((f) => f.endsWith('.json') && f !== 'index.json').sort();

/**
 * Bundel konsep KOHEREN: warna + font + ornamen + entrance + layout semua
 * serasi dengan satu konsep. Entrance (cover & per-section) disamakan konsep.
 * Palet bebas hak cipta (estetika), aset 3D/2D dari registry CC0/Public Domain.
 */
const CONCEPTS = [
  { key: 'romantic', label: 'Romantis Klasik', primary: '#BFA06A', secondary: '#D9A7A4', background: '#FBF7F1', text: '#4A4036', cover: 'floral', entrance: 'fade', ornament: 'gardenia-wreath', layout: 'center' },
  { key: 'vintage80s', label: 'Vintage 80s–90s', primary: '#C98A3E', secondary: '#5E8B7E', background: '#F3E9D2', text: '#3A2E22', cover: 'oldtv', entrance: 'oldtv', ornament: 'newspaper-rule', layout: 'center' },
  { key: 'newsprint', label: 'Koran Lama', primary: '#8A7A66', secondary: '#B7A98F', background: '#EFE7D6', text: '#2C2419', cover: 'newspaper', entrance: 'newspaper', ornament: 'newspaper-rule', layout: 'left' },
  { key: 'book', label: 'Buka Buku', primary: '#7C5C3B', secondary: '#C9A36A', background: '#FAF3E6', text: '#3B2F23', cover: 'book', entrance: 'book', ornament: 'flourish', layout: 'center' },
  { key: 'filmnoir', label: 'Roll Film', primary: '#B23A3A', secondary: '#3A3A3A', background: '#EDE7DD', text: '#2A2A2A', cover: 'filmroll', entrance: 'filmroll', ornament: 'vine-border', layout: 'center' },
  { key: 'jawa', label: 'Adat Jawa', primary: '#7B4B2A', secondary: '#C9A227', background: '#F6EFE2', text: '#3D2A1A', cover: 'floral', entrance: 'vintage', ornament: 'batik-parang', layout: 'center' },
  { key: 'bali', label: 'Adat Bali', primary: '#C0392B', secondary: '#2E7D57', background: '#FBF1E6', text: '#3B2A22', cover: 'floral', entrance: 'rise', ornament: 'wayang', layout: 'center' },
  { key: 'islam', label: 'Islam', primary: '#2E7D57', secondary: '#BFA06A', background: '#F4F1E8', text: '#2C3A30', cover: 'book', entrance: 'islamic', ornament: 'islamic-geometric', layout: 'center' },
  { key: 'kristen', label: 'Kristen', primary: '#3B5BA5', secondary: '#C9A227', background: '#F5F3EE', text: '#2A2E3A', cover: 'book', entrance: 'fade', ornament: 'church-window', layout: 'center' },
  { key: 'hindu', label: 'Hindu', primary: '#C0392B', secondary: '#D98C1F', background: '#FBF0E4', text: '#3A241A', cover: 'mandala', entrance: 'mandala', ornament: 'hindu-mandala', layout: 'center' },
  { key: 'buddha', label: 'Buddha', primary: '#D98C1F', secondary: '#7B4B2A', background: '#FCF3E2', text: '#3B2A1A', cover: 'floral', entrance: 'mandala', ornament: 'buddha-wheel', layout: 'center' },
  { key: 'konghucu', label: 'Konghucu', primary: '#B23A3A', secondary: '#C9A227', background: '#FAEFE4', text: '#3A241A', cover: 'lantern', entrance: 'lantern', ornament: 'lantern', layout: 'center' },
  { key: 'batak', label: 'Adat Batak', primary: '#5A3E2B', secondary: '#B23A3A', background: '#F2E9DC', text: '#33241A', cover: 'floral', entrance: 'ulos', ornament: 'batak-ulos', layout: 'center' },
  { key: 'sunda', label: 'Adat Sunda', primary: '#4E7A3A', secondary: '#C9A227', background: '#F4F1E2', text: '#2E3320', cover: 'floral', entrance: 'batik', ornament: 'sunda-kebat', layout: 'center' },
  { key: 'modern', label: 'Modern Minimal', primary: '#8A7A66', secondary: '#BFA06A', background: '#F7F4EF', text: '#3A352E', cover: 'floral', entrance: 'slide', ornament: 'arch-geometric', layout: 'left' },
];

let count = 0;
files.forEach((file, fi) => {
  const path = join(dir, file);
  const data = JSON.parse(readFileSync(path, 'utf8'));
  const c = CONCEPTS[fi % CONCEPTS.length];

  // Tema koheren: warna + font + ornamen + layout + cover = satu konsep
  data.theme.font_heading = 'Cormorant Garamond';
  data.theme.font_body = 'Jost';
  data.theme.primary = c.primary;
  data.theme.secondary = c.secondary;
  data.theme.background = c.background;
  data.theme.text = c.text;
  data.theme.ornament = c.ornament;
  data.theme.layout = c.layout;
  data.theme.cover_style = c.cover;
  data.theme.cover_3d = c.cover === 'floral' || c.cover === 'book';

  // Per-section entrance serasi konsep + stagger
  if (Array.isArray(data.blocks)) {
    data.blocks.forEach((b, bi) => {
      b.style = { ...(b.style || {}), entrance: c.entrance, entranceDelay: (bi % 4) * 120 };
    });
  }

  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
  count++;
  console.log(`${String(fi).padStart(2)} ${file.padEnd(26)} -> ${c.label}`);
});

console.log(`\nUpgraded ${count} templates across ${CONCEPTS.length} concepts.`);
