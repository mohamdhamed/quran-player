/**
 * Text Provider
 * 
 * مسؤول عن جلب النصوص القرآنية من AlQuran.cloud API
 */

const API_BASE = 'https://api.alquran.cloud/v1';

// Cache للقرآن الكامل
let quranCache = null;

export class TextProvider {
    constructor() {
        this._surahInfoCache = new Map();
    }

    /**
     * الحصول على نص السورة
     * @param {number} surahNumber - رقم السورة (1-114)
     * @returns {Promise<Object>} بيانات السورة مع الآيات
     */
    async getSurahText(surahNumber) {
        try {
            const response = await fetch(
                `${API_BASE}/surah/${surahNumber}/quran-simple`
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
    }

    /**
     * الحصول على معلومات السورة
     * @param {number} surahNumber - رقم السورة (1-114)
     * @returns {Promise<Object>} معلومات السورة
     */
    async getSurahInfo(surahNumber) {
        // تحقق من الـ cache
        if (this._surahInfoCache.has(surahNumber)) {
            return this._surahInfoCache.get(surahNumber);
        }

        try {
            const response = await fetch(
                `${API_BASE}/surah/${surahNumber}/quran-simple`
            );
            const data = await response.json();

            if (data.code === 200) {
                const info = {
                    number: data.data.number,
                    name: data.data.name,
                    englishName: data.data.englishName,
                    englishNameTranslation: data.data.englishNameTranslation,
                    numberOfAyahs: data.data.numberOfAyahs,
                    revelationType: data.data.revelationType
                };

                this._surahInfoCache.set(surahNumber, info);
                return info;
            }

            return null;
        } catch (error) {
            console.error('Error fetching surah info:', error);
            return null;
        }
    }

    /**
     * الحصول على السورة مع الصوت
     * @param {number} surahNumber - رقم السورة
     * @param {string} reciterId - معرف القارئ
     * @returns {Promise<Object>} بيانات السورة مع الصوت
     */
    async getSurahWithAudio(surahNumber, reciterId = 'ar.alafasy') {
        try {
            const response = await fetch(
                `${API_BASE}/surah/${surahNumber}/${reciterId}`
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
    }

    /**
     * تحميل القرآن الكامل للبحث
     * @private
     */
    async _loadFullQuran() {
        if (quranCache) return quranCache;

        try {
            const response = await fetch(`${API_BASE}/quran/quran-uthmani`);
            const data = await response.json();

            if (data.code === 200) {
                quranCache = data.data.surahs;
                return quranCache;
            }

            throw new Error('Failed to load Quran');
        } catch (error) {
            console.error('Error loading full Quran:', error);
            throw error;
        }
    }

    /**
     * مسح الـ cache
     */
    clearCache() {
        this._surahInfoCache.clear();
        quranCache = null;
    }

    /**
     * معلومات الـ cache
     */
    getCacheInfo() {
        return {
            surahInfo: this._surahInfoCache.size,
            fullQuranLoaded: quranCache !== null
        };
    }
}

export default TextProvider;
