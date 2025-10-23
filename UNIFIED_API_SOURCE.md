# 🎯 Unified API Source - مصدر موحد للكل شيء

## نظرة عامة

تم توحيد كل شيء ليستخدم **api.alquran.cloud فقط**:
- ✅ النصوص القرآنية
- ✅ الملفات الصوتية
- ✅ التوقيتات الدقيقة
- ✅ معلومات القراء

---

## 🌐 المصدر الوحيد: api.alquran.cloud

### 1️⃣ الحصول على السورة مع الصوت

```javascript
import { getSurahWithAudio } from './services/quranAPI';

// جلب السورة كاملة (نص + صوت)
const data = await getSurahWithAudio(1, 'mishary'); // الفاتحة

// الاستجابة:
{
  number: 1,
  name: "سُورَةُ ٱلْفَاتِحَةِ",
  englishName: "Al-Faatiha",
  numberOfAyahs: 7,
  ayahs: [
    {
      number: 1,              // الرقم العام للآية
      numberInSurah: 1,       // رقم الآية في السورة
      text: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
      audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3"
    },
    // ... باقي الآيات
  ]
}
```

### 2️⃣ تحميل التوقيتات الدقيقة

```javascript
// لكل آية ملف صوتي منفصل
const timings = [];
let totalTime = 0;

for (const ayah of data.ayahs) {
  // تحميل ملف الصوت
  const audio = new Audio(ayah.audio);
  
  // انتظار تحميل البيانات الوصفية
  await new Promise(resolve => {
    audio.addEventListener('loadedmetadata', () => {
      const duration = audio.duration;
      
      timings.push({
        ayah: ayah.numberInSurah,
        startTime: totalTime,
        endTime: totalTime + duration,
        duration: duration
      });
      
      totalTime += duration;
      resolve();
    });
  });
}

// النتيجة: توقيتات دقيقة 100% لكل آية
console.log(timings);
// [
//   { ayah: 1, startTime: 0, endTime: 4.2, duration: 4.2 },
//   { ayah: 2, startTime: 4.2, endTime: 8.5, duration: 4.3 },
//   ...
// ]
```

---

## 🎵 تشغيل الصوت

### خيار 1: تشغيل كل آية على حدة (دقيق جداً)

```javascript
// تشغيل الآيات واحدة تلو الأخرى
for (const ayah of data.ayahs) {
  await playAudio(ayah.audio);
}

function playAudio(url) {
  return new Promise(resolve => {
    const audio = new Audio(url);
    audio.onended = resolve;
    audio.play();
  });
}
```

**مزايا:**
- ✅ تزامن دقيق 100% (كل آية لها وقت محدد)
- ✅ سهولة التحكم (إيقاف/تشغيل/تخطي)

**عيوب:**
- ❌ قد يكون هناك فجوة صغيرة بين الآيات
- ❌ يحتاج معالجة خاصة للانتقال السلس

### خيار 2: استخدام Howler.js مع قائمة تشغيل

```javascript
import { Howl } from 'howler';

// إنشاء قائمة بكل روابط الصوت
const audioUrls = data.ayahs.map(ayah => ayah.audio);

// تشغيل متسلسل
const howl = new Howl({
  src: audioUrls,
  format: ['mp3'],
  html5: true,
  onplay: () => console.log('Playing'),
  onend: () => console.log('Ended')
});

howl.play();
```

---

## 🔄 تعيين القراء

### تحويل المعرفات

```javascript
const RECITER_MAP = {
  'mishary': 'ar.alafasy',      // مشاري العفاسي
  'abdulbasit': 'ar.abdulbasit', // عبدالباسط
  'husary': 'ar.husary',         // الحصري
  'sudais': 'ar.sudais',         // السديس
  'shuraim': 'ar.shaatree'       // الشاطري
};

function getReciterAlquranId(localId) {
  return RECITER_MAP[localId] || 'ar.alafasy';
}

// الاستخدام
const reciterId = getReciterAlquranId('mishary'); // 'ar.alafasy'
const data = await getSurahWithAudio(1, reciterId);
```

---

## 📊 مثال كامل: QuranTextViewer

```javascript
import { useState, useEffect } from 'react';
import { getSurahWithAudio } from './services/quranAPI';

export default function QuranTextViewer({ surahNumber, reciter }) {
  const [ayahs, setAyahs] = useState([]);
  const [timings, setTimings] = useState([]);
  const [currentAyah, setCurrentAyah] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSurah();
  }, [surahNumber, reciter]);

  const loadSurah = async () => {
    setIsLoading(true);
    
    // 1️⃣ جلب البيانات من API
    const data = await getSurahWithAudio(surahNumber, reciter);
    setAyahs(data.ayahs);
    
    // 2️⃣ حساب التوقيتات
    const timings = [];
    let totalTime = 0;
    
    for (const ayah of data.ayahs) {
      const duration = await loadAudioDuration(ayah.audio);
      
      timings.push({
        ayah: ayah.numberInSurah,
        startTime: totalTime,
        endTime: totalTime + duration,
        duration
      });
      
      totalTime += duration;
    }
    
    setTimings(timings);
    setIsLoading(false);
  };

  const loadAudioDuration = (url) => {
    return new Promise(resolve => {
      const audio = new Audio(url);
      audio.addEventListener('loadedmetadata', () => {
        resolve(audio.duration);
      });
    });
  };

  // 3️⃣ تحديث الآية الحالية
  useEffect(() => {
    const found = timings.find((t, i) => {
      const next = timings[i + 1];
      return currentTime >= t.startTime && (!next || currentTime < next.startTime);
    });
    
    if (found) {
      setCurrentAyah(found.ayah);
    }
  }, [currentTime, timings]);

  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        ayahs.map(ayah => (
          <div
            key={ayah.number}
            className={currentAyah === ayah.numberInSurah ? 'active' : ''}
          >
            <span>{ayah.numberInSurah}</span>
            <p>{ayah.text}</p>
          </div>
        ))
      )}
    </div>
  );
}
```

---

## 🎯 الفوائد

### 1. **مصدر واحد موثوق**
- ✅ لا حاجة للتبديل بين عدة APIs
- ✅ سهولة الصيانة
- ✅ استقرار أفضل

### 2. **توقيتات دقيقة 100%**
- ✅ كل آية لها ملف صوتي خاص
- ✅ كل قارئ له توقيتات مختلفة
- ✅ لا توجد تقديرات أو حسابات تقريبية

### 3. **أداء محسّن**
- ✅ تحميل بالطلب (lazy loading)
- ✅ إمكانية التخزين المؤقت
- ✅ استخدام HTML5 Audio API

---

## 📝 الملفات المعدّلة

### 1. `src/services/quranAPI.js`
```javascript
// الوظائف الجديدة:
- getAudioUrl() → async, يرجع بيانات من API
- getSurahWithAudio() → جلب السورة مع الصوت
- getReciterAlquranId() → تحويل معرفات القراء
- getSurahText() → النص فقط
- getSurahInfo() → المعلومات فقط
```

### 2. `src/services/audioPlayer.js`
```javascript
// الوظائف الجديدة:
- playFromAPI(audioData) → تشغيل من بيانات API
- play(url) → الطريقة القديمة (backward compatible)
```

### 3. `src/components/Player/QuranTextViewerAPI.jsx`
```javascript
// مكون جديد يستخدم API فقط
- تحميل النصوص والصوت من api.alquran.cloud
- حساب التوقيتات من البيانات الوصفية للصوت
- عرض شريط التقدم أثناء التحميل
- تمييز الآية الحالية تلقائياً
```

---

## 🚀 الخطوات التالية

### 1. **تحسين الأداء**
- [ ] تخزين التوقيتات في localStorage
- [ ] تحميل متوازي للآيات (parallel loading)
- [ ] ضغط البيانات المخزنة
- [ ] Service Worker للتخزين المؤقت

### 2. **تحسين التجربة**
- [ ] شريط تقدم مفصل (آية 1/7...)
- [ ] إمكانية إلغاء التحميل
- [ ] إعادة المحاولة عند الفشل
- [ ] عرض الوقت المتبقي

### 3. **ميزات إضافية**
- [ ] تحميل السورة للاستماع دون إنترنت
- [ ] اختيار جودة الصوت (64/128/192 kbps)
- [ ] الترجمة (إنجليزي، فرنسي، إلخ)
- [ ] التفسير

---

## 🎵 URLs المستخدمة

### API Endpoint
```
https://api.alquran.cloud/v1/surah/{surahNumber}/{reciter}
```

### مثال
```
https://api.alquran.cloud/v1/surah/1/ar.alafasy
```

### Audio Files (CDN)
```
https://cdn.islamic.network/quran/audio/128/{reciter}/{ayahNumber}.mp3
```

### مثال
```
https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3
```

---

## ✅ الخلاصة

الآن كل شيء يعمل من **api.alquran.cloud فقط**:

1. **النصوص**: `getSurahWithAudio()` أو `getSurahText()`
2. **الصوت**: روابط في كل آية من الاستجابة
3. **التوقيتات**: حساب من البيانات الوصفية للصوت
4. **القراء**: تحويل تلقائي للمعرفات

**النتيجة**: نظام موحد، مستقر، ودقيق 100% ✨
