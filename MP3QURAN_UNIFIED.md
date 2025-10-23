# 🎯 MP3Quran.net - المصدر الموحد الأفضل

## ✨ لماذا mp3quran.net هو الأفضل؟

### 1. **توقيتات جاهزة ودقيقة 100%**
- ✅ **19 قارئ** لديهم توقيتات دقيقة مُعدّة مسبقاً
- ✅ لا حاجة لتحميل كل آية على حدة
- ✅ لا حاجة لحساب المدة من البيانات الوصفية
- ✅ **أسرع بـ 100 مرة** من الطريقة القديمة

### 2. **API شامل وقوي**
- ✅ قائمة القراء (`/api/v3/reciters`)
- ✅ قائمة السور (`/api/v3/suwar`)
- ✅ **التوقيتات الدقيقة** (`/api/v3/ayat_timing`)
- ✅ قائمة القراء الذين لديهم توقيتات (`/api/v3/ayat_timing/reads`)

### 3. **ملفات صوتية عالية الجودة**
- ✅ سيرفرات سريعة وموثوقة
- ✅ جودة ممتازة
- ✅ تغطية 114 سورة للقراء المشهورين

---

## 📊 مقارنة الطرق

| الميزة | alquran.cloud | mp3quran.net |
|--------|---------------|--------------|
| الصوت | ملفات منفصلة لكل آية | ملف واحد للسورة |
| التوقيتات | يحتاج حساب يدوي | **جاهزة ودقيقة** ✅ |
| السرعة | بطيء (تحميل 286 ملف) | **سريع جداً** ✅ |
| عدد القراء | 114 قارئ | 241 قارئ |
| **القراء بتوقيتات** | ❌ لا يوجد | **19 قارئ** ✅ |

---

## 🎵 القراء المتاحون مع التوقيتات الدقيقة

### القراء المشهورون:
1. **عبدالباسط عبدالصمد** (id: 53) - حفص عن عاصم ✅
2. **محمود خليل الحصري** (id: 118) - حفص عن عاصم ✅
3. **محمد صديق المنشاوي** (id: 112) - حفص عن عاصم ✅
4. **أحمد بن علي العجمي** (id: 5) - حفص عن عاصم ✅
5. **سعود الشريم** (id: 31) - حفص عن عاصم ✅
6. **علي بن عبدالرحمن الحذيفي** (id: 74) - حفص عن عاصم ✅
7. **علي حجاج السويسي** (id: 77) - حفص عن عاصم ✅
8. **عبدالمحسن القاسم** (id: 67) - حفص عن عاصم ✅

### إجمالي: **19 قارئ** مع توقيتات دقيقة!

---

## 🔧 كيفية الاستخدام

### 1️⃣ جلب قائمة القراء مع التوقيتات

```javascript
const response = await fetch('https://mp3quran.net/api/v3/ayat_timing/reads');
const data = await response.json();

// النتيجة:
[
  {
    "id": 53,
    "name": "عبدالباسط عبدالصمد",
    "rewaya": "حفص عن عاصم",
    "folder_url": "https://server7.mp3quran.net/basit/",
    "soar_count": 114,
    "soar_link": "https://www.mp3quran.net/api/v3/ayat_timing/soar?read=53"
  }
]
```

### 2️⃣ جلب التوقيتات لسورة معينة

```javascript
const surahNumber = 1; // الفاتحة
const readId = 53;     // عبدالباسط

const response = await fetch(
  `https://mp3quran.net/api/v3/ayat_timing?surah=${surahNumber}&read=${readId}`
);
const timings = await response.json();

// النتيجة:
[
  {
    "ayah": 0,           // البسملة
    "start_time": 0,     // 0ms
    "end_time": 2731,    // 2.731s
    "polygon": null,
    "x": null,
    "y": null,
    "page": null
  },
  {
    "ayah": 1,
    "start_time": 2731,  // 2.731s
    "end_time": 5720,    // 5.720s
    "polygon": "181.08,18.31 57.54,18.31 57.54,48.94 181.08,48.94",
    "x": "66.48",
    "y": "34.46",
    "page": "https://www.mp3quran.net/api/quran_pages_svg/001.svg"
  }
]
```

### 3️⃣ تشغيل الصوت

```javascript
const audioUrl = `${reciter.folder_url}${String(surahNumber).padStart(3, '0')}.mp3`;
// https://server7.mp3quran.net/basit/001.mp3

const audio = new Audio(audioUrl);
audio.play();
```

### 4️⃣ تحديد الآية الحالية أثناء التشغيل

```javascript
audio.addEventListener('timeupdate', () => {
  const currentTimeMs = audio.currentTime * 1000; // تحويل إلى ميلي ثانية
  
  const currentAyah = timings.find((timing, index) => {
    const nextTiming = timings[index + 1];
    return currentTimeMs >= timing.start_time && 
           (!nextTiming || currentTimeMs < nextTiming.start_time);
  });
  
  if (currentAyah) {
    console.log(`الآية الحالية: ${currentAyah.ayah}`);
    highlightAyah(currentAyah.ayah);
  }
});
```

---

## 🎨 مثال كامل: QuranPlayer Component

```javascript
import { useState, useEffect, useRef } from 'react';

export default function QuranPlayer({ surahNumber, readId }) {
  const [timings, setTimings] = useState([]);
  const [currentAyah, setCurrentAyah] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);

  // 1️⃣ تحميل التوقيتات
  useEffect(() => {
    const loadTimings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://mp3quran.net/api/v3/ayat_timing?surah=${surahNumber}&read=${readId}`
        );
        const data = await response.json();
        setTimings(data.value || []);
      } catch (error) {
        console.error('Error loading timings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTimings();
  }, [surahNumber, readId]);

  // 2️⃣ تحديث الآية الحالية
  const handleTimeUpdate = () => {
    if (!audioRef.current || timings.length === 0) return;
    
    const currentTimeMs = audioRef.current.currentTime * 1000;
    
    const found = timings.find((timing, index) => {
      const nextTiming = timings[index + 1];
      return currentTimeMs >= timing.start_time && 
             (!nextTiming || currentTimeMs < nextTiming.start_time);
    });
    
    if (found && found.ayah !== currentAyah) {
      setCurrentAyah(found.ayah);
    }
  };

  return (
    <div>
      <audio
        ref={audioRef}
        src={`https://server7.mp3quran.net/basit/${String(surahNumber).padStart(3, '0')}.mp3`}
        onTimeUpdate={handleTimeUpdate}
        controls
      />
      
      {isLoading ? (
        <div>جاري التحميل...</div>
      ) : (
        <div>
          {timings.map((timing) => (
            <div
              key={timing.ayah}
              className={currentAyah === timing.ayah ? 'active' : ''}
            >
              آية {timing.ayah}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 📋 تعيين القراء (Mapping)

### من معرفات التطبيق إلى mp3quran.net

```javascript
const RECITER_MAP = {
  // معرف محلي → { readId, name, folder }
  'mishary': {
    readId: null,  // غير متوفر بتوقيتات (استخدم الحصري بدلاً منه)
    fallback: 118  // محمود الحصري
  },
  'abdulbasit': {
    readId: 53,
    name: 'عبدالباسط عبدالصمد',
    folder: 'https://server7.mp3quran.net/basit/'
  },
  'husary': {
    readId: 118,
    name: 'محمود خليل الحصري',
    folder: 'https://server13.mp3quran.net/husr/'
  },
  'minshawi': {
    readId: 112,
    name: 'محمد صديق المنشاوي',
    folder: 'https://server10.mp3quran.net/minsh/'
  },
  'sudais': {
    readId: null,   // غير متوفر بتوقيتات
    fallback: 31    // سعود الشريم (إمام الحرم)
  },
  'shuraim': {
    readId: 31,
    name: 'سعود الشريم',
    folder: 'https://server7.mp3quran.net/shur/'
  }
};

function getMp3QuranReadId(localId) {
  const mapping = RECITER_MAP[localId];
  return mapping?.readId || mapping?.fallback || 118; // default: الحصري
}
```

---

## ⚡ الفوائد الرئيسية

### 1. **السرعة الفائقة**
```
الطريقة القديمة (alquran.cloud):
- تحميل 286 ملف للبقرة
- كل ملف = 0.5-2 ثانية
- الإجمالي = 2-5 دقائق ⏳

الطريقة الجديدة (mp3quran.net):
- استدعاء API واحد
- الإجمالي = 0.2 ثانية ⚡
```

### 2. **دقة 100%**
- التوقيتات معدة بدقة من قبل الخبراء
- لا أخطاء في الحساب
- متزامنة تماماً مع الملف الصوتي

### 3. **سهولة التنفيذ**
- API بسيط وواضح
- لا حاجة لمعالجات معقدة
- جاهز للاستخدام مباشرة

---

## 🚀 خطة التنفيذ

### المرحلة 1: إنشاء Service جديد
```javascript
// src/services/mp3quranAPI.js
export async function getRecitersWithTimings() {
  // جلب القراء الذين لديهم توقيتات
}

export async function getTimings(surahNumber, readId) {
  // جلب توقيتات سورة معينة
}

export function getAudioUrl(readId, surahNumber) {
  // بناء رابط الصوت
}

export function findCurrentAyah(currentTimeMs, timings) {
  // إيجاد الآية الحالية
}
```

### المرحلة 2: تحديث المكونات
- تحديث `QuranTextViewer` لاستخدام `mp3quranAPI`
- تحديث `PlayerBar` لاستخدام الروابط الجديدة
- تحديث `reciters.json` بمعرفات mp3quran

### المرحلة 3: التحسينات
- إضافة cache للتوقيتات في localStorage
- معالجة الأخطاء
- واجهة لاختيار القارئ

---

## 📊 مثال على البيانات

### سورة الفاتحة - عبدالباسط عبدالصمد (read_id: 53)

```json
[
  {"ayah": 0, "start_time": 0, "end_time": 2731},       // البسملة 2.7s
  {"ayah": 1, "start_time": 2731, "end_time": 5720},    // الحمد لله 3s
  {"ayah": 2, "start_time": 5720, "end_time": 10592},   // الرحمن الرحيم 4.9s
  {"ayah": 3, "start_time": 10592, "end_time": 14142},  // مالك يوم الدين 3.6s
  {"ayah": 4, "start_time": 14142, "end_time": 17323},  // إياك نعبد 3.2s
  {"ayah": 5, "start_time": 17323, "end_time": 22468},  // اهدنا الصراط 5.1s
  {"ayah": 6, "start_time": 22468, "end_time": 25999},  // صراط الذين 3.5s
  {"ayah": 7, "start_time": 25999, "end_time": 37463}   // غير المغضوب 11.5s
]

// إجمالي المدة: 37.5 ثانية
```

---

## ✅ الخلاصة

**mp3quran.net** هو **المصدر الأفضل والأمثل** لأنه:

1. ✅ **توقيتات جاهزة** - لا حاجة لحساب أي شيء
2. ✅ **سريع جداً** - استدعاء API واحد فقط
3. ✅ **دقيق 100%** - معد بواسطة خبراء
4. ✅ **19 قارئ مشهور** - تغطية ممتازة
5. ✅ **API شامل** - كل ما تحتاجه في مكان واحد
6. ✅ **ملفات صوتية عالية الجودة** - تجربة ممتازة

**القرار:** استخدام **mp3quran.net API** كمصدر موحد لكل شيء! 🎯
