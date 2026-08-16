/**
 * Konfigurasi agama untuk undangan & ucapan.
 * - `invitation`: wording religius default yang dipakai di blok undangan
 *   (diterapkan saat pengguna mengganti agama di editor; teks kustom tetap dipertahankan).
 * - `messages`: preset template ucapan siap pakai. Placeholder: {nama} dan {link}.
 */
export type ReligionKey = 'islam' | 'christian' | 'katholik' | 'hindu' | 'buddha' | 'konghucu';

export interface MessagePreset {
  id: string;
  label: string;
  text: string;
}

export interface ReligionConfig {
  key: ReligionKey;
  label: string;
  invitation: {
    introduction: string;
    bismillah: string;
    closing: string;
  };
  messages: MessagePreset[];
}

export const RELIGIONS: ReligionConfig[] = [
  {
    key: 'islam',
    label: 'Islam',
    invitation: {
      introduction: "Assalamu'alaikum Warahmatullahi Wabarakatuh",
      bismillah: 'Bismillahirrahmanirrahim',
      closing: "Wassalamu'alaikum Warahmatullahi Wabarakatuh"
    },
    messages: [
      {
        id: 'islam-formal',
        label: 'Formal',
        text: `Kepada Yth. Bapak/Ibu {nama},

Assalamu'alaikum Warahmatullahi Wabarakatuh.

Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada acara pernikahan kami. Untuk melihat undangan lengkap, silakan klik link berikut:

{link}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.`
      },
      {
        id: 'islam-santai',
        label: 'Santai',
        text: `Assalamu'alaikum {nama}!

Bentar lagi kami menikah nih. Ini undangan kami:
{link}

Doa restunya sangat kami harapkan ya. Terima kasih!`
      },
      {
        id: 'islam-singkat',
        label: 'Singkat',
        text: `Assalamu'alaikum {nama}, ini undangan pernikahan kami: {link}. Mohon doa restunya ya.`
      }
    ]
  },
  {
    key: 'christian',
    label: 'Kristen',
    invitation: {
      introduction: 'Dengan hormat,',
      bismillah: '',
      closing: 'Tuhan Yesus memberkati.'
    },
    messages: [
      {
        id: 'christian-formal',
        label: 'Formal',
        text: `Kepada Yth. Bapak/Ibu {nama},

Dengan hormat,
Puji syukur kepada Tuhan Yesus Kristus atas berkat dan kasih karunia-Nya, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada acara pemberkatan pernikahan kami.

Untuk melihat undangan lengkap, silakan klik link berikut:

{link}

Kehadiran dan doa Bapak/Ibu/Saudara/i merupakan kebahagiaan bagi kami.

Tuhan Yesus memberkati.`
      },
      {
        id: 'christian-santai',
        label: 'Santai',
        text: `Halo {nama}!

Kami segera menikah nih. Ini undangan kami:
{link}

Semoga bisa hadir ya. Tuhan Yesus memberkati!`
      },
      {
        id: 'christian-singkat',
        label: 'Singkat',
        text: `Halo {nama}, ini undangan pernikahan kami: {link}. Mohon doa restunya ya. Tuhan Yesus memberkati.`
      }
    ]
  },
  {
    key: 'katholik',
    label: 'Katolik',
    invitation: {
      introduction: 'Dengan hormat,',
      bismillah: '',
      closing: 'Tuhan memberkati.'
    },
    messages: [
      {
        id: 'katholik-formal',
        label: 'Formal',
        text: `Kepada Yth. Bapak/Ibu {nama},

Dengan hormat,
Atas berkat dan rahmat Tuhan Yang Maha Kuasa, kami akan menyelenggarakan perayaan pernikahan kami. Kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada acara tersebut.

Untuk melihat undangan lengkap, silakan klik link berikut:

{link}

Merupakan suatu kehormatan apabila Bapak/Ibu/Saudara/i berkenan hadir.

Tuhan memberkati.`
      },
      {
        id: 'katholik-santai',
        label: 'Santai',
        text: `Halo {nama}!

Kami segera menikah nih. Ini undangan kami:
{link}

Semoga bisa hadir ya. Tuhan memberkati!`
      },
      {
        id: 'katholik-singkat',
        label: 'Singkat',
        text: `Halo {nama}, ini undangan pernikahan kami: {link}. Mohon doa restunya ya.`
      }
    ]
  },
  {
    key: 'hindu',
    label: 'Hindu',
    invitation: {
      introduction: 'Om Swastyastu,',
      bismillah: '',
      closing: 'Om Shanti Shanti Shanti Om'
    },
    messages: [
      {
        id: 'hindu-formal',
        label: 'Formal',
        text: `Kepada Yth. Bapak/Ibu {nama},

Om Swastyastu.

Atas asung kerta wara nugraha Ida Sang Hyang Widhi Wasa, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada upacara pernikahan kami. Untuk melihat undangan lengkap, silakan klik link berikut:

{link}

Merupakan suatu kehormatan apabila Bapak/Ibu/Saudara/i berkenan hadir.

Om Shanti Shanti Shanti Om.`
      },
      {
        id: 'hindu-santai',
        label: 'Santai',
        text: `Om Swastyastu {nama}!

Kami segera melangsungkan pernikahan nih. Ini undangan kami:
{link}

Doa restunya sangat kami harapkan ya.`
      },
      {
        id: 'hindu-singkat',
        label: 'Singkat',
        text: `Om Swastyastu {nama}, ini undangan pernikahan kami: {link}. Mohon doa restunya ya.`
      }
    ]
  },
  {
    key: 'buddha',
    label: 'Buddha',
    invitation: {
      introduction: 'Namo Buddhaya,',
      bismillah: '',
      closing: 'Semoga semua makhluk berbahagia.'
    },
    messages: [
      {
        id: 'buddha-formal',
        label: 'Formal',
        text: `Kepada Yth. Bapak/Ibu {nama},

Namo Buddhaya.

Dengan penuh suka cita, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada acara pernikahan kami. Untuk melihat undangan lengkap, silakan klik link berikut:

{link}

Semoga kebahagiaan dan berkah menyertai kita semua.`
      },
      {
        id: 'buddha-santai',
        label: 'Santai',
        text: `Namo Buddhaya {nama}!

Kami segera menikah nih. Ini undangan kami:
{link}

Semoga bisa hadir ya.`
      },
      {
        id: 'buddha-singkat',
        label: 'Singkat',
        text: `Namo Buddhaya {nama}, ini undangan pernikahan kami: {link}. Mohon doa restunya ya.`
      }
    ]
  },
  {
    key: 'konghucu',
    label: 'Konghucu',
    invitation: {
      introduction: 'Salam Sejahtera,',
      bismillah: '',
      closing: 'Salam Sejahtera'
    },
    messages: [
      {
        id: 'konghucu-formal',
        label: 'Formal',
        text: `Kepada Yth. Bapak/Ibu {nama},

Salam Sejahtera.

Dengan memanjatkan syukur ke hadirat Tian (Tuhan Yang Maha Kuasa), kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada acara pernikahan kami. Untuk melihat undangan lengkap, silakan klik link berikut:

{link}

Semoga berkat Tian senantiasa menyertai kita semua.`
      },
      {
        id: 'konghucu-santai',
        label: 'Santai',
        text: `Salam sejahtera {nama}!

Kami segera menikah nih. Ini undangan kami:
{link}

Semoga bisa hadir ya.`
      },
      {
        id: 'konghucu-singkat',
        label: 'Singkat',
        text: `Salam sejahtera {nama}, ini undangan pernikahan kami: {link}. Mohon doa restunya ya.`
      }
    ]
  }
];

export function getReligion(key?: string): ReligionConfig {
  const found = RELIGIONS.find((r) => r.key === key);
  return found ?? RELIGIONS[0];
}

/** Kumpulan semua nilai default religion-sensitive yang dikenal di blok undangan. */
const KNOWN_BY_PROP: Record<string, Set<string>> = (() => {
  const map: Record<string, Set<string>> = { bismillah: new Set(), closing: new Set(), introduction: new Set() };
  for (const r of RELIGIONS) {
    for (const prop of Object.keys(map) as (keyof ReligionConfig['invitation'])[]) {
      const v = r.invitation[prop].trim();
      if (v) map[prop].add(v);
    }
  }
  return map;
})();

/** True bila nilai masih merupakan wording default (sehingga aman dirombak). */
export function isKnownDefault(prop: 'bismillah' | 'closing' | 'introduction', value: string): boolean {
  return KNOWN_BY_PROP[prop].has(value.trim());
}

export interface GuestRow {
  name: string;
  phone: string;
  email: string;
}

/** Normalisasi nomor HP Indonesia → format internasional (628xxx). */
export function normalizePhone(raw: string): string {
  let d = raw.replace(/[^0-9+]/g, '');
  d = d.replace(/^\+/, '');
  if (d.startsWith('0')) d = '62' + d.slice(1);
  return /^628\d{7,12}$/.test(d) ? d : '';
}

/** Link WhatsApp dengan pesan prefilled. Tanpa nomor valid → buka dialog pilih kontak. */
export function waLink(phone: string, message: string): string {
  const p = normalizePhone(phone);
  const url = p ? `https://wa.me/${p}` : 'https://wa.me/';
  return `${url}?text=${encodeURIComponent(message)}`;
}

/** Parse daftar tamu: satu per baris. Mendukung "Nama", "Nama | 08xx", "Nama, 08xx", "08xx, Nama". */
export function parseGuestLines(text: string): GuestRow[] {
  const rows: GuestRow[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const parts = line.split(/[|,;\t]/).map((s) => s.trim()).filter(Boolean);
    let name = line;
    let phone = '';
    let email = '';
    const emailIdx = parts.findIndex((p) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p));
    if (emailIdx >= 0) {
      email = parts[emailIdx];
      parts.splice(emailIdx, 1);
    }
    if (parts.length >= 1) {
      const phoneIdx = parts.findIndex((p) => /^(\+?62|0)8\d{7,12}$/.test(p.replace(/[\s.-]/g, '')));
      if (phoneIdx >= 0) {
        phone = parts[phoneIdx];
        name = parts.filter((_, i) => i !== phoneIdx).join(' ');
      } else {
        name = parts[0];
        phone = parts.slice(1).join(' ');
      }
    }
    if (!name) continue;
    rows.push({ name, phone, email });
  }
  return rows;
}
