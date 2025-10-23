# 🧪 اختبار Edge Cases - Pause/Resume

## 📋 قائمة الاختبارات

### ✅ Test 1: Pause/Resume عادي (تم!)
- [x] تشغيل سورة
- [x] انتظار 5 ثواني
- [x] Pause ⏸️
- [x] Play ▶️
- [x] **النتيجة**: يستأنف من نفس المكان ✅

---

## 🔄 Test 2: تغيير السورة أثناء Pause

### الخطوات:
1. شغّل **سورة الفاتحة** (1)
2. استمع 3-5 ثواني
3. اضغط **Pause ⏸️**
4. اختر **سورة البقرة** (2) من Library
5. شاهد Console

### ✅ النتيجة المتوقعة:
```javascript
🔍 PlayerBar Effect: {
  isPlaying: false,
  audioKey: "mishary-2",        // ← تغيرت السورة!
  currentAudioRef: "mishary-1", // ← القديمة
  hasHowl: true,
  howlPlaying: false
}
⏸️ Pausing audio at X.XXs
```

ثم عند الضغط Play:
```javascript
🔍 PlayerBar Effect: {
  isPlaying: true,
  audioKey: "mishary-2",        // ← مختلف!
  currentAudioRef: "mishary-1",
  hasHowl: true,
  howlPlaying: false
}
🆕 Different audio → Loading: mishary-2 (was: mishary-1)
🌐 Fetching reciters...
Audio loaded successfully
Audio playing
```

**المتوقع**: ✅ يحمّل السورة الجديدة من البداية

---

## 🎙️ Test 3: تغيير القارئ أثناء Pause

### الخطوات:
1. شغّل **سورة الفاتحة** مع **مشاري العفاسي**
2. استمع 3-5 ثواني
3. اضغط **Pause ⏸️**
4. افتح **Reciter Selector** (أيقونة الميكروفون)
5. اختر **عبدالباسط عبدالصمد**
6. اضغط **Play ▶️**
7. شاهد Console

### ✅ النتيجة المتوقعة:
```javascript
🔍 PlayerBar Effect: {
  isPlaying: true,
  audioKey: "abdulbasit-1",     // ← تغير القارئ!
  currentAudioRef: "mishary-1", // ← القديم
  hasHowl: true,
  howlPlaying: false
}
🆕 Different audio → Loading: abdulbasit-1 (was: mishary-1)
🌐 Fetching reciters...
Audio loaded successfully
Audio playing
```

**المتوقع**: ✅ يحمّل نفس السورة بصوت القارئ الجديد من البداية

---

## ⏩ Test 4: Seek (التقديم/التأخير) أثناء Pause

### الخطوات:
1. شغّل **سورة الفاتحة**
2. استمع 3 ثواني
3. اضغط **Pause ⏸️**
4. اضغط على **شريط التقدم** (Progress Bar) عند موضع مختلف (مثلاً 10 ثانية)
5. اضغط **Play ▶️**
6. شاهد Console

### ✅ النتيجة المتوقعة:
```javascript
🔍 PlayerBar Effect: {
  isPlaying: true,
  audioKey: "mishary-1",        // ← نفس السورة
  currentAudioRef: "mishary-1", // ← نفس السورة
  hasHowl: true,
  howlPlaying: false
}
✅ Same audio → Resuming from 10.00s  // ← من الموضع الجديد!
▶️ Resuming audio
Audio playing
```

**المتوقع**: ✅ يستأنف من الموضع الجديد (10 ثانية) بدون إعادة تحميل

---

## ⏭️ Test 5: Next/Previous أثناء التشغيل

### الخطوات A: Next أثناء التشغيل
1. شغّل **سورة الفاتحة**
2. استمع 2 ثانية
3. اضغط **Next ⏭️**
4. شاهد Console

### ✅ النتيجة المتوقعة:
```javascript
🔍 PlayerBar Effect: {
  isPlaying: true,
  audioKey: "mishary-2",        // ← السورة التالية!
  currentAudioRef: "mishary-1",
  hasHowl: true,
  howlPlaying: true
}
🆕 Different audio → Loading: mishary-2 (was: mishary-1)
🌐 Fetching reciters...
Audio loaded successfully
Audio playing
```

**المتوقع**: ✅ ينتقل للسورة التالية ويشغلها مباشرة

---

### الخطوات B: Previous أثناء Pause
1. شغّل **سورة البقرة**
2. اضغط **Pause ⏸️**
3. اضغط **Previous ⏮️**
4. شاهد Console

### ✅ النتيجة المتوقعة:
```javascript
🔍 PlayerBar Effect: {
  isPlaying: false,              // ← لا زال موقوف!
  audioKey: "mishary-1",
  currentAudioRef: "mishary-2",
  hasHowl: true,
  howlPlaying: false
}
⏸️ Pausing audio...
```

ثم عند Play:
```javascript
🆕 Different audio → Loading: mishary-1 (was: mishary-2)
```

**المتوقع**: ✅ يغير السورة لكن يبقى موقوف، عند Play يشغل السورة الجديدة

---

## 🔁 Test 6: Repeat Mode + Pause/Resume

### الخطوات:
1. شغّل **سورة الإخلاص** (112) - قصيرة
2. اضغط **Repeat 🔁** مرة واحدة → **Repeat All**
3. اضغط **Repeat 🔁** مرة ثانية → **Repeat One** (🔂)
4. انتظر حتى تنتهي السورة
5. السورة يجب أن **تعيد من البداية** تلقائياً
6. اضغط **Pause ⏸️** بعد 2 ثانية من الإعادة
7. اضغط **Play ▶️**

### ✅ النتيجة المتوقعة:
```javascript
// عند انتهاء السورة
Audio ended
🔁 Repeat One enabled, replaying surah
🆕 Different audio → Loading: mishary-112 (was: mishary-112)

// عند Pause ثم Play
✅ Same audio → Resuming from 2.XXs
```

**المتوقع**: ✅ يعيد السورة عند الانتهاء، Pause/Resume يعمل في الإعادة

---

## 📱 Test 7: QuranTextViewer + Pause/Resume

### الخطوات:
1. شغّل **سورة الفاتحة**
2. افتح **QuranTextViewer** (أيقونة الكتاب 📖)
3. شاهد الآيات تتزامن (الخلفية الخضراء)
4. عند الآية 3 أو 4 اضغط **Pause ⏸️**
5. شاهد Console
6. اضغط **Play ▶️**
7. تأكد أن:
   - ✅ التزامن يستمر من نفس الآية
   - ✅ لا يقفز للآية 1
   - ✅ الـ scroll لا يعود للأعلى

### ✅ النتيجة المتوقعة:
```javascript
// عند Pause
⏸️ Pausing audio at 8.50s
⏰ Time update: 8.50s, timings count: 7
🎯 Current ayah: 3  // ← الآية الحالية

// عند Play
✅ Same audio → Resuming from 8.50s
⏰ Time update: 8.50s, timings count: 7
⏰ Time update: 8.60s, timings count: 7
🎯 Current ayah: 3  // ← نفس الآية! ✅
⏰ Time update: 8.70s, timings count: 7
```

**المتوقع**: ✅ التزامن يستمر من نفس الآية بدون مشاكل

---

## 🎨 Test 8: Volume/Speed Change أثناء Pause

### الخطوات:
1. شغّل أي سورة
2. اضغط **Pause ⏸️**
3. غيّر **Volume** (مثلاً 50% → 80%)
4. غيّر **Playback Speed** في Settings (مثلاً 1x → 1.25x)
5. اضغط **Play ▶️**

### ✅ النتيجة المتوقعة:
```javascript
🔍 PlayerBar Effect: {
  isPlaying: true,
  audioKey: "mishary-1",
  currentAudioRef: "mishary-1",
  hasHowl: true,
  howlPlaying: false
}
✅ Same audio → Resuming from X.XXs
▶️ Resuming audio
Audio playing
```

**المتوقع**: 
- ✅ يستأنف من نفس المكان
- ✅ Volume الجديد يطبّق
- ✅ Speed الجديد يطبّق
- ✅ لا يعيد تحميل الصوت

---

## 📊 ملخص النتائج

| Test | الوصف | الحالة | ملاحظات |
|------|-------|--------|---------|
| 1 | Pause/Resume عادي | ✅ | يعمل بشكل صحيح |
| 2 | تغيير السورة أثناء Pause | ⏳ | يجب الاختبار |
| 3 | تغيير القارئ أثناء Pause | ⏳ | يجب الاختبار |
| 4 | Seek أثناء Pause | ⏳ | يجب الاختبار |
| 5 | Next/Previous | ⏳ | يجب الاختبار |
| 6 | Repeat Mode | ⏳ | يجب الاختبار |
| 7 | QuranTextViewer Sync | ⏳ | يجب الاختبار |
| 8 | Volume/Speed Change | ⏳ | يجب الاختبار |

---

## 🚀 ابدأ الاختبار!

**ابدأ بـ Test 2** (تغيير السورة أثناء Pause):
1. شغّل الفاتحة
2. Pause
3. اختر البقرة
4. Play
5. **انسخ لي Console output كامل!**

بعد كل اختبار، أخبرني بالنتيجة وننتقل للتالي! 🎯
