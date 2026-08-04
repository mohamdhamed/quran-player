/**
 * Timing Provider
 *
 * بيجيب توقيتات الآيات من mp3quran.net
 * التوقيتات على مستوى الآية (مش الكلمة) - ده أقصى اللي المصدر ده بيوفّره.
 */

import { getTimingReadId } from '../reciterRegistry';

// لازم www: الدومين من غيرها بيرجّع 301
const API_BASE = 'https://www.mp3quran.net/api/v3';

export class TimingProvider {
    constructor() {
        this._timingsCache = new Map();
    }

    /**
     * الحصول على توقيتات الآيات
     * @param {number} surahNumber - رقم السورة (1-114)
     * @param {string} reciterId - معرف القارئ
     * @returns {Promise<Array>} مصفوفة التوقيتات (فاضية لو فشل)
     */
    async getTimings(surahNumber, reciterId) {
        try {
            const readId = getTimingReadId(reciterId);
            const cacheKey = `${readId}-${surahNumber}`;

            // تحقق من الـ cache
            if (this._timingsCache.has(cacheKey)) {
                return this._timingsCache.get(cacheKey);
            }

            const response = await fetch(
                `${API_BASE}/ayat_timing?surah=${surahNumber}&read=${readId}`
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            // الـ API بيرجّع مصفوفة مباشرة. القراءة القديمة كانت بتدوّر على
            // data.value اللي مش موجود، فالتوقيتات كانت بترجع فاضية دايماً
            // والتظليل ما كانش بيتحرك خالص. بنقبل الشكلين تحسباً لأي تغيير.
            const raw = Array.isArray(data) ? data : data?.value;

            if (!Array.isArray(raw) || raw.length === 0) {
                return [];
            }

            // تحويل من milliseconds إلى seconds
            const timings = raw.map((timing) => ({
                ayah: timing.ayah,
                startTime: timing.start_time / 1000,
                endTime: timing.end_time / 1000,
                duration: (timing.end_time - timing.start_time) / 1000,
                polygon: timing.polygon,
                x: timing.x,
                y: timing.y,
                page: timing.page
            }));

            this._timingsCache.set(cacheKey, timings);

            return timings;
        } catch (error) {
            console.error('Error fetching timings:', error);
            return [];
        }
    }

    /**
     * إيجاد الآية الحالية بناءً على الوقت
     * @param {number} currentTime - الوقت الحالي بالثواني
     * @param {Array} timings - مصفوفة التوقيتات
     * @returns {number} رقم الآية بترقيم mp3quran (البسملة = 0)
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
}

export default TimingProvider;
