import type { ReligionKey } from '@/lib/religions';

/**
 * Perpustakaan kutipan/kata-kata pernikahan berdasarkan 6 agama yang diakui
 * di Indonesia (islam, kristen, katholik, hindu, buddha, konghucu).
 * Berisi ayat/kutipan yang umum dipakai dalam undangan pernikahan.
 *
 * Setiap kutipan punya:
 * - `original`: teks kitab/doa asli (bahasa asli; untuk islam = Arab RTL).
 * - `translation`: terjemahan bahasa Indonesia.
 * - `reference`: sumber (mis. QS Ar-Rum:21, Kejadian 2:24, dll).
 * - `latin` (opsional): transliterasi untuk islam.
 */

export interface WeddingQuote {
  id: string;
  religion: ReligionKey;
  original: string;
  latin?: string;
  translation: string;
  reference: string;
}

export const RELIGION_LABELS: Record<ReligionKey, string> = {
  islam: 'Islam',
  christian: 'Kristen (Protestan)',
  katholik: 'Katolik',
  hindu: 'Hindu',
  buddha: 'Buddha',
  konghucu: 'Konghucu'
};

export const WEDDING_QUOTES: WeddingQuote[] = [
  /* ============================== ISLAM ============================== */
  {
    id: 'islam-arrum-21',
    religion: 'islam',
    original: 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً',
    latin: 'Wa min āyātihi an khalaqa lakum min anfusikum azwājan litaskunū ilaihā wa ja\'ala bainakum mawaddatan wa raḥmah',
    translation:
      'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu istri-istri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang.',
    reference: 'QS Ar-Rum: 21'
  },
  {
    id: 'islam-rum-21b',
    religion: 'islam',
    original: 'وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً',
    latin: 'Wa ja\'ala bainakum mawaddatan wa rahmah',
    translation: 'Dan dijadikan-Nya di antara kalian rasa cinta dan kasih sayang.',
    reference: 'QS Ar-Rum: 21 (penggalan)'
  },
  {
    id: 'islam-adzdzariyat-49',
    religion: 'islam',
    original:
      'وَمِن كُلِّ شَيْءٍ خَلَقْنَا زَوْجَيْنِ لَعَلَّكُمْ تَذَكَّرُونَ',
    latin: 'Wa min kulli syai\'in khalaqnā zaujaini la\'allakum tadzakkarūn',
    translation: 'Dan segala sesuatu Kami ciptakan berpasang-pasangan supaya kamu mengingat kebesaran Allah.',
    reference: 'QS Adz-Dzariyat: 49'
  },
  {
    id: 'islam-alikhlas-4',
    religion: 'islam',
    original: 'وَمِن كُلِّ شَيْءٍ خَلَقْنَا زَوْجَيْنِ',
    latin: 'Wa min kulli syai\'in khalaqnā zaujain',
    translation: 'Segala sesuatu Kami ciptakan berpasang-pasangan.',
    reference: 'QS Adz-Dzariyat: 49 (penggalan)'
  },
  {
    id: 'islam-annisa-1',
    religion: 'islam',
    original: 'يَا أَيُّهَا النَّاسُ اتَّقُوا رَبَّكُمُ الَّذِي خَلَقَكُم مِّن نَّفْسٍ وَاحِدَةٍ وَخَلَقَ مِنْهَا زَوْجَهَا',
    latin: 'Yā ayyuhan nāsu attaqū rabbakumullazī khalaqakum min nafsin wāhidah wa khalaqa minhā zaujahā',
    translation:
      'Wahai manusia! Bertakwalah kepada Tuhanmu yang telah menciptakan kamu dari diri yang satu, dan dari padanya Dia menciptakan pasangannya.',
    reference: 'QS An-Nisa: 1'
  },

  /* =============================== KRISTEN =============================== */
  {
    id: 'christian-kejadian-2-24',
    religion: 'christian',
    original: 'Sebab itu seorang laki-laki akan meninggalkan ayahnya dan ibunya dan bersatu dengan isterinya, sehingga keduanya menjadi satu daging.',
    translation:
      'Sebab itu seorang laki-laki akan meninggalkan ayahnya dan ibunya dan bersatu dengan isterinya, sehingga keduanya menjadi satu daging.',
    reference: 'Kejadian 2:24 (Kristen)'
  },
  {
    id: 'christian-1kor-13-4',
    religion: 'christian',
    original:
      'Kasih itu sabar; kasih itu murah hati; ia tidak cemburu. Ia tidak memegahkan diri dan tidak sombong.',
    translation: 'Kasih itu sabar; kasih itu murah hati; ia tidak cemburu. Ia tidak memegahkan diri dan tidak sombong.',
    reference: '1 Korintus 13:4'
  },
  {
    id: 'christian-kidung8-7',
    religion: 'christian',
    original: 'Air yang banyak tidak dapat memadamkan cinta, dan sungai-sungai tidak dapat menenggelamkannya.',
    translation: 'Air yang banyak tidak dapat memadamkan cinta, dan sungai-sungai tidak dapat menenggelamkannya.',
    reference: 'Kidung Agung 8:7'
  },
  {
    id: 'christian-pkh3-12',
    religion: 'christian',
    original:
      'Jadi, sebagai orang-orang pilihan Allah yang dikuduskan dan dikasihi-Nya, kenakanlah belas kasihan, kemurahan, kerendahan hati, kelemahlembutan dan kesabaran.',
    translation:
      'Jadi, sebagai orang-orang pilihan Allah yang dikuduskan dan dikasihi-Nya, kenakanlah belas kasihan, kemurahan, kerendahan hati, kelemahlembutan dan kesabaran.',
    reference: 'Kolose 3:12'
  },
  {
    id: 'christian-mazmur-133-1',
    religion: 'christian',
    original: 'Sungguh, alangkah baiknya dan indahnya, apabila saudara-saudara diam bersama dengan rukun!',
    translation: 'Sungguh, alangkah baiknya dan indahnya, apabila saudara-saudara diam bersama dengan rukun!',
    reference: 'Mazmur 133:1'
  },

  /* =============================== KATOLIK =============================== */
  {
    id: 'katholik-kejadian-2-24',
    religion: 'katholik',
    original: 'Sebab itu seorang laki-laki akan meninggalkan ayahnya dan ibunya dan bersatu dengan isterinya.',
    translation: 'Sebab itu seorang laki-laki akan meninggalkan ayahnya dan ibunya dan bersatu dengan isterinya, sehingga keduanya menjadi satu daging.',
    reference: 'Kejadian 2:24 (Katolik)'
  },
  {
    id: 'katholik-1kor-13-13',
    religion: 'katholik',
    original:
      'Demikianlah tinggal ketiga hal ini, yaitu iman, pengharapan dan kasih, dan yang paling besar di antaranya ialah kasih.',
    translation: 'Demikianlah tinggal ketiga hal ini, yaitu iman, pengharapan dan kasih, dan yang paling besar di antaranya ialah kasih.',
    reference: '1 Korintus 13:13'
  },
  {
    id: 'katholik-mt-19-6',
    religion: 'katholik',
    original: 'Demikianlah mereka bukan lagi dua, melainkan satu. Karena itu, apa yang telah dipersatukan Allah, tidak boleh diceraikan manusia.',
    translation: 'Demikianlah mereka bukan lagi dua, melainkan satu. Karena itu, apa yang telah dipersatukan Allah, tidak boleh diceraikan manusia.',
    reference: 'Matius 19:6'
  },
  {
    id: 'katholik-yohanes-15-12',
    religion: 'katholik',
    original: 'Inilah perintah-Ku, yaitu supaya kamu saling mengasihi, sama seperti Aku telah mengasihi kamu.',
    translation: 'Inilah perintah-Ku, yaitu supaya kamu saling mengasihi, sama seperti Aku telah mengasihi kamu.',
    reference: 'Yohanes 15:12'
  },
  {
    id: 'katholik-1yohanes-4-16',
    religion: 'katholik',
    original: 'Allah adalah kasih, dan barangsiapa tetap berada di dalam kasih, ia tetap berada di dalam Allah dan Allah di dalam dia.',
    translation: 'Allah adalah kasih, dan barangsiapa tetap berada di dalam kasih, ia tetap berada di dalam Allah dan Allah di dalam dia.',
    reference: '1 Yohanes 4:16'
  },

  /* =============================== HINDU =============================== */
  {
    id: 'hindu-mantra-om',
    religion: 'hindu',
    original: 'Om Saha Nau-Avatu | Saha Nau Bhunaktu | Saha Viiryyam Karavaavahai |',
    translation:
      'Om, semoga kita bersama-sama dilindungi, bersama-sama diberkahi, bersama-sama memperoleh kekuatan, dan semoga pengetahuan yang kita peroleh menjadi bercahaya.',
    reference: 'Mantra Pernikahan Hindu'
  },
  {
    id: 'hindu-suamiistri',
    religion: 'hindu',
    original: 'Om Tena Saha Samvasyam, Manasa Saha Vaacha, Saha Nah Prajaayah',
    translation: 'Semoga kita hidup bersama dalam satu jiwa, satu pikiran dan satu perkataan.',
    reference: 'Doa Pemersatu Dua Jiwa'
  },
  {
    id: 'hindu-atharvaveda',
    religion: 'hindu',
    original: 'Yatha Prahasta Purusesyah Kumbhikayah, Eva Stryah',
    translation: 'Seperti air tercurah ke dalam satu wadah, demikianlah dua insan melebur dalam satu keluarga.',
    reference: 'Atharvaveda'
  },
  {
    id: 'hindu-sepasang',
    religion: 'hindu',
    original: 'Dengan ini engkau dan aku menjadi satu dalam cinta dan bakti, seiring melangkah menempuh dharma rumah tangga.',
    translation: 'Dengan ini engkau dan aku menjadi satu dalam cinta dan bakti, seiring melangkah menempuh dharma rumah tangga.',
    reference: 'Doa Perkawinan Hindu'
  },

  /* =============================== BUDDHA =============================== */
  {
    id: 'buddha-kalama',
    religion: 'buddha',
    original: 'Dirgayu marganing sawarga, katon madyaning urip',
    translation: 'Selamat di jalan menuju kebahagiaan, tampak di tengah kehidupan yang diberkahi.',
    reference: 'Ucapan Doa Pernikahan Buddha'
  },
  {
    id: 'buddha-mettasutta',
    religion: 'buddha',
    original:
      'Sabbe sattā bhavantu sukhitattā — semoga semua makhluk berbahagia dan tenteram, hidup saling menyayangi sebagaimana seorang ibu menyayangi anak tunggalnya.',
    translation:
      'Semoga semua makhluk berbahagia dan tenteram, hidup saling menyayangi sebagaimana seorang ibu menyayangi anak tunggalnya.',
    reference: 'Metta Sutta'
  },
  {
    id: 'buddha-dhammapada-24',
    religion: 'buddha',
    original: 'Seyyathāpi sāli vā pasādalata, evameva saddhāvatāna jīvitampi sukhattam',
    translation: 'Sungguh, kehidupan orang yang tekun dalam keyakinan dan kebaikan adalah kehidupan yang sungguh bahagia.',
    reference: 'Dhammapada'
  },
  {
    id: 'buddha-naman',
    religion: 'buddha',
    original: 'Semoga pasangan ini selalu dilimpahi cinta kasih, pengertian, dan berkah Tiratana.',
    translation: 'Semoga pasangan ini selalu dilimpahi cinta kasih, pengertian, dan berkah Tiratana.',
    reference: 'Doa Pernikahan Buddha'
  },

  /* =============================== KONGHUCU =============================== */
  {
    id: 'konghucu-lunyu-12-10',
    religion: 'konghucu',
    original: 'Berbakti dan mengasihi sesama, itulah dasar dari segala kebajikan.',
    translation: 'Berbakti dan mengasihi sesama, itulah dasar dari segala kebajikan.',
    reference: 'Lun Yu (Analekta) 1:2'
  },
  {
    id: 'konghucu-zhongyong-13',
    religion: 'konghucu',
    original:
      'Semoga rumah tangga ini selalu harmonis, membina budi pekerti luhur, dan menebar cinta kasih terhadap seluruh umat di alam semesta.',
    translation: 'Semoga rumah tangga ini selalu harmonis, membina budi pekerti luhur, dan menebar cinta kasih terhadap seluruh umat di alam semesta.',
    reference: 'Doa Pernikahan Konghucu (Harmoni)'
  },
  {
    id: 'konghucu-tian',
    religion: 'konghucu',
    original: 'Tian, semoga berkat-Mu menyertai pasangan ini, sampai tua berpegang tangan, seia sekata dalam Dharma.',
    translation: 'Tian, semoga berkat-Mu menyertai pasangan ini, sampai tua berpegang tangan, seia sekata dalam Dharma.',
    reference: 'Doa Pernikahan Konghucu (Berkat)'
  },
  {
    id: 'konghucu-budipekerti',
    religion: 'konghucu',
    original: 'Rumah tangga yang rukun berawal dari budi pekerti yang luhur dan saling menghormati.',
    translation: 'Rumah tangga yang rukun berawal dari budi pekerti yang luhur dan saling menghormati.',
    reference: 'Ajaran Konghucu'
  }
];

export function getQuotesByReligion(religion: ReligionKey): WeddingQuote[] {
  return WEDDING_QUOTES.filter((q) => q.religion === religion);
}

export function getQuoteById(id?: string): WeddingQuote | undefined {
  return WEDDING_QUOTES.find((q) => q.id === id);
}