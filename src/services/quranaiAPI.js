/**
 * Qurani.ai API Service
 * https://qurani.ai/en/docs
 * 
 * Free API for Quranic data including:
 * - Ayahs with precise timing
 * - Audio files with word-by-word timing
 * - Translations
 * - Semantic search
 */

import { rateLimitedFetch } from '../utils/rateLimiter';

const QURANAI_BASE_URL = 'https://api.qurani.ai/v1';
const SEMANTIC_SEARCH_URL = 'https://api.qurani.ai';

/**
 * Map old reciter IDs to Qurani.ai format
 * @param {string} oldId - Old reciter ID (mishary, abdulbasit, etc.)
 * @returns {string} Qurani.ai reciter ID (ar.alafasy, ar.abdulbasit, etc.)
 */
export const mapReciterToQuranai = (oldId) => {
  const mapping = {
    'mishary': 'ar.alafasy',
    'abdulbasit': 'ar.abdulbasit',
    'husary': 'ar.husary',
    'sudais': 'ar.sudais',
    'shuraim': 'ar.shuraim',
    // Also accept Qurani.ai format directly
    'ar.alafasy': 'ar.alafasy',
    'ar.abdulbasit': 'ar.abdulbasit',
    'ar.husary': 'ar.husary',
    'ar.minshawi': 'ar.minshawi',
    'ar.sudais': 'ar.sudais',
    'ar.shuraim': 'ar.shuraim'
  };
  
  return mapping[oldId] || 'ar.alafasy'; // Default to Mishary
};

/**
 * Fetch Surah data with ayahs
 * @param {number} surahNumber - Surah number (1-114)
 * @param {string} edition - Edition identifier (default: quran-simple)
 * @returns {Promise<Object>} Surah data with ayahs
 */
export const getSurahData = async (surahNumber, edition = 'quran-simple') => {
  try {
    // Using alquran.cloud as Qurani.ai surah endpoint structure
    const response = await rateLimitedFetch(
      `https://api.alquran.cloud/v1/surah/${surahNumber}/${edition}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching surah data:', error);
    return null;
  }
};

/**
 * Fetch specific ayah with timing information
 * @param {number} surahNumber - Surah number (1-114)
 * @param {number} ayahNumber - Ayah number in surah
 * @param {string} edition - Edition identifier
 * @returns {Promise<Object>} Ayah data with timing
 */
export const getAyahData = async (surahNumber, ayahNumber, edition = 'quran-simple') => {
  try {
    const response = await rateLimitedFetch(
      `${QURANAI_BASE_URL}/ayah/${surahNumber}:${ayahNumber}/${edition}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching ayah data:', error);
    return null;
  }
};

/**
 * Get available audio editions with timing support
 * @returns {Promise<Array>} List of audio editions
 */
export const getAudioEditions = async () => {
  try {
    const response = await fetch(`${QURANAI_BASE_URL}/edition?language=ar&format=audio`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching audio editions:', error);
    return [];
  }
};

/**
 * Get audio URL for a specific surah
 * @param {number} surahNumber - Surah number (1-114)
 * @param {string} reciter - Reciter identifier (old format or Qurani.ai format)
 * @returns {string} Audio URL
 */
export const getAudioUrl = (surahNumber, reciter = 'mishary') => {
  const quranaiReciter = mapReciterToQuranai(reciter);
  return `${QURANAI_BASE_URL}/audio/${quranaiReciter}/${surahNumber}`;
};

/**
 * Get word-by-word timing for a surah
 * @param {number} surahNumber - Surah number (1-114)
 * @param {string} reciter - Reciter identifier (old format or Qurani.ai format)
 * @returns {Promise<Object>} Timing data for each word
 */
export const getSurahTiming = async (surahNumber, reciter = 'mishary') => {
  try {
    // Convert to Qurani.ai format
    const quranaiReciter = mapReciterToQuranai(reciter);
    
    console.log(`🎤 Fetching timing for reciter: ${reciter} → ${quranaiReciter}`);
    
    // Try to get timing data from the timing endpoint
    const response = await rateLimitedFetch(
      `${QURANAI_BASE_URL}/timing/${quranaiReciter}/${surahNumber}`
    );
    
    if (!response.ok) {
      console.warn(`⚠️ Timing API returned ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    console.log(`✅ Loaded timing data:`, data);
    return data;
  } catch (error) {
    console.error('Error fetching timing data:', error);
    return null;
  }
};

/**
 * Semantic Search in Quran by meaning
 * @param {string} query - Search query in Arabic or English
 * @param {number} limit - Number of results to return
 * @returns {Promise<Array>} Search results
 */
export const semanticSearchQuran = async (query, limit = 10) => {
  try {
    const response = await rateLimitedFetch(
      `${SEMANTIC_SEARCH_URL}/semantic/quran`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          limit
        })
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in semantic search:', error);
    return [];
  }
};

/**
 * Get translations for a specific ayah
 * @param {number} surahNumber - Surah number (1-114)
 * @param {number} ayahNumber - Ayah number in surah
 * @param {string} language - Language code (en, ur, etc.)
 * @returns {Promise<Object>} Translation data
 */
export const getAyahTranslation = async (surahNumber, ayahNumber, language = 'en') => {
  try {
    const editions = {
      en: 'en.sahih',
      ur: 'ur.jalandhry',
      fr: 'fr.hamidullah',
      id: 'id.indonesian',
      tr: 'tr.diyanet'
    };
    
    const edition = editions[language] || 'en.sahih';
    const response = await fetch(
      `${QURANAI_BASE_URL}/ayah/${surahNumber}:${ayahNumber}/${edition}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching translation:', error);
    return null;
  }
};

/**
 * Search Quran by text (traditional keyword search)
 * @param {string} query - Search query
 * @param {string} edition - Edition identifier
 * @returns {Promise<Array>} Search results
 */
export const searchQuran = async (query, edition = 'quran-simple') => {
  try {
    const response = await fetch(
      `${QURANAI_BASE_URL}/search?q=${encodeURIComponent(query)}&edition=${edition}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching Quran:', error);
    return [];
  }
};

/**
 * Get all available reciters
 * @returns {Array} List of available reciters with Qurani.ai identifiers
 */
export const getAvailableReciters = () => {
  return [
    {
      id: 'mishary',
      quranaiId: 'ar.alafasy',
      name: 'مشاري راشد العفاسي',
      nameEn: 'Mishari Rashid Alafasy',
      country: 'الكويت',
      hasTiming: true
    },
    {
      id: 'abdulbasit',
      quranaiId: 'ar.abdulbasit',
      name: 'عبد الباسط عبد الصمد',
      nameEn: 'Abdul Basit',
      country: 'مصر',
      hasTiming: true
    },
    {
      id: 'husary',
      quranaiId: 'ar.husary',
      name: 'محمود خليل الحصري',
      nameEn: 'Mahmoud Khalil Al-Hussary',
      country: 'مصر',
      hasTiming: true
    },
    {
      id: 'minshawi',
      quranaiId: 'ar.minshawi',
      name: 'محمد صديق المنشاوي',
      nameEn: 'Mohamed Siddiq Al-Minshawi',
      country: 'مصر',
      hasTiming: true
    },
    {
      id: 'sudais',
      quranaiId: 'ar.sudais',
      name: 'عبد الرحمن السديس',
      nameEn: 'Abdul Rahman Al-Sudais',
      country: 'السعودية',
      hasTiming: true
    }
  ];
};

export default {
  getSurahData,
  getAyahData,
  getAudioEditions,
  getAudioUrl,
  getSurahTiming,
  semanticSearchQuran,
  getAyahTranslation,
  searchQuran,
  getAvailableReciters,
  mapReciterToQuranai
};
