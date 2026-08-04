/**
 * Audio Provider
 *
 * مسؤول عن روابط الملفات الصوتية وبيانات القراء.
 * كل البيانات جاية من reciterRegistry - المصدر الوحيد.
 */

import {
    RECITERS,
    getReciter,
    getTimingReadId,
    getAudioUrl as buildAudioUrl,
    getAllReciters
} from '../reciterRegistry';

export class AudioProvider {
    /**
     * الحصول على رابط الملف الصوتي
     * @param {string} reciterId - معرف القارئ المحلي
     * @param {number} surahNumber - رقم السورة (1-114)
     * @returns {Promise<string|null>} رابط الملف الصوتي
     */
    async getAudioUrl(reciterId, surahNumber) {
        if (!surahNumber || surahNumber < 1 || surahNumber > 114) {
            console.error('Invalid surah number:', surahNumber);
            return null;
        }

        return buildAudioUrl(reciterId, surahNumber);
    }

    /**
     * الحصول على قائمة القراء
     * @returns {Array} قائمة القراء
     */
    getReciters() {
        return getAllReciters();
    }

    /**
     * الحصول على معلومات قارئ معين
     * @param {string} reciterId - معرف القارئ
     * @returns {Object} معلومات القارئ
     */
    getReciterById(reciterId) {
        const reciter = getReciter(reciterId);

        return {
            id: reciterId in RECITERS ? reciterId : null,
            name: reciter.name,
            nameEn: reciter.nameEn,
            readId: getTimingReadId(reciterId)
        };
    }

    /**
     * مسح الـ cache
     * (مفيش cache دلوقتي - البيانات كلها محلية)
     */
    clearCache() {}

    /**
     * معلومات الـ cache
     */
    getCacheInfo() {
        return { reciters: Object.keys(RECITERS).length };
    }
}

export default AudioProvider;
