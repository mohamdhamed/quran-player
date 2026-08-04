/**
 * صورة السورة اللي بتظهر في شاشة القفل
 *
 * أيقونة التطبيق مش صورة غلاف - هي مربع أخضر بنفس الشكل مهما كانت
 * السورة اللي شغالة، وفي شاشة القفل جنب الصورة الكبيرة بتاعة أي مشغل
 * تاني بتبان وحشة. فبنرسم غلاف لكل سورة على canvas: اسم السورة كبير
 * بخط عربي، واسم القارئ تحته، على خلفية متدرّجة.
 *
 * الناتج data URL مش blob، عن قصد: الـ CSP بتاعتنا بتسمح بـ `data:`
 * في img-src بس، والمتصفح بيجيب صورة شاشة القفل تحت نفس السياسة.
 */

const SIZE = 512;

/**
 * JPEG مش PNG: الصورة كلها تدرّجات، و PNG بيطلعها ~420KB بينما JPEG
 * بيطلعها عُشر ده تقريباً بفرق مش باين. والصورة دي بتتحوّل لنص data URL
 * وبتتخزّن في الذاكرة، فحجمها مش تفصيلة.
 */
const FORMAT = 'image/jpeg';
const QUALITY = 0.9;

/** ألوان ثابتة مش مربوطة بالثيم - دي صورة رايحة للنظام مش للواجهة */
const COLORS = {
  backgroundTop: '#0d3021',
  backgroundBottom: '#050607',
  glow: 'rgba(29, 185, 84, 0.35)',
  accent: '#1DB954',
  title: '#ffffff',
  subtitle: 'rgba(255, 255, 255, 0.62)'
};

/**
 * الرسم غالي شوية والسورة الواحدة بتترسم كل مرة يرجع لها، فبنحتفظ
 * بآخر شوية. الحد موجود عشان الـ data URLs دي مش صغيرة.
 */
const cache = new Map();
const MAX_CACHED = 24;

let fontsPromise = null;

/**
 * الخطوط جاية من Google Fonts، والـ canvas بيرسم بخط احتياطي وحش لو
 * رسمنا قبل ما توصل. بننتظرها مرة واحدة بس.
 */
function ensureFonts() {
  if (fontsPromise) return fontsPromise;

  fontsPromise = (async () => {
    if (typeof document === 'undefined' || !document.fonts) return;
    try {
      await Promise.all([
        document.fonts.load('700 96px Amiri'),
        document.fonts.load('600 34px Cairo')
      ]);
    } catch {
      // الخط مش متاح - هنرسم بالاحتياطي، أحسن من مانرسمش
    }
  })();

  return fontsPromise;
}

/** بيصغّر الخط لحد ما النص يدخل في العرض المتاح */
function fitFont(ctx, text, { family, weight, maxSize, minSize, maxWidth }) {
  let size = maxSize;
  while (size > minSize) {
    ctx.font = `${weight} ${size}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 2;
  }
  return size;
}

function paint(ctx, { title, subtitle, eyebrow }) {
  // الخلفية
  const gradient = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  gradient.addColorStop(0, COLORS.backgroundTop);
  gradient.addColorStop(1, COLORS.backgroundBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // وهج أخضر خفيف فوق - بيكسر إحساس المربع الميت
  const glow = ctx.createRadialGradient(SIZE * 0.72, SIZE * 0.2, 0, SIZE * 0.72, SIZE * 0.2, SIZE * 0.7);
  glow.addColorStop(0, COLORS.glow);
  glow.addColorStop(1, 'rgba(29, 185, 84, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // إطار رفيع
  ctx.strokeStyle = 'rgba(29, 185, 84, 0.28)';
  ctx.lineWidth = 2;
  ctx.strokeRect(28.5, 28.5, SIZE - 57, SIZE - 57);

  ctx.textAlign = 'center';

  // "القرآن الكريم" فوق
  ctx.fillStyle = COLORS.accent;
  ctx.font = '600 26px Cairo, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(eyebrow, SIZE / 2, SIZE * 0.3);

  // اسم السورة
  ctx.fillStyle = COLORS.title;
  const titleSize = fitFont(ctx, title, {
    family: 'Amiri, serif',
    weight: '700',
    maxSize: 92,
    minSize: 40,
    maxWidth: SIZE - 120
  });
  ctx.font = `700 ${titleSize}px Amiri, serif`;
  ctx.fillText(title, SIZE / 2, SIZE * 0.47);

  // فاصل صغير
  ctx.fillStyle = 'rgba(29, 185, 84, 0.5)';
  ctx.fillRect(SIZE / 2 - 40, SIZE * 0.585, 80, 2);

  // اسم القارئ
  ctx.fillStyle = COLORS.subtitle;
  const subtitleSize = fitFont(ctx, subtitle, {
    family: 'Cairo, sans-serif',
    weight: '400',
    maxSize: 34,
    minSize: 20,
    maxWidth: SIZE - 120
  });
  ctx.font = `400 ${subtitleSize}px Cairo, sans-serif`;
  ctx.fillText(subtitle, SIZE / 2, SIZE * 0.67);
}

/**
 * @param {{title: string, artist: string, album: string}} meta
 * @returns {Promise<Array|null>} مصفوفة artwork جاهزة للـ Media Session
 *                                أو null لو الرسم مش متاح
 */
export async function createArtwork(meta) {
  if (typeof document === 'undefined') return null;

  const key = `${meta.title}|${meta.artist}|${meta.album}`;
  if (cache.has(key)) return cache.get(key);

  await ensureFonts();

  let dataUrl;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    paint(ctx, { title: meta.title, subtitle: meta.artist, eyebrow: meta.album });
    dataUrl = canvas.toDataURL(FORMAT, QUALITY);
  } catch (error) {
    // canvas مش متاح (أو متعطّل في إعدادات المتصفح) - نرجع لأيقونة التطبيق
    console.warn('Artwork generation failed:', error);
    return null;
  }

  const artwork = [{ src: dataUrl, sizes: `${SIZE}x${SIZE}`, type: FORMAT }];

  if (cache.size >= MAX_CACHED) {
    cache.delete(cache.keys().next().value);
  }
  cache.set(key, artwork);

  return artwork;
}

/** للتستات */
export function clearArtworkCache() {
  cache.clear();
  fontsPromise = null;
}
