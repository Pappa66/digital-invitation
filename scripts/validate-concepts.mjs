import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(process.cwd(), 'templates');
const files = readdirSync(dir).filter((f) => f.endsWith('.json') && f !== 'index.json').sort();

const COVER = new Set(['floral', 'book', 'filmroll', 'oldtv', 'newspaper', 'mandala', 'lantern']);
const LAYOUT = new Set(['center', 'left', 'right']);
const ENTRANCE = new Set([
  'fade', 'slide', 'zoom', 'blur', 'rise', 'flip3d', 'parallax', 'stagger', 'float',
  'book', 'magazine', 'filmroll', 'oldtv', 'newspaper', 'vintage',
  'mandala', 'islamic', 'ulos', 'lantern', 'wayang', 'batik', 'none'
]);
const ORNAMENT = new Set([
  'flourish', 'corner-flourish', 'laurel', 'eucalyptus', 'wildflower', 'rose-branch', 'heart-swirl',
  'arch-geometric', 'diamond-lines', 'lotus', 'paisley', 'celestial', 'flourish-double', 'birds',
  'cherry-blossom', 'olive-branch', 'art-deco', 'mandala', 'tropical-leaf', 'infinity-love',
  'scroll-divider', 'botanical-garland', 'geometric-hex', 'vine-border', 'jasmine-garland',
  'corner-jasmine', 'corner-rose', 'corner-peony', 'orchid-spray', 'lily-divider', 'peony-bouquet',
  'frangipani', 'monstera-garland', 'sunflower', 'baby-breath', 'gardenia-wreath', 'rose-head',
  'jasmine-head', 'orchid-head', 'peony-head', 'lily-head', 'tulip-head', 'daisy-head', 'hydrangea-head',
  'newspaper-rule', 'batik-parang', 'wayang', 'om-symbol', 'cross', 'lantern', 'naga', 'stupa',
  'islamic-geometric', 'masjid-dome', 'church-window', 'hindu-mandala', 'buddha-wheel',
  'jawa-gunungan', 'batak-ulos', 'sunda-kebat', 'minang-gadang', 'papua-asmat'
]);

let errors = 0;
const problems = [];
let cov = {}, orn = {}, ent = {}, lay = {};

for (const f of files) {
  const d = JSON.parse(readFileSync(join(dir, f), 'utf8'));
  const t = d.theme || {};
  if (!COVER.has(t.cover_style)) { errors++; problems.push(`${f}: cover_style invalid -> ${t.cover_style}`); }
  if (!LAYOUT.has(t.layout)) { errors++; problems.push(`${f}: layout invalid -> ${t.layout}`); }
  if (!ORNAMENT.has(t.ornament)) { errors++; problems.push(`${f}: ornament invalid -> ${t.ornament}`); }
  (d.blocks || []).forEach((b, i) => {
    const e = b.style?.entrance;
    if (e && !ENTRANCE.has(e)) { errors++; problems.push(`${f}: block[${i}] entrance invalid -> ${e}`); }
  });
  cov[t.cover_style] = (cov[t.cover_style] || 0) + 1;
  orn[t.ornament] = (orn[t.ornament] || 0) + 1;
  ent[d.blocks?.[0]?.style?.entrance] = (ent[d.blocks?.[0]?.style?.entrance] || 0) + 1;
  lay[t.layout] = (lay[t.layout] || 0) + 1;
}

console.log(`Templates: ${files.length} | errors: ${errors}`);
console.log('cover_style distribution:', cov);
console.log('layout distribution:', lay);
console.log('distinct ornaments used:', Object.keys(orn).length, orn);
if (problems.length) { console.log('\nPROBLEMS:'); problems.forEach((p) => console.log(' -', p)); }
else console.log('\nALL CONCEPTS CONSISTENT ✅');
