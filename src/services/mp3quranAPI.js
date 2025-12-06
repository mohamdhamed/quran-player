/**
 * MP3Quran.net API Service
 * 
 * مصدر موحد لكل شيء:
 * - ✅ الصوت (ملف واحد للسورة)
 * - ✅ التوقيتات الدقيقة (جاهزة ومُعدّة مسبقاً)
 * - ✅ 19 قارئ مع توقيتات دقيقة
 * - ✅ سريع جداً (استدعاء API واحد)
 */

const API_BASE = 'https://mp3quran.net/api/v3';

/**
 * تعيين القراء المحليين إلى mp3quran.net
 * 10 قراء موثوقين فقط
 */
const RECITER_MAPPING = {
  'mishary': {
    readId: null,
    fallback: 118, // الحصري
    name: 'مشاري راشد العفاسي',
    folder: 'https://server8.mp3quran.net/afs'
  },
  'abdulbasit': {
    readId: 53,
    name: 'عبد الباسط عبد الصمد',
    folder: 'https://server7.mp3quran.net/basit'
  },
  'husary': {
    readId: 118,
    name: 'محمود خليل الحصري',
    folder: 'https://server13.mp3quran.net/husr'
  },
  'minshawi': {
    readId: 112,
    name: 'محمد صديق المنشاوي',
    folder: 'https://server10.mp3quran.net/minsh'
  },
  'sudais': {
    readId: null,
    fallback: 31, // سعود الشريم (إمام الحرم)
    name: 'عبد الرحمن السديس',
    folder: 'https://server11.mp3quran.net/sds'
  },
  'shuraim': {
    readId: 31,
    name: 'سعود الشريم',
    folder: 'https://server7.mp3quran.net/shur'
  },
  'ghamadi': {
    readId: 24,
    name: 'سعد الغامدي',
    folder: 'https://server7.mp3quran.net/s_gmd'
  },
  'ajmi': {
    readId: 4,
    name: 'أحمد بن علي العجمي',
    folder: 'https://server10.mp3quran.net/ajm'
  },
  'shatri': {
    readId: 6,
    name: 'أبو بكر الشاطري',
    folder: 'https://server11.mp3quran.net/shatri'
  },
  'dosari': {
    readId: 210,
    name: 'ياسر الدوسري',
    folder: 'https://server11.mp3quran.net/yasser'
  }
};

// Cache للتوقيتات
const timingsCache = new Map();
const recitersCache = new Map();

/**
 * جلب قائمة القراء الذين لديهم توقيتات دقيقة
 */
export async function getRecitersWithTimings() {
  try {
    // تحقق من الـ cache
    if (recitersCache.size > 0) {
      return Array.from(recitersCache.values());
    }
    
    const response = await fetch(`${API_BASE}/ayat_timing/reads`);
    const data = await response.json();
    
    if (data && data.value) {
      // حفظ في الـ cache
      data.value.forEach(reciter => {
        recitersCache.set(reciter.id, reciter);
      });
      
      return data.value;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching reciters:', error);
    return [];
  }
}

/**
 * جلب التوقيتات الدقيقة لسورة معينة
 * 
 * @param {number} surahNumber - رقم السورة (1-114)
 * @param {string} localReciterId - معرف القارئ المحلي (mishary, abdulbasit, etc.)
 * @returns {Promise<Array>} - مصفوفة التوقيتات
 */
export async function getPreciseTimings(surahNumber, localReciterId) {
  try {
    // تحويل المعرف المحلي إلى readId
    const readId = getReadIdFromLocal(localReciterId);
    
    // تحقق من الـ cache
    const cacheKey = `${readId}-${surahNumber}`;
    if (timingsCache.has(cacheKey)) {
      return timingsCache.get(cacheKey);
    }
    
    const response = await fetch(
      `${API_BASE}/ayat_timing?surah=${surahNumber}&read=${readId}`
    );
    
    const data = await response.json();
    
    if (data && data.value) {
      // تحويل من milliseconds إلى seconds
      const timings = data.value.map(timing => ({
        ayah: timing.ayah,
        startTime: timing.start_time / 1000, // ms → s
        endTime: timing.end_time / 1000,     // ms → s
        duration: (timing.end_time - timing.start_time) / 1000,
        polygon: timing.polygon,
        x: timing.x,
        y: timing.y,
        page: timing.page
      }));
      
      // حفظ في الـ cache
      timingsCache.set(cacheKey, timings);
      
      return timings;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching timings:', error);
    return [];
  }
}

/**
 * الحصول على رابط الملف الصوتي
 * 
 * @param {string} localReciterId - معرف القارئ المحلي
 * @param {number} surahNumber - رقم السورة
 * @returns {Promise<string>} - رابط الملف الصوتي
 */
export async function getAudioUrl(localReciterId, surahNumber) {
  try {
    const paddedNumber = String(surahNumber).padStart(3, '0');
    
    // 1️⃣ First: Try to get from RECITER_MAPPING folder (local config)
    const mapping = RECITER_MAPPING[localReciterId];
    if (mapping && mapping.folder) {
      const audioUrl = `${mapping.folder}/${paddedNumber}.mp3`;
      return audioUrl;
    }
    
    // 2️⃣ Second: Try to get from mp3quran.net API (for fallback reciters like mishary/sudais)
    const readId = getReadIdFromLocal(localReciterId);
    let reciter = recitersCache.get(readId);
    
    if (!reciter) {
      // إذا لم يكن في الـ cache، جلب القراء
      await getRecitersWithTimings();
      reciter = recitersCache.get(readId);
    }
    
    if (reciter && reciter.folder_url) {
      const audioUrl = `${reciter.folder_url}${paddedNumber}.mp3`;
      return audioUrl;
    }
    
    throw new Error(`No audio URL found for reciter: ${localReciterId}`);
  } catch (error) {
    console.error('Error getting audio URL:', error);
    return null;
  }
}

/**
 * إيجاد الآية الحالية بناءً على الوقت
 * 
 * @param {number} currentTime - الوقت الحالي بالثواني
 * @param {Array} timings - مصفوفة التوقيتات
 * @returns {number} - رقم الآية الحالية
 */
export function findCurrentAyah(currentTime, timings) {
  if (!timings || timings.length === 0) {
    return 0;
  }
  
  // البحث عن الآية الحالية بدقة (من الأخير للأول)
  for (let i = timings.length - 1; i >= 0; i--) {
    if (currentTime >= timings[i].startTime) {
      return timings[i].ayah;
    }
  }
  
  // إذا الوقت أقل من أول آية، نرجع أول آية
  return timings[0].ayah;
}

/**
 * تحويل معرف القارئ المحلي إلى readId
 */
function getReadIdFromLocal(localReciterId) {
  const mapping = RECITER_MAPPING[localReciterId];
  
  if (!mapping) {
    return 118; // الحصري
  }
  
  return mapping.readId || mapping.fallback;
}

/**
 * جلب معلومات قارئ معين
 */
export async function getReciterInfo(localReciterId) {
  const readId = getReadIdFromLocal(localReciterId);
  
  // تحقق من الـ cache
  let reciter = recitersCache.get(readId);
  
  if (!reciter) {
    await getRecitersWithTimings();
    reciter = recitersCache.get(readId);
  }
  
  return reciter || RECITER_MAPPING[localReciterId];
}

/**
 * مسح الـ cache
 */
export function clearCache() {
  timingsCache.clear();
  recitersCache.clear();
}

/**
 * معلومات الـ cache
 */
export function getCacheInfo() {
  return {
    timings: timingsCache.size,
    reciters: recitersCache.size,
    keys: Array.from(timingsCache.keys())
  };
}

// تصدير الـ mapping للاستخدام الخارجي
export { RECITER_MAPPING };
