/**
 * Reciter Registry - المصدر الوحيد لبيانات القراء
 *
 * كان الجدول ده متكرر في 3 ملفات بقيم مختلفة، والنتيجة كانت توقيتات
 * قارئ بتتعرض على تلاوة قارئ تاني.
 *
 * ═══════════════════════════════════════════════════════════════
 * قاعدة مهمة: timingReadId لازم يكون الـ read اللي folder_url بتاعه
 * هو نفس audioFolder تحت بالظبط.
 *
 * التوقيتات مربوطة بتسجيل صوتي معيّن، مش بالقارئ. لو أخدنا توقيتات
 * من تسجيل تاني - حتى لنفس الشيخ - التظليل هيبقى مزحلق.
 *
 * للتأكد من أي قيمة:
 *   curl -sL "https://www.mp3quran.net/api/v3/ayat_timing/reads"
 * ودوّر على الـ read اللي folder_url بتاعه = audioFolder
 * ═══════════════════════════════════════════════════════════════
 */

export const RECITERS = {
  mishary: {
    name: 'مشاري راشد العفاسي',
    nameEn: 'Mishari Rashid Alafasy',
    audioFolder: 'https://server8.mp3quran.net/afs',
    timingReadId: 123
  },
  abdulbasit: {
    name: 'عبد الباسط عبد الصمد',
    nameEn: 'Abdul Basit Abdul Samad',
    audioFolder: 'https://server7.mp3quran.net/basit',
    timingReadId: 53
  },
  husary: {
    name: 'محمود خليل الحصري',
    nameEn: 'Mahmoud Khalil Al-Hussary',
    audioFolder: 'https://server13.mp3quran.net/husr',
    timingReadId: 118
  },
  minshawi: {
    name: 'محمد صديق المنشاوي',
    nameEn: 'Mohamed Siddiq Al-Minshawi',
    audioFolder: 'https://server10.mp3quran.net/minsh',
    timingReadId: 112
  },
  sudais: {
    name: 'عبد الرحمن السديس',
    nameEn: 'Abdul Rahman Al-Sudais',
    audioFolder: 'https://server11.mp3quran.net/sds',
    timingReadId: 54
  },
  shuraim: {
    name: 'سعود الشريم',
    nameEn: 'Saud Al-Shuraim',
    audioFolder: 'https://server7.mp3quran.net/shur',
    timingReadId: 31
  },
  ghamadi: {
    name: 'سعد الغامدي',
    nameEn: 'Saad Al-Ghamdi',
    audioFolder: 'https://server7.mp3quran.net/s_gmd',
    timingReadId: 30
  },
  ajmi: {
    name: 'أحمد بن علي العجمي',
    nameEn: 'Ahmed Al-Ajmi',
    audioFolder: 'https://server10.mp3quran.net/ajm',
    timingReadId: 5
  },
  shatri: {
    name: 'أبو بكر الشاطري',
    nameEn: 'Abu Bakr Al-Shatri',
    audioFolder: 'https://server11.mp3quran.net/shatri',
    timingReadId: 4
  },
  dosari: {
    name: 'ياسر الدوسري',
    nameEn: 'Yasser Al-Dosari',
    audioFolder: 'https://server11.mp3quran.net/yasser',
    timingReadId: 92
  }
};

/** القارئ الافتراضي لو المعرّف مش معروف */
export const DEFAULT_RECITER_ID = 'mishary';

/**
 * @param {string} reciterId
 * @returns {Object} بيانات القارئ (أو الافتراضي لو مش موجود)
 */
export function getReciter(reciterId) {
  return RECITERS[reciterId] || RECITERS[DEFAULT_RECITER_ID];
}

/**
 * رقم الـ read بتاع التوقيتات
 * @param {string} reciterId
 * @returns {number}
 */
export function getTimingReadId(reciterId) {
  return getReciter(reciterId).timingReadId;
}

/**
 * رابط ملف السورة الصوتي
 * @param {string} reciterId
 * @param {number} surahNumber - 1..114
 * @returns {string}
 */
export function getAudioUrl(reciterId, surahNumber) {
  const folder = getReciter(reciterId).audioFolder.replace(/\/$/, '');
  return `${folder}/${String(surahNumber).padStart(3, '0')}.mp3`;
}

/** كل القراء كمصفوفة، كل واحد معاه id */
export function getAllReciters() {
  return Object.entries(RECITERS).map(([id, data]) => ({ id, ...data }));
}
