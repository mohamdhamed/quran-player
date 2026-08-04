/**
 * Timing Provider
 * 
 * مسؤول عن جلب التوقيتات الدقيقة للآيات من mp3quran.net
 */

const API_BASE = 'https://mp3quran.net/api/v3';

// تعيين القراء للتوقيتات
const TIMING_RECITER_MAP = {
    'mishary': { readId: null, fallback: 118 },
    'abdulbasit': { readId: 53 },
    'husary': { readId: 118 },
    'minshawi': { readId: 112 },
    'sudais': { readId: null, fallback: 31 },
    'shuraim': { readId: 31 },
    'ghamadi': { readId: 24 },
    'ajmi': { readId: 4 },
    'shatri': { readId: 6 },
    'dosari': { readId: 210 }
};

export class TimingProvider {
    constructor() {
        this._timingsCache = new Map();
    }

    /**
     * الحصول على توقيتات الآيات
     * @param {number} surahNumber - رقم السورة (1-114)
     * @param {string} reciterId - معرف القارئ
     * @returns {Promise<Array>} مصفوفة التوقيتات
     */
    async getTimings(surahNumber, reciterId) {
        try {
            const readId = this._getReadId(reciterId);
            const cacheKey = `${readId}-${surahNumber}`;

            // تحقق من الـ cache
            if (this._timingsCache.has(cacheKey)) {
                return this._timingsCache.get(cacheKey);
            }

            const response = await fetch(
                `${API_BASE}/ayat_timing?surah=${surahNumber}&read=${readId}`
            );

            const data = await response.json();

            if (data && data.value) {
                // تحويل من milliseconds إلى seconds
                const timings = data.value.map(timing => ({
                    ayah: timing.ayah,
                    startTime: timing.start_time / 1000,
                    endTime: timing.end_time / 1000,
                    duration: (timing.end_time - timing.start_time) / 1000,
                    polygon: timing.polygon,
                    x: timing.x,
                    y: timing.y,
                    page: timing.page
                }));

                // حفظ في الـ cache
                this._timingsCache.set(cacheKey, timings);

                return timings;
            }

            return [];
        } catch (error) {
            console.error('Error fetching timings:', error);
            return [];
        }
    }

    /**
     * إيجاد الآية الحالية بناءً على الوقت
     * @param {number} currentTime - الوقت الحالي بالثواني
     * @param {Array} timings - مصفوفة التوقيتات
     * @returns {number} رقم الآية الحالية
     */
    findCurrentAyah(currentTime, timings) {
        if (!timings || timings.length === 0) {
            return 0;
        }

        // البحث من الأخير للأول (أكثر كفاءة)
        for (let i = timings.length - 1; i >= 0; i--) {
            if (currentTime >= timings[i].startTime) {
                return timings[i].ayah;
            }
        }

        // إذا الوقت أقل من أول آية
        return timings[0].ayah;
    }

    /**
     * مسح الـ cache
     */
    clearCache() {
        this._timingsCache.clear();
    }

    /**
     * معلومات الـ cache
     */
    getCacheInfo() {
        return {
            timings: this._timingsCache.size,
            keys: Array.from(this._timingsCache.keys())
        };
    }

    // ═══════════════════════════════════════════════════════════════
    // Private Methods
    // ═══════════════════════════════════════════════════════════════

    /**
     * تحويل معرف القارئ إلى readId
     * @private
     */
    _getReadId(reciterId) {
        const mapping = TIMING_RECITER_MAP[reciterId];
        if (!mapping) return 118; // الحصري كـ default
        return mapping.readId || mapping.fallback;
    }
}

export default TimingProvider;
