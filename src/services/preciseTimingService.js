/**
 * Precise Verse Timing Service
 * 
 * يحسب التوقيتات الدقيقة لكل آية بناءً على مدة ملفات الصوت الفعلية
 * كل قارئ له توقيتات مختلفة لأن طريقة القراءة تختلف
 */

// Cache للتوقيتات لتجنب إعادة التحميل
const timingCache = new Map();

/**
 * تحميل مدة ملف صوتي
 * @param {string} audioUrl - رابط ملف الصوت
 * @returns {Promise<number>} مدة الملف بالثواني
 */
const loadAudioDuration = (audioUrl) => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration);
    });
    
    audio.addEventListener('error', () => {
      reject(new Error(`Failed to load audio: ${audioUrl}`));
    });
    
    audio.src = audioUrl;
  });
};

/**
 * تحميل التوقيتات الدقيقة لسورة كاملة من ملفات الصوت الفردية
 * @param {number} surahNumber - رقم السورة (1-114)
 * @param {string} reciter - معرف القارئ
 * @param {number} verseCount - عدد الآيات في السورة
 * @returns {Promise<Array>} مصفوفة التوقيتات
 */
export const loadPreciseTimings = async (surahNumber, reciter, verseCount) => {
  // Check cache first
  const cacheKey = `${reciter}-${surahNumber}`;
  if (timingCache.has(cacheKey)) {
    console.log(`✅ Using cached timings for ${cacheKey}`);
    return timingCache.get(cacheKey);
  }

  console.log(`\n🎯 Loading PRECISE timings for Surah ${surahNumber} with reciter: ${reciter}`);
  console.log(`📊 Total verses to load: ${verseCount}`);
  
  try {
    const timings = [];
    let currentTime = 0;
    
    // جلب بيانات السورة من API للحصول على روابط الصوت
    const response = await fetch(
      `https://api.alquran.cloud/v1/surah/${surahNumber}/${reciter}`
    );
    const data = await response.json();
    
    if (!data.data || !data.data.ayahs) {
      throw new Error('Failed to fetch surah data');
    }
    
    const ayahs = data.data.ayahs;
    console.log(`📖 Fetched ${ayahs.length} ayahs from API`);
    
    // تحميل مدة كل آية من ملف الصوت الخاص بها
    for (let i = 0; i < ayahs.length; i++) {
      const ayah = ayahs[i];
      const audioUrl = ayah.audio;
      
      try {
        const duration = await loadAudioDuration(audioUrl);
        
        timings.push({
          ayah: i + 1,
          start: currentTime,
          end: currentTime + duration,
          duration: duration,
          audioUrl: audioUrl
        });
        
        currentTime += duration;
        
        // Log progress every 10 verses
        if ((i + 1) % 10 === 0 || i === ayahs.length - 1) {
          console.log(`⏱️  Loaded ${i + 1}/${ayahs.length} verses (${Math.round((i + 1) / ayahs.length * 100)}%)`);
        }
      } catch (error) {
        console.warn(`⚠️  Failed to load ayah ${i + 1}, using average duration`);
        // استخدام متوسط مدة الآيات السابقة كـ fallback
        const avgDuration = currentTime / Math.max(i, 1);
        const fallbackDuration = avgDuration || 5; // 5 seconds default
        
        timings.push({
          ayah: i + 1,
          start: currentTime,
          end: currentTime + fallbackDuration,
          duration: fallbackDuration,
          audioUrl: audioUrl,
          estimated: true
        });
        
        currentTime += fallbackDuration;
      }
    }
    
    console.log(`✅ Successfully loaded ${timings.length} precise timings`);
    console.log(`⏱️  Total duration: ${Math.round(currentTime / 60)} minutes ${Math.round(currentTime % 60)} seconds`);
    console.log(`📊 Sample timings:`, timings.slice(0, 3));
    
    // حفظ في Cache
    timingCache.set(cacheKey, timings);
    
    return timings;
  } catch (error) {
    console.error('❌ Error loading precise timings:', error);
    throw error;
  }
};

/**
 * إيجاد الآية الحالية بناءً على الوقت
 * @param {number} currentTime - الوقت الحالي بالثواني
 * @param {Array} timings - مصفوفة التوقيتات
 * @returns {number} رقم الآية الحالية
 */
export const getCurrentAyah = (currentTime, timings) => {
  if (!timings || timings.length === 0) return 0;
  
  for (let i = 0; i < timings.length; i++) {
    const timing = timings[i];
    if (currentTime >= timing.start && currentTime < timing.end) {
      return timing.ayah;
    }
  }
  
  // إذا انتهى الوقت، إرجاع آخر آية
  return timings[timings.length - 1].ayah;
};

/**
 * مسح Cache التوقيتات
 */
export const clearTimingCache = () => {
  timingCache.clear();
  console.log('🗑️  Timing cache cleared');
};

/**
 * الحصول على معلومات Cache
 */
export const getCacheInfo = () => {
  return {
    size: timingCache.size,
    keys: Array.from(timingCache.keys())
  };
};

export default {
  loadPreciseTimings,
  getCurrentAyah,
  clearTimingCache,
  getCacheInfo
};
