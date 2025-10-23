# 📤 رفع المشروع على GitHub

## الخطوات:

### 1️⃣ إنشاء Repository على GitHub
1. افتح [GitHub](https://github.com)
2. اضغط على زر **"New repository"** (أخضر في الزاوية)
3. اكتب اسم المشروع: `quran-player` أو أي اسم تريده
4. اختر **Public** (للمشاريع العامة) أو **Private** (خاص)
5. **لا تختار** "Initialize with README" (لأن عندنا README جاهز)
6. اضغط **Create repository**

### 2️⃣ ربط المشروع مع GitHub
بعد إنشاء الـ repository، انسخ رابط الـ repository (مثل: `https://github.com/username/quran-player.git`)

ثم نفذ الأوامر التالية في Terminal:

```bash
# استبدل YOUR_USERNAME باسم المستخدم الخاص بك
# واستبدل REPO_NAME باسم المشروع
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# تأكد من إضافة الـ remote بنجاح
git remote -v

# رفع الكود على GitHub
git push -u origin master
```

### 3️⃣ مثال على الأوامر الكاملة:
```bash
# مثال: إذا كان اسم المستخدم: ahmed123
# واسم المشروع: quran-player
git remote add origin https://github.com/mohamdhamed/quran-player.git
git push -u origin master
```

---

## 🔐 المصادقة (Authentication)

GitHub لم يعد يقبل كلمة المرور العادية. استخدم إحدى الطرق:

### الطريقة 1: Personal Access Token (الأسهل)
1. اذهب إلى: https://github.com/settings/tokens
2. اضغط **Generate new token** → **Generate new token (classic)**
3. اكتب اسم للـ token: `Quran Player Upload`
4. اختر Expiration: `90 days` أو `No expiration`
5. اختر الصلاحيات: `repo` (كل الصلاحيات)
6. اضغط **Generate token**
7. **انسخ الـ token فوراً** (لن تستطيع رؤيته مرة أخرى!)
8. عند `git push`، استخدم الـ token بدلاً من كلمة المرور

### الطريقة 2: GitHub CLI (الأحدث)
```bash
# تثبيت GitHub CLI
winget install --id GitHub.cli

# المصادقة
gh auth login

# رفع المشروع
git push -u origin master
```

---

## 🎉 بعد الرفع

سيكون المشروع متاح على:
```
https://github.com/YOUR_USERNAME/quran-player
```

### نشر المشروع على Vercel أو Netlify:
1. **Vercel**: https://vercel.com/new → اختر الـ repository
2. **Netlify**: https://app.netlify.com/start → اختر الـ repository
3. سيتم النشر تلقائياً! 🚀

---

## 📝 ملاحظات

- ✅ Git مُهيأ بنجاح
- ✅ Commit الأول تم بنجاح (85 ملف)
- ✅ `.gitignore` موجود (لتجاهل `node_modules/` و `dist/`)
- ✅ المشروع جاهز للرفع!

---

## 🆘 إذا واجهت مشكلة

### خطأ: "remote origin already exists"
```bash
git remote remove origin
git remote add origin YOUR_GITHUB_URL
```

### خطأ: "Updates were rejected"
```bash
git pull origin master --allow-unrelated-histories
git push -u origin master
```

### تغيير branch من master إلى main
```bash
git branch -M main
git push -u origin main
```
