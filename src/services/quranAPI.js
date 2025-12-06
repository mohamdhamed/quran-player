import recitersData from '../data/reciters.json';

/**
 * Map local reciter IDs to AlQuran.cloud format
 */
const RECITER_MAP = {
  'mishary': 'ar.alafasy',
  'abdulbasit': 'ar.abdulbasit',
  'husary': 'ar.husary',
  'sudais': 'ar.sudais',
  'shuraim': 'ar.shaatree'
};

/**
 * Get audio URL from AlQuran.cloud API
 * الآن نستخدم api.alquran.cloud لكل شيء - الصوت والنص والتوقيتات
 */
export const getAudioUrl = async (reciterId, surahNumber) => {
  try {
    // تحويل معرف القارئ
    const alquranReciter = RECITER_MAP[reciterId] || 'ar.alafasy';
    
    // جلب بيانات السورة من API
    const response = await fetch(
      `https://api.alquran.cloud/v1/surah/${surahNumber}/${alquranReciter}`
    );
    const data = await response.json();
    
    if (data.code === 200 && data.data.edition.format === 'audio') {
      // استخراج URL الصوت من أول آية (كل الآيات لها نفس المسار)
      // نبني رابط السورة الكاملة
      const firstAyahAudio = data.data.ayahs[0].audio;
      // https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3
      
      // نستخرج المسار الأساسي
      const basePath = firstAyahAudio.substring(0, firstAyahAudio.lastIndexOf('/'));
      
      // نحسب رقم الآية الأولى في السورة (globally)
      const firstAyahNumber = data.data.ayahs[0].number;
      const lastAyahNumber = data.data.ayahs[data.data.ayahs.length - 1].number;
      
      return {
        basePath,
        firstAyahNumber,
        lastAyahNumber,
        ayahs: data.data.ayahs
      };
    }
    
    throw new Error('Invalid audio data');
  } catch (error) {
    console.error('Error fetching audio URL:', error);
    return null;
  }
};

export const getReciters = () => {
  return recitersData;
};

export const getReciterById = (reciterId) => {
  return recitersData.find(r => r.id === reciterId);
};

export const getReciterAlquranId = (reciterId) => {
  return RECITER_MAP[reciterId] || 'ar.alafasy';
};

// Fetch Quranic text and audio from api.alquran.cloud
export const getSurahWithAudio = async (surahNumber, reciterId = 'mishary') => {
  try {
    const alquranReciter = RECITER_MAP[reciterId] || 'ar.alafasy';
    
    const response = await fetch(
      `https://api.alquran.cloud/v1/surah/${surahNumber}/${alquranReciter}`
    );
    const data = await response.json();
    
    if (data.code === 200) {
      return data.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching surah with audio:', error);
    return null;
  }
};

// Fetch Quranic text from API
export const getSurahText = async (surahNumber) => {
  try {
    const response = await fetch(
      `https://api.alquran.cloud/v1/surah/${surahNumber}/quran-simple`
    );
    const data = await response.json();
    
    if (data.code === 200) {
      return data.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching surah text:', error);
    return null;
  }
};

// Get surah info
export const getSurahInfo = async (surahNumber) => {
  try {
    const response = await fetch(
      `https://api.alquran.cloud/v1/surah/${surahNumber}/quran-simple`
    );
    const data = await response.json();
    
    if (data.code === 200) {
      return data.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching surah info:', error);
    return null;
  }
};

/**
 * Smart AI-powered search in Quran verses
 * Uses Al-Quran Cloud search API
 */
// Cache للقرآن الكامل لتسريع البحث
let quranCache = null;

/**
 * Smart AI-powered search in Quran verses
 * Uses local search through entire Quran for better results
 */
export const searchVerses = async (query, language = 'ar') => {
  try {
    // Load entire Quran if not cached
    if (!quranCache) {
      const response = await fetch('https://api.alquran.cloud/v1/quran/quran-uthmani');
      const data = await response.json();
      
      if (data.code === 200) {
        quranCache = data.data.surahs;
      } else {
        throw new Error('Failed to load Quran');
      }
    }
    
    // Search through all verses
    const results = [];
    const searchTerm = query.trim();
    
    // Remove diacritics and normalize Arabic text for better search
    const normalizeText = (text) => {
      return text
        .replace(/[\u064B-\u065F]/g, '') // Remove all Arabic diacritics
        .replace(/[ًٌٍَُِّْ]/g, '') // Remove more diacritics
        .replace(/[\u0670]/g, '') // Remove alef superscript (ٰ) - THIS WAS THE ISSUE!
        .replace(/ٱ/g, 'ا') // Replace alef wasla with regular alef
        .replace(/أ|إ|آ/g, 'ا') // Normalize all alef forms
        .replace(/ى/g, 'ي') // Normalize alef maqsura
        .replace(/ة/g, 'ه') // Normalize taa marboota
        .replace(/\uFEFF/g, '') // Remove zero-width no-break space
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
    };
    
    const normalizedSearch = normalizeText(searchTerm);
    
    let totalAyahs = 0;
    let foundInSurah = false;
    
    quranCache.forEach(surah => {
      if (!surah.ayahs || surah.ayahs.length === 0) {
        return;
      }
      
      surah.ayahs.forEach(ayah => {
        totalAyahs++;
        const normalizedAyah = normalizeText(ayah.text);
        
        // البحث في نص الآية (بدون تشكيل)
        if (normalizedAyah.includes(normalizedSearch)) {
          results.push({
            surahNumber: surah.number,
            surahName: surah.name,
            surahNameEn: surah.englishName,
            ayahNumber: ayah.numberInSurah,
            ayahText: ayah.text,
            fullAyahNumber: ayah.number,
            revelationType: surah.revelationType
          });
        }
      });
    });
    
    // Return first 50 results to avoid overwhelming the UI
    return results.slice(0, 50);
  } catch (error) {
    console.error('Error searching verses:', error);
    throw error;
  }
};
