/**
 * Quran Service - الواجهة الموحدة لجميع خدمات القرآن
 * 
 * توحيد 4 ملفات API في واجهة واحدة:
 * - mp3quranAPI.js → AudioProvider
 * - quranAPI.js → TextProvider
 * - preciseTimingService.js → TimingProvider
 * - quranaiAPI.js → SearchProvider
 * 
 * الاستخدام:
 * import quranService from './services/QuranService';
 * 
 * const audioUrl = await quranService.getAudioUrl('mishary', 1);
 * const text = await quranService.getSurahText(1);
 * const timings = await quranService.getTimings(1, 'mishary');
 */

import { AudioProvider } from './providers/AudioProvider';
import { TextProvider } from './providers/TextProvider';
import { TimingProvider } from './providers/TimingProvider';
import { SearchProvider } from './providers/SearchProvider';

class QuranService {
    constructor() {
        // ملاحظة: الـ providers بادئتها _ عمداً.
        // لو اتسمّت this.search مثلاً، هتغطّي الميثود search() اللي تحت
        // وأي استدعاء لـ quranService.search() هيرمي TypeError.
        this._audio = new AudioProvider();
        this._text = new TextProvider();
        this._timing = new TimingProvider();
        this._search = new SearchProvider();

        // Cache مشترك للبيانات الثابتة
        this._surahCache = new Map();
        this._reciterCache = null;
    }

    // ═══════════════════════════════════════════════════════════════
    // Audio Methods
    // ═══════════════════════════════════════════════════════════════

    /**
     * الحصول على رابط الملف الصوتي
     * @param {string} reciterId - معرف القارئ (mishary, husary, etc.)
     * @param {number} surahNumber - رقم السورة (1-114)
     * @returns {Promise<string>} رابط الملف الصوتي
     */
    async getAudioUrl(reciterId, surahNumber) {
        return this._audio.getAudioUrl(reciterId, surahNumber);
    }

    /**
     * الحصول على قائمة القراء
     * @returns {Array} قائمة القراء
     */
    getReciters() {
        return this._audio.getReciters();
    }

    /**
     * الحصول على معلومات قارئ معين
     * @param {string} reciterId - معرف القارئ
     * @returns {Object} معلومات القارئ
     */
    getReciterById(reciterId) {
        return this._audio.getReciterById(reciterId);
    }

    // ═══════════════════════════════════════════════════════════════
    // Text Methods
    // ═══════════════════════════════════════════════════════════════

    /**
     * الحصول على نص السورة
     * @param {number} surahNumber - رقم السورة (1-114)
     * @returns {Promise<Object>} بيانات السورة مع الآيات
     */
    async getSurahText(surahNumber) {
        // تحقق من الـ cache
        if (this._surahCache.has(surahNumber)) {
            return this._surahCache.get(surahNumber);
        }

        const data = await this._text.getSurahText(surahNumber);
        if (data) {
            this._surahCache.set(surahNumber, data);
        }
        return data;
    }

    /**
     * الحصول على معلومات السورة
     * @param {number} surahNumber - رقم السورة (1-114)
     * @returns {Promise<Object>} معلومات السورة
     */
    async getSurahInfo(surahNumber) {
        return this._text.getSurahInfo(surahNumber);
    }

    // ═══════════════════════════════════════════════════════════════
    // Timing Methods
    // ═══════════════════════════════════════════════════════════════

    /**
     * الحصول على توقيتات الآيات
     * @param {number} surahNumber - رقم السورة (1-114)
     * @param {string} reciterId - معرف القارئ
     * @returns {Promise<Array>} مصفوفة التوقيتات
     */
    async getTimings(surahNumber, reciterId) {
        return this._timing.getTimings(surahNumber, reciterId);
    }

    /**
     * إيجاد الآية الحالية بناءً على الوقت
     * @param {number} currentTime - الوقت الحالي بالثواني
     * @param {Array} timings - مصفوفة التوقيتات
     * @returns {number} رقم الآية الحالية
     */
    findCurrentAyah(currentTime, timings) {
        return this._timing.findCurrentAyah(currentTime, timings);
    }

    // ═══════════════════════════════════════════════════════════════
    // Search Methods
    // ═══════════════════════════════════════════════════════════════

    /**
     * البحث في القرآن
     * @param {string} query - نص البحث
     * @param {string} language - لغة البحث (ar, en)
     * @returns {Promise<Array>} نتائج البحث
     */
    async search(query, language = 'ar') {
        return this._search.search(query, language);
    }

    /**
     * البحث الدلالي في القرآن
     * @param {string} query - نص البحث
     * @param {number} limit - عدد النتائج
     * @returns {Promise<Array>} نتائج البحث
     */
    async semanticSearch(query, limit = 10) {
        return this._search.semanticSearch(query, limit);
    }

    // ═══════════════════════════════════════════════════════════════
    // Cache Management
    // ═══════════════════════════════════════════════════════════════

    /**
     * مسح جميع الـ caches
     */
    clearAllCaches() {
        this._surahCache.clear();
        this._audio.clearCache();
        this._timing.clearCache();
        this._search.clearCache();
    }

    /**
     * الحصول على معلومات الـ caches
     * @returns {Object} معلومات الـ caches
     */
    getCacheInfo() {
        return {
            surahs: this._surahCache.size,
            audio: this._audio.getCacheInfo(),
            timing: this._timing.getCacheInfo(),
            search: this._search.getCacheInfo()
        };
    }
}

// تصدير instance واحد (Singleton)
const quranService = new QuranService();
export default quranService;

// تصدير الـ class للاستخدام المباشر إذا لزم الأمر
export { QuranService };
