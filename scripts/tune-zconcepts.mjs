import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(process.cwd(), 'templates');

const CONTENT = {
  'z-concept-1.json': {
    religion: 'hindu',
    caption: 'Undangan Pernikahan',
    groom: 'Putu Aria Wisnu', bride: 'Desak Made Gayatri',
    date: 'Minggu, 20 Juni 2027', place: 'Puri Agung Ubud, Bali',
    intro: 'Om Swastiastu', bismillah: ''
  },
  'z-concept-2.json': {
    religion: 'buddha',
    caption: 'Undangan Pernikahan',
    groom: 'Kusuma Wijaya', bride: 'Liani Sugiarto',
    date: 'Sabtu, 14 Agustus 2027', place: 'Vihara Dharma Bhakti, Jakarta',
    intro: 'Namo Buddhaya', bismillah: ''
  },
  'z-concept-3.json': {
    religion: 'konghucu',
    caption: 'Undangan Pernikahan',
    groom: 'Lim Ho Swee', bride: 'Tan Mei Ling',
    date: 'Minggu, 5 September 2027', place: 'Klenteng Dharma Bhakti, Jakarta',
    intro: 'Dalam tali kasih yang tulus', bismillah: ''
  },
  'z-concept-4.json': {
    religion: 'kristen',
    caption: 'Undangan Pernikahan',
    groom: 'Togar Pangihutan', bride: 'Risma Boru Siahaan',
    date: 'Sabtu, 11 September 2027', place: 'Gor Tubuh Christi, Balige',
    intro: 'Tuhan telah mempersatukan', bismillah: ''
  },
  'z-concept-5.json': {
    religion: 'islam',
    caption: 'Undangan Pernikahan',
    groom: 'Ridwan Kusuma', bride: 'Siti Nurhaliza',
    date: 'Minggu, 3 Oktober 2027', place: 'Saung Angklung, Bandung',
    intro: "Assalamu'alaikum Warahmatullahi Wabarakatuh", bismillah: 'Bismillahirrahmanirrahim'
  },
  'z-concept-6.json': {
    religion: 'islam',
    caption: 'With Love',
    groom: 'Arga Pratama', bride: 'Nadya Permata',
    date: 'Sabtu, 20 November 2027', place: 'The Westin, Jakarta',
    intro: 'Merayakan cinta dalam ikatan suci', bismillah: 'Bismillahirrahmanirrahim'
  }
};

for (const [file, c] of Object.entries(CONTENT)) {
  const path = join(dir, file);
  const data = JSON.parse(readFileSync(path, 'utf8'));
  data.settings.religion = c.religion;
  for (const b of data.blocks) {
    if (b.type === 'Hero') {
      b.props.groom = c.groom; b.props.bride = c.bride;
      b.props.date = c.date; b.props.place = c.place;
      b.props.caption = c.caption;
    }
    if (b.type === 'Couple') {
      b.props.groom = c.groom; b.props.bride = c.bride;
      b.props.introduction = c.intro;
      if (c.bismillah) b.props.bismillah = c.bismillah; else delete b.props.bismillah;
    }
    if (b.type === 'EventDetail') {
      if (b.props.ceremony_place) b.props.ceremony_place = c.place;
      if (b.props.reception_place) b.props.reception_place = c.place;
    }
  }
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
  console.log(`${file} -> ${c.religion} | ${c.groom} & ${c.bride}`);
}
console.log('Tuned 6 concept templates.');
