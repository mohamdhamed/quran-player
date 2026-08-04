/**
 * Search Provider
 * 
 * مسؤول عن البحث في القرآن الكريم
 * يدعم البحث النصي والبحث الدلالي
 */

import errorHandler from '../../utils/errorHandler';
import { ApiError, ErrorCodes } from '../../utils/ApiError';

const ALQURAN_API = 'https://api.alquran.cloud/v1';

// Cache للقرآن الكامل
let fullQuranCache = null;

export class SearchProvider {
    constructor() {
        this._searchCache = new Map();
    }

    /**
     * البحث في القرآن
     * @param {string} query - نص البحث
     * @param {string} language - لغة البحث (ar, en)
     * @returns {Promise<Array>} نتائج البحث
     */
    async search(query, language = 'ar') {
        try {
            // تحقق من الـ cache
            const cacheKey = `${query}-${language}`;
            if (this._searchCache.has(cacheKey)) {
                return this._searchCache.get(cacheKey);
            }

            // تحميل القرآن الكامل إذا لم يكن محملاً
            if (!fullQuranCache) {
                await this._loadFullQuran();
            }

            const searchTerm = query.trim();
            const normalizedSearch = this._normalizeText(searchTerm);
            const results = [];

            fullQuranCache.forEach(surah => {
                if (!surah.ayahs || surah.ayahs.length === 0) return;

                surah.ayahs.forEach(ayah => {
                    const normalizedAyah = this._normalizeText(ayah.text);

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

            // تخزين النتائج (أول 50 فقط)
            const limitedResults = results.slice(0, 50);
            this._searchCache.set(cacheKey, limitedResults);

            return limitedResults;
        } catch (error) {
            errorHandler.handle(
                new ApiError(error.message, ErrorCodes.SEARCH_ERROR, error, { query })
            );
            throw error;
        }
    }

    /**
     * البحث الدلالي في القرآن
     * @param {string} query - نص البحث
     * @param {number} limit - عدد النتائج
     * @returns {Promise<Array>} نتائج البحث
     */
    async semanticSearch(query, limit = 10) {
        try {
            const response = await fetch(
                'https://api.qurani.ai/semantic/quran',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query, limit })
                }
            );

            const data = await response.json();
            return data;
        } catch (error) {
            errorHandler.handle(
                new ApiError(error.message, ErrorCodes.SEARCH_ERROR, error, { query })
            );
            return [];
        }
    }

    /**
     * مسح الـ cache
     */
    clearCache() {
        this._searchCache.clear();
    }

    /**
     * معلومات الـ cache
     */
    getCacheInfo() {
        return {
            searches: this._searchCache.size,
            fullQuranLoaded: fullQuranCache !== null
        };
    }

    // ═══════════════════════════════════════════════════════════════
    // Private Methods
    // ═══════════════════════════════════════════════════════════════

    /**
     * تحميل القرآن الكامل
     * @private
     */
    async _loadFullQuran() {
        try {
            const response = await fetch(`${ALQURAN_API}/quran/quran-uthmani`);
            const data = await response.json();

            if (data.code === 200) {
                fullQuranCache = data.data.surahs;
            } else {
                throw new Error('Failed to load Quran');
            }
        } catch (error) {
            console.error('Error loading full Quran:', error);
            throw error;
        }
    }

    /**
     * تنظيف النص العربي للبحث
     * @private
     */
    _normalizeText(text) {
        return text
            .replace(/[\u064B-\u065F]/g, '') // Remove Arabic diacritics
            .replace(/[ًٌٍَُِّْ]/g, '')
            .replace(/[\u0670]/g, '') // Remove alef superscript
            .replace(/ٱ/g, 'ا') // Replace alef wasla
            .replace(/أ|إ|آ/g, 'ا') // Normalize alef forms
            .replace(/ى/g, 'ي') // Normalize alef maqsura
            .replace(/ة/g, 'ه') // Normalize taa marboota
            .replace(/\uFEFF/g, '') // Remove zero-width no-break space
            .replace(/\s+/g, ' ')
            .trim();
    }
}

export default SearchProvider;
