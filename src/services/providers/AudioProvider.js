/**
 * Audio Provider
 * 
 * مسؤول عن جلب روابط الصوت من mp3quran.net
 * يستخدم RECITER_MAPPING للتحويل بين المعرفات المحلية و mp3quran
 */

import recitersData from '../../data/reciters.json';

// تعيين القراء المحليين إلى mp3quran.net
const RECITER_MAPPING = {
    'mishary': {
        readId: null,
        fallback: 118,
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
        fallback: 31,
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

export class AudioProvider {
    constructor() {
        this._recitersCache = new Map();
    }

    /**
     * الحصول على رابط الملف الصوتي
     * @param {string} reciterId - معرف القارئ المحلي
     * @param {number} surahNumber - رقم السورة
     * @returns {Promise<string>} رابط الملف الصوتي
     */
    async getAudioUrl(reciterId, surahNumber) {
        try {
            const paddedNumber = String(surahNumber).padStart(3, '0');

            // 1️⃣ محاولة من RECITER_MAPPING (الإعدادات المحلية)
            const mapping = RECITER_MAPPING[reciterId];
            if (mapping && mapping.folder) {
                return `${mapping.folder}/${paddedNumber}.mp3`;
            }

            // 2️⃣ Fallback: محاولة من API
            const readId = this._getReadId(reciterId);
            let reciter = this._recitersCache.get(readId);

            if (!reciter) {
                await this._fetchRecitersWithTimings();
                reciter = this._recitersCache.get(readId);
            }

            if (reciter && reciter.folder_url) {
                return `${reciter.folder_url}${paddedNumber}.mp3`;
            }

            throw new Error(`No audio URL found for reciter: ${reciterId}`);
        } catch (error) {
            console.error('Error getting audio URL:', error);
            return null;
        }
    }

    /**
     * الحصول على قائمة القراء
     * @returns {Array} قائمة القراء
     */
    getReciters() {
        return recitersData;
    }

    /**
     * الحصول على معلومات قارئ معين
     * @param {string} reciterId - معرف القارئ
     * @returns {Object} معلومات القارئ
     */
    getReciterById(reciterId) {
        // أولاً من RECITER_MAPPING
        const mapping = RECITER_MAPPING[reciterId];
        if (mapping) {
            return {
                id: reciterId,
                name: mapping.name,
                readId: mapping.readId || mapping.fallback
            };
        }

        // ثانياً من recitersData
        return recitersData.find(r => r.id === reciterId);
    }

    /**
     * مسح الـ cache
     */
    clearCache() {
        this._recitersCache.clear();
    }

    /**
     * معلومات الـ cache
     */
    getCacheInfo() {
        return {
            reciters: this._recitersCache.size
        };
    }

    // ═══════════════════════════════════════════════════════════════
    // Private Methods
    // ═══════════════════════════════════════════════════════════════

    /**
     * تحويل معرف القارئ المحلي إلى readId
     * @private
     */
    _getReadId(reciterId) {
        const mapping = RECITER_MAPPING[reciterId];
        if (!mapping) return 118; // الحصري كـ default
        return mapping.readId || mapping.fallback;
    }

    /**
     * جلب قائمة القراء من API
     * @private
     */
    async _fetchRecitersWithTimings() {
        try {
            const response = await fetch('https://mp3quran.net/api/v3/ayat_timing/reads');
            const data = await response.json();

            if (data && data.value) {
                data.value.forEach(reciter => {
                    this._recitersCache.set(reciter.id, reciter);
                });
            }
        } catch (error) {
            console.error('Error fetching reciters:', error);
        }
    }
}

// تصدير الـ mapping للاستخدام الخارجي
export { RECITER_MAPPING };

export default AudioProvider;
