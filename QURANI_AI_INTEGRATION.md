# 🌟 Qurani.ai Integration

## ✨ المميزات الجديدة

تم إضافة تكامل كامل مع **Qurani.ai API** (https://qurani.ai) للحصول على ميزات متقدمة:

---

## 1. 🔎 البحث الذكي (Semantic Search)

### ما هو؟
البحث الذكي يستخدم الذكاء الاصطناعي للبحث في القرآن الكريم **بالمعنى وليس بالكلمات الدقيقة**.

### المميزات:
- ✅ البحث بالمعاني والمفاهيم
- ✅ نتائج دقيقة حتى بدون استخدام نفس الكلمات
- ✅ دعم العربية والإنجليزية
- ✅ عرض الآيات مع رقم السورة والآية
- ✅ إمكانية تشغيل السورة مباشرة
- ✅ نسبة الدقة لكل نتيجة

### أمثلة للبحث:
```
"الصبر والشكر"
"الرحمة والمغفرة"
"الجنة والنار"
"التوحيد"
"الصلاة"
```

### كيفية الاستخدام:
1. افتح صفحة **"بحث ذكي"** من القائمة الجانبية
2. اكتب ما تريد البحث عنه (موضوع أو مفهوم)
3. اضغط Enter أو زر "بحث"
4. ستظهر النتائج مع إمكانية تشغيل السورة

---

## 2. 🎵 توقيتات دقيقة للآيات

### ما هو؟
نظام متقدم للحصول على توقيتات دقيقة لكل آية في السورة مع الصوت.

### المميزات:
- ✅ توقيتات دقيقة لكل آية (word-by-word timing)
- ✅ دعم جميع القراء الخمسة
- ✅ تزامن 100% مع الصوت
- ✅ لا حاجة للتخمين أو التقدير

### القراء المدعومون:
1. **مشاري راشد العفاسي** (ar.alafasy)
2. **عبد الباسط عبد الصمد** (ar.abdulbasit)
3. **محمود خليل الحصري** (ar.husary)
4. **محمد صديق المنشاوي** (ar.minshawi)
5. **عبد الرحمن السديس** (ar.sudais)

---

## 3. 📖 خدمة API الشاملة

### الملف: `src/services/quranaiAPI.js`

### الوظائف المتاحة:

#### 1. **getSurahData(surahNumber, edition)**
```javascript
const surahData = await getSurahData(1, 'quran-simple');
// Returns: { ayahs: [...], name: "...", ... }
```

#### 2. **getAyahData(surahNumber, ayahNumber, edition)**
```javascript
const ayahData = await getAyahData(1, 1, 'quran-simple');
// Returns: { text: "...", audio: "...", ... }
```

#### 3. **getSurahTiming(surahNumber, reciter)**
```javascript
const timing = await getSurahTiming(1, 'ar.alafasy');
// Returns: { ayahs: [{ start: 0, end: 5.2 }, ...] }
```

#### 4. **semanticSearchQuran(query, limit)**
```javascript
const results = await semanticSearchQuran('الصبر', 10);
// Returns: [{ surah: 2, ayah: 45, text: "...", score: 0.95 }, ...]
```

#### 5. **getAyahTranslation(surahNumber, ayahNumber, language)**
```javascript
const translation = await getAyahTranslation(1, 1, 'en');
// Returns: { text: "In the name of Allah...", ... }
```

#### 6. **searchQuran(query, edition)**
```javascript
const results = await searchQuran('الحمد لله');
// Returns: [{ surah: 1, ayah: 2, text: "..." }, ...]
```

---

## 🎯 الاستخدام في المشروع

### 1. البحث الذكي
```jsx
import { semanticSearchQuran } from '../services/quranaiAPI';

const results = await semanticSearchQuran('الصبر والشكر', 20);
```

### 2. الحصول على التوقيتات
```jsx
import { getSurahTiming } from '../services/quranaiAPI';

const timing = await getSurahTiming(18, 'ar.alafasy'); // سورة الكهف
```

### 3. الحصول على الترجمة
```jsx
import { getAyahTranslation } from '../services/quranaiAPI';

const translation = await getAyahTranslation(1, 1, 'en');
```

---

## 🔧 البنية التقنية

### Base URLs:
```javascript
const QURANAI_BASE_URL = 'https://api.qurani.ai/v1';
const SEMANTIC_SEARCH_URL = 'https://api.qurani.ai';
```

### Request Format:
```javascript
// Example: Get Surah
GET https://api.qurani.ai/v1/surah/{surahNumber}/{edition}

// Example: Semantic Search
POST https://api.qurani.ai/semantic/quran
Body: { query: "الصبر", limit: 10 }
```

### Response Format:
```javascript
{
  "data": {
    "surah": 2,
    "ayah": 45,
    "text": "...",
    "translation": "...",
    "audio": "...",
    "timing": { start: 0, end: 5.2 }
  }
}
```

---

## 📊 المميزات القادمة

### سيتم إضافتها قريباً:
1. ⏳ **عارض النص مع التزامن الدقيق**
   - عرض النص القرآني مع تمييز الآية الجارية
   - استخدام التوقيتات الدقيقة من Qurani.ai
   - Auto-scroll للآية الحالية

2. ⏳ **الترجمات المتعددة**
   - عرض الترجمة مع النص العربي
   - دعم 5+ لغات (English, Urdu, French, etc.)
   - تبديل اللغة من الإعدادات

3. ⏳ **البحث المتقدم**
   - فلترة حسب السورة المكية/المدنية
   - فلترة حسب الجزء
   - فلترة حسب الموضوع

---

## 🚀 كيفية الاختبار

### 1. البحث الذكي:
```bash
1. شغّل التطبيق: npm run dev
2. افتح: http://localhost:5175
3. اذهب إلى "بحث ذكي" من القائمة
4. ابحث عن: "الصبر والشكر"
5. تفحص النتائج ✨
```

### 2. التوقيتات الدقيقة:
```bash
1. شغّل سورة من المكتبة
2. افتح Console (F12)
3. ستظهر logs عن تحميل التوقيتات
4. تفحص دقة التزامن
```

---

## 📚 المصادر

- **Qurani.ai Docs**: https://qurani.ai/en/docs
- **API Reference**: https://qurani.ai/en/docs/1-general-apis
- **Semantic Search**: https://qurani.ai/en/docs/2-advanced-tools/semantic-search-api

---

## ✨ الخلاصة

تم إضافة تكامل كامل مع **Qurani.ai API** الذي يوفر:

✅ **البحث الذكي بالمعنى** - جاهز 100%
✅ **خدمة API شاملة** - جاهز 100%
⏳ **توقيتات دقيقة** - قيد التطوير
⏳ **عارض النص مع التزامن** - قيد التطوير
⏳ **الترجمات** - قيد التطوير

**جميع المصادر من Qurani.ai فقط!** 🎯
