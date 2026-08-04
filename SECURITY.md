# 🔒 الأمان في مشغل القرآن

التطبيق موقع ثابت (static SPA) من غير باك إند ولا حسابات ولا قاعدة بيانات،
فسطح الهجوم محدود أصلاً. الملف ده بيوصّف اللي **مطبَّق فعلاً**، واللي **مش**
مطبَّق، وإزاي تتأكد بنفسك.

---

## ✅ المطبَّق

### 1. Content Security Policy

مضبوطة كـ **HTTP header** من إعدادات الاستضافة:
[`vercel.json`](vercel.json) و [`netlify.toml`](netlify.toml).

```
default-src 'self';
base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self';
script-src 'self';
style-src  'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src   'self' https://fonts.gstatic.com;
img-src    'self' data:;
media-src  'self' https://*.mp3quran.net;
connect-src 'self' https://www.mp3quran.net https://*.mp3quran.net
                   https://api.alquran.cloud https://api.qurani.ai;
worker-src 'self'; manifest-src 'self'
```

> **نقطة ضعف معروفة:** `style-src` فيها `'unsafe-inline'`. التطبيق بيستخدم
> `style={{...}}` في 13 ملف، ومن غيرها الواجهة بتتكسر. لإزالتها لازم كل
> الأنماط دي تتحوّل لكلاسات Tailwind أو CSS.

**مهم:** الـ CSP لازم تفضل header. لو اتحطّت كـ `<meta>` تبقى أضعف —
`frame-ancestors` مثلاً ما بتشتغلش من الـ meta أصلاً.

### 2. هيدرز الحماية

في نفس ملفات الاستضافة:

| الهيدر | الغرض |
|---|---|
| `X-Frame-Options: SAMEORIGIN` | منع الـ clickjacking |
| `X-Content-Type-Options: nosniff` | منع تخمين نوع الملف |
| `Referrer-Policy: strict-origin-when-cross-origin` | تقليل تسريب الروابط |
| `Permissions-Policy: camera=(), microphone=(), geolocation=()` | إغلاق صلاحيات مش مستخدمة |

في [`index.html`](index.html) فيه `nosniff` و `Referrer-Policy` كـ meta كمان،
كاحتياطي لو اتنشر على استضافة من غير إعدادات هيدرز.

### 3. مفيش أسرار في الريبو

كل الـ APIs المستخدمة **مفتوحة ومن غير مفاتيح**. مفيش `.env` ولا توكنات.
الـ `debug.keystore` في `QuranPlayerNative/` هو مفتاح الديباج القياسي بتاع
React Native وباسورده معروف للجميع (`android`) — مش سر.

### 4. تنظيف المدخلات

- React بيعمل escape تلقائي لأي نص
- مفيش `dangerouslySetInnerHTML` ولا `eval()` في المشروع كله
- `script-src 'self'` من غير `'unsafe-eval'` بيمنع `eval` أصلاً

### 5. HTTPS فقط

`https://www.mp3quran.net` • `https://*.mp3quran.net` •
`https://api.alquran.cloud` • `https://api.qurani.ai` • Google Fonts

### 6. localStorage

بيتخزّن تحت مفتاح `quraan-player-storage`: القارئ المختار، مستوى الصوت،
وضع التكرار، السرعة، المفضلة، قوائم التشغيل، آخر ما استمعت له، الثيم واللغة.

**مفيش** كلمات مرور ولا توكنات ولا أي بيانات شخصية.

### 7. Error Boundary

[`src/components/ErrorBoundary.jsx`](src/components/ErrorBoundary.jsx) بيمنع
انهيار التطبيق بالكامل، وبيعرض تفاصيل الخطأ في وضع التطوير بس.

---

## ⚠️ مش مطبَّق (بصراحة)

- **تقييد المعدّل جزئي.** [`src/utils/rateLimiter.js`](src/utils/rateLimiter.js)
  (60 طلب/دقيقة) مستخدم في 4 دوال من `quranaiAPI.js` بس؛ 3 دوال تانية في نفس
  الملف وباقي الخدمات بتنادي `fetch` مباشرة. وهو أصلاً بيشتغل على مستوى
  المتصفح — يعني حماية للـ APIs الخارجية من الإفراط، مش حماية للتطبيق، وأي
  حد يقدر يتخطاه.
- **مفيش Subresource Integrity** على خط Google Fonts.
- **`'unsafe-inline'` في style-src** — مشروحة فوق.

## ℹ️ مش قابل للتطبيق

مفيش باك إند ولا تسجيل دخول، فمواضيع زي SQL Injection و CSRF و اختطاف
الجلسات مالهاش محل هنا.

---

## 🧪 إزاي تتأكد بنفسك

**1. الهيدرز على النسخة المنشورة:**

```bash
curl -sI https://YOUR-DOMAIN | grep -i -E "content-security|x-frame|nosniff|referrer"
```

**2. مخالفات الـ CSP:** افتح الموقع، شغّل سورة، افتح عارض النص، وشوف الـ
Console — أي حاجة مرفوضة هتظهر كـ `Refused to ...`. أو اجمعها برمجياً:

```js
const violations = [];
document.addEventListener('securitypolicyviolation', e =>
  violations.push(`${e.violatedDirective} ← ${e.blockedURI}`)
);
```

**3. إن eval ممنوع:**

```js
eval('1+1'); // EvalError: Refused to evaluate ... 'unsafe-eval' is not an allowed source
```

**4. محلياً:** `vite preview` ما بيبعتش هيدرز مخصصة، فاختبار الـ CSP محتاج
سيرفر بيبعتها أو بيئة معاينة حقيقية من Vercel/Netlify.

---

## 📮 الإبلاغ عن ثغرة

لو لقيت مشكلة أمنية، افتح issue على المستودع.
