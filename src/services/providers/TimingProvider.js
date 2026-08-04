/**
 * Timing Provider
 *
 * بيجيب توقيتات الآيات من mp3quran.net
 * التوقيتات على مستوى الآية (مش الكلمة) - ده أقصى اللي المصدر ده بيوفّره.
 */

import { getTimingReadId } from '../reciterRegistry';
import surahsData from '../../data/surahs.json';
import errorHandler from '../../utils/errorHandler';
import { ApiError, ErrorCodes } from '../../utils/ApiError';

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

            const offset = this._detectAyahOffset(raw, surahNumber);

            // تحويل من milliseconds إلى seconds + توحيد ترقيم الآيات
            const timings = raw.map((timing) => ({
                ayah: timing.ayah + offset,
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
            // التلاوة نفسها بتكمل، اللي بيضيع هو التظليل بس
            errorHandler.handle(
                new ApiError(error.message, ErrorCodes.TIMINGS_LOAD_ERROR, error, {
                    surahNumber,
                    reciterId
                })
            );
            return [];
        }
    }

    /**
     * تحديد إزاحة ترقيم الآيات من البيانات نفسها
     *
     * الـ API مش ثابت على ترقيم واحد - بيختلف من قارئ لقارئ ومن سورة لسورة:
     *   مشاري / الفاتحة      → 1..7    مطابق لترقيم المصحف
     *   الحصري / الفاتحة     → 0..6    مزاح بواحد (البسملة هي آية 1 في الفاتحة)
     *   الحصري / الإخلاص     → 0..4    الصفر = البسملة، والباقي مطابق
     *   عبدالباسط / الفاتحة  → 0..7    الصفر = الاستعاذة، والباقي مطابق
     *
     * فبدل ما نفترض إزاحة ثابتة (اللي بيخلي التظليل سابق أو متأخر عن الصوت
     * حسب القارئ)، بنقارن أكبر رقم آية بعدد آيات السورة الحقيقي.
     *
     * @private
     * @returns {number} 0 أو 1
     */
    _detectAyahOffset(raw, surahNumber) {
        const surah = surahsData.find((s) => s.number === Number(surahNumber));
        if (!surah) return 0;

        const maxAyah = Math.max(...raw.map((t) => t.ayah));

        // ناقص واحد عن عدد الآيات → الترقيم بيبدأ من صفر
        return maxAyah === surah.verses - 1 ? 1 : 0;
    }

    /**
     * إيجاد الآية الحالية بناءً على الوقت
     * @param {number} currentTime - الوقت الحالي بالثواني
     * @param {Array} timings - مصفوفة التوقيتات (بترقيم المصحف بعد التوحيد)
     * @returns {number} رقم الآية زي ما هو في المصحف (0 = البسملة/الاستعاذة)
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

        // لسه في الاستعاذة/البسملة قبل ما أول آية تبدأ - ما نظللش حاجة،
        // عشان المكتوب ما يسبقش الصوت
        return 0;
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
