# مصادر الملفات الصوتية - Audio Sources

## 📊 ملخص المصادر

التطبيق يستخدم **3 مصادر رئيسية** للملفات الصوتية:

| المصدر | الاستخدام | النوع | الدقة |
|--------|----------|------|------|
| **mp3quran.net** | التشغيل الرئيسي (سورة كاملة) | ملفات سور كاملة | عالية |
| **cdn.islamic.network** | التوقيتات الدقيقة (آية بآية) | ملفات آيات فردية | عالية جداً |
| **api.alquran.cloud** | API للحصول على روابط الملفات | API | - |

---

## 🎵 1. mp3quran.net (التشغيل الرئيسي)

### الوصف
موقع متخصص في تسجيلات القرآن الكريم عالية الجودة. يحتوي على **سورة كاملة** في ملف واحد.

### القراء المتاحون
```javascript
{
  "mishary": "https://server8.mp3quran.net/afs",      // مشاري العفاسي
  "abdulbasit": "https://server7.mp3quran.net/basit", // عبد الباسط
  "husary": "https://server11.mp3quran.net/husary",   // الحصري
  "sudais": "https://server11.mp3quran.net/sds",      // السديس
  "shuraim": "https://server6.mp3quran.net/shur"      // الشريم
}
```

### صيغة الرابط
```
https://server8.mp3quran.net/afs/001.mp3
                              ^^^  ^^^
                              |     |
                      مجلد القارئ  رقم السورة (3 أرقام)
```

### مثال عملي
```javascript
// السورة 1 (الفاتحة) - مشاري العفاسي
https://server8.mp3quran.net/afs/001.mp3

// السورة 2 (البقرة) - عبد الباسط
https://server7.mp3quran.net/basit/002.mp3
```

### الاستخدام في الكود
```javascript
// src/services/quranAPI.js
export const getAudioUrl = (reciterId, surahNumber) => {
  const reciter = recitersData.find(r => r.id === reciterId);
  const paddedNumber = String(surahNumber).padStart(3, '0');
  return `${reciter.baseUrl}/${paddedNumber}.mp3`;
};

// مثال الاستخدام
const url = getAudioUrl('mishary', 1);
// النتيجة: https://server8.mp3quran.net/afs/001.mp3
```

### المميزات
- ✅ ملفات عالية الجودة (128-192 kbps)
- ✅ تحميل سريع
- ✅ سورة كاملة في ملف واحد
- ✅ مجاني تماماً
- ⚠️ **لا يحتوي على توقيتات دقيقة للآيات**

---

## 🎯 2. cdn.islamic.network (التوقيتات الدقيقة)

### الوصف
شبكة توزيع محتوى (CDN) تحتوي على **ملفات منفصلة لكل آية**. هذا يسمح بحساب التوقيتات الدقيقة.

### صيغة الرابط
```
https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3
                                         ^^^  ^^^^^^^^^^^  ^
                                         |         |       |
                                      Bitrate  القارئ   رقم الآية
```

### مثال عملي
```javascript
// الآية 1 من الفاتحة - مشاري العفاسي
https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3

// الآية 2 من الفاتحة
https://cdn.islamic.network/quran/audio/128/ar.alafasy/2.mp3

// الآية 255 (آية الكرسي) من البقرة
https://cdn.islamic.network/quran/audio/128/ar.alafasy/255.mp3
```

### معرفات القراء
```javascript
{
  'mishary': 'ar.alafasy',
  'abdulbasit': 'ar.abdulbasit',
  'husary': 'ar.husary',
  'sudais': 'ar.sudais'
}
```

### الاستخدام في الكود
```javascript
// src/services/preciseTimingService.js
const response = await fetch(
  `https://api.alquran.cloud/v1/surah/${surahNumber}/${reciter}`
);
const ayahs = response.data.ayahs;

// كل آية لها رابط صوت منفصل
ayahs.forEach(ayah => {
  console.log(ayah.audio);
  // https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3
  // https://cdn.islamic.network/quran/audio/128/ar.alafasy/2.mp3
  // ...
});
```

### كيف نحسب التوقيتات الدقيقة؟
```javascript
// 1. نحمل ملف الصوت لكل آية
const audio = new Audio(ayah.audio);

// 2. ننتظر تحميل metadata
audio.addEventListener('loadedmetadata', () => {
  const duration = audio.duration; // مدة الآية بالثواني
  console.log(`Ayah ${ayahNumber}: ${duration}s`);
});

// 3. نبني جدول التوقيتات
let currentTime = 0;
const timings = [];

for (let ayah of ayahs) {
  const duration = await loadAudioDuration(ayah.audio);
  timings.push({
    ayah: ayah.numberInSurah,
    start: currentTime,
    end: currentTime + duration,
    duration: duration
  });
  currentTime += duration;
}
```

### المميزات
- ✅ **توقيتات دقيقة 100%** - كل آية لها ملف منفصل
- ✅ **مرتبط بالقارئ** - كل قارئ له توقيتات مختلفة
- ✅ جودة عالية (128 kbps)
- ✅ CDN سريع
- ⚠️ يحتاج تحميل عدة ملفات (بطيء قليلاً للسور الكبيرة)

---

## 🌐 3. api.alquran.cloud (API)

### الوصف
API مجاني يوفر بيانات القرآن الكريم مع روابط الملفات الصوتية.

### Endpoints المستخدمة

#### 1. Get Surah with Audio
```javascript
GET https://api.alquran.cloud/v1/surah/{surahNumber}/{reciter}

// مثال
GET https://api.alquran.cloud/v1/surah/1/ar.alafasy
```

**Response:**
```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "number": 1,
    "name": "سُورَةُ ٱلْفَاتِحَةِ",
    "englishName": "Al-Faatiha",
    "ayahs": [
      {
        "number": 1,
        "numberInSurah": 1,
        "text": "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
        "audio": "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3",
        "audioSecondary": ["https://cdn.islamic.network/quran/audio/64/ar.alafasy/1.mp3"]
      },
      {
        "number": 2,
        "numberInSurah": 2,
        "text": "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ",
        "audio": "https://cdn.islamic.network/quran/audio/128/ar.alafasy/2.mp3"
      }
    ]
  }
}
```

#### 2. Get Surah Text Only
```javascript
GET https://api.alquran.cloud/v1/surah/{surahNumber}

// مثال
GET https://api.alquran.cloud/v1/surah/1
```

### الاستخدام في الكود
```javascript
// src/services/preciseTimingService.js
export const loadPreciseTimings = async (surahNumber, reciter) => {
  // نجلب بيانات السورة مع روابط الصوت
  const response = await fetch(
    `https://api.alquran.cloud/v1/surah/${surahNumber}/${reciter}`
  );
  const data = await response.json();
  
  // نحصل على مصفوفة الآيات
  const ayahs = data.data.ayahs;
  
  // كل آية تحتوي على رابط الصوت الخاص بها
  for (let ayah of ayahs) {
    console.log(ayah.audio);
    // https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3
  }
};
```

---

## 🔄 كيف يعمل النظام الكامل؟

### 1. التشغيل العادي (PlayerBar)
```
المستخدم ← يضغط تشغيل
    ↓
quranAPI.js ← getAudioUrl(reciter, surahNumber)
    ↓
mp3quran.net ← https://server8.mp3quran.net/afs/001.mp3
    ↓
Howler.js ← تشغيل السورة كاملة
```

### 2. عرض النص مع التزامن (QuranTextViewer)
```
المستخدم ← يفتح عارض النص
    ↓
Step 1: getSurahData() ← api.alquran.cloud
    ↓ (يجلب نص الآيات)
    ↓
Step 2: loadPreciseTimings() ← api.alquran.cloud
    ↓ (يجلب روابط الملفات الصوتية)
    ↓
Step 3: loadAudioDuration() ← cdn.islamic.network
    ↓ (يحمل كل ملف صوت ويقرأ مدته)
    ↓
Step 4: بناء جدول التوقيتات
    [
      {ayah: 1, start: 0, end: 4.2, duration: 4.2},
      {ayah: 2, start: 4.2, end: 9.5, duration: 5.3},
      ...
    ]
    ↓
Step 5: getCurrentAyah(currentTime, timings)
    ↓
تمييز الآية الحالية
```

---

## ❓ لماذا 3 مصادر مختلفة؟

### mp3quran.net
- **الغرض**: تشغيل سريع للسورة كاملة
- **الميزة**: ملف واحد = تحميل سريع
- **العيب**: لا توقيتات دقيقة للآيات

### cdn.islamic.network
- **الغرض**: حساب توقيتات دقيقة آية بآية
- **الميزة**: كل آية ملف منفصل = توقيت دقيق 100%
- **العيب**: بطيء (يحتاج تحميل عدة ملفات)

### api.alquran.cloud
- **الغرض**: API موحد للوصول للبيانات
- **الميزة**: يعطينا روابط cdn.islamic.network
- **العيب**: -

---

## 🎯 الخلاصة

### للتشغيل العادي:
```javascript
✅ mp3quran.net - سورة كاملة في ملف واحد
```

### للتزامن الدقيق:
```javascript
✅ api.alquran.cloud - للحصول على روابط الآيات
✅ cdn.islamic.network - لتحميل ملفات الآيات الفردية
```

### الدقة:
- **mp3quran.net**: لا توقيتات دقيقة ⚠️
- **cdn.islamic.network**: توقيتات دقيقة 100% ✅
- **كل قارئ له توقيتات مختلفة** لأن طريقة القراءة تختلف 🎤

---

## 📝 ملاحظات مهمة

1. **التوقيتات مرتبطة بالقارئ**:
   - مشاري العفاسي قد يقرأ آية في 5 ثوانٍ
   - عبد الباسط قد يقرأها في 7 ثوانٍ
   - لذلك كل قارئ له ملفات صوت منفصلة

2. **Cache التوقيتات**:
   - بعد تحميل التوقيتات مرة واحدة، نحفظها في Cache
   - هذا يجعل الفتحات التالية فورية

3. **Fallback للتقدير**:
   - إذا فشل تحميل التوقيتات الدقيقة
   - نستخدم توقيتات تقديرية ذكية بناءً على مدة السورة

4. **الجودة**:
   - mp3quran.net: 128-192 kbps
   - cdn.islamic.network: 128 kbps
   - كلاهما جودة عالية ومناسبة

---

## 🔗 الروابط

- **mp3quran.net**: https://mp3quran.net
- **AlQuran Cloud API**: https://alquran.cloud/api
- **Islamic Network**: https://islamic.network
- **Qurani.ai**: https://qurani.ai/en/docs

---

**آخر تحديث**: 2025-10-19
