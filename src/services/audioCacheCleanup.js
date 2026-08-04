/**
 * مسح كاش الصوت القديم
 *
 * النسخ القديمة من التطبيق كانت بتخزّن ملفات التلاوة بـ CacheFirst في
 * كاش اسمه quran-audio-cache. الإعداد ده اتشال من vite.config.js، لكن
 * شيله مابيمسحش اللي اتخزّن خلاص على أجهزة الناس - والـ service worker
 * القديم ممكن يكون خزّن ردود ناقصة أو باظت، وبعدها التلاوة ماتشتغلش
 * على الجهاز ده وبس، وتفضل كده لأن CacheFirst مابيراجعش المصدر تاني.
 *
 * فبنمسحه من التطبيق نفسه أول ما يفتح. المسح آمن: ده كاش لملفات عامة
 * بتتجاب من النت تاني لوحدها.
 */

const LEGACY_AUDIO_CACHE = 'quran-audio-cache';

/**
 * @returns {Promise<boolean>} true لو كان موجود واتمسح
 */
export async function dropLegacyAudioCache() {
  if (typeof caches === 'undefined') return false;

  try {
    return await caches.delete(LEGACY_AUDIO_CACHE);
  } catch (error) {
    // المتصفح ممكن يمنع الوصول للكاش (وضع التصفح الخفي مثلاً)
    console.warn('Could not drop the legacy audio cache:', error);
    return false;
  }
}

export default dropLegacyAudioCache;
