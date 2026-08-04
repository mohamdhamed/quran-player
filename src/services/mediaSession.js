/**
 * Media Session - التحكم في التلاوة من برّه الصفحة
 *
 * ده اللي بيخلّي شاشة القفل، وزراير السماعة، وشاشة العربية تعرف إن فيه
 * تلاوة شغالة وتقدر توقفها وتشغّلها. من غيره المستخدم لازم يفتح المتصفح
 * ويدوّس على الزرار بإيده - وده مش ينفع وهو سايق.
 *
 * الملف ده متعمّد يبقى مجرّد غلاف رفيع حوالين `navigator.mediaSession`:
 * كل الـ API الأصلية بترمي أخطاء في حالات كتير (متصفح قديم، أكشن مش
 * مدعوم، وقت أكبر من المدة) والغلاف ده بيمتصها، عشان أي حتة تانية في
 * التطبيق تناديه من غير ما تلفّ كل حاجة في try/catch.
 */

/** أيقونات التطبيق - هي دي اللي بتظهر في شاشة القفل */
const DEFAULT_ARTWORK = [
  { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
  { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
];

/** كل الأكشنز اللي بنسجّلها - محتاجينها بالاسم عشان نمسحها بعدين */
const ACTIONS = [
  'play',
  'pause',
  'stop',
  'nexttrack',
  'previoustrack',
  'seekbackward',
  'seekforward',
  'seekto'
];

function session() {
  if (typeof navigator === 'undefined') return null;
  return navigator.mediaSession || null;
}

/** هل المتصفح بيدعم الـ API أصلاً؟ (سفاري القديم و فايرفوكس بيرجّعوا false) */
export function isSupported() {
  return session() !== null;
}

/**
 * بيانات التلاوة اللي هتظهر في شاشة القفل
 * @param {{title: string, artist: string, album?: string, artwork?: Array}|null} meta
 *        لو null بيمسح البيانات (يعني مفيش حاجة شغالة)
 */
export function setMetadata(meta) {
  const ms = session();
  if (!ms) return;

  if (!meta) {
    ms.metadata = null;
    return;
  }

  // MediaMetadata ممكن ميكونش موجود حتى لو mediaSession موجود
  if (typeof window === 'undefined' || typeof window.MediaMetadata !== 'function') return;

  try {
    ms.metadata = new window.MediaMetadata({
      title: meta.title || '',
      artist: meta.artist || '',
      album: meta.album || '',
      artwork: meta.artwork || DEFAULT_ARTWORK
    });
  } catch (error) {
    console.warn('Media Session metadata rejected:', error);
  }
}

/**
 * @param {'none'|'playing'|'paused'} state
 */
export function setPlaybackState(state) {
  const ms = session();
  if (!ms) return;
  ms.playbackState = state;
}

/**
 * موضع التلاوة - ده اللي بيرسم شريط التقدم في شاشة القفل
 *
 * الـ API الأصلية بترمي TypeError لو المدة صفر أو NaN، أو لو الموضع
 * أكبر من المدة ولو بجزء من الثانية. والحالتين دول بيحصلوا عندنا فعلاً:
 * المدة بتفضل صفر لحد ما الملف يحمّل، والموضع بيعدّي المدة بشوية في
 * آخر ثانية. فبنحرس عليهم هنا بدل ما نسيب الاستثناء يقطع التشغيل.
 *
 * @param {{duration: number, position: number, playbackRate: number}} pos
 */
export function setPositionState({ duration, position, playbackRate } = {}) {
  const ms = session();
  if (!ms || typeof ms.setPositionState !== 'function') return;

  try {
    if (!Number.isFinite(duration) || duration <= 0) {
      // لسه ماعرفناش المدة - بنمسح الشريط بدل ما نرسمه غلط
      ms.setPositionState();
      return;
    }

    const safePosition = Math.min(Math.max(Number.isFinite(position) ? position : 0, 0), duration);
    const safeRate = Number.isFinite(playbackRate) && playbackRate > 0 ? playbackRate : 1;

    ms.setPositionState({ duration, position: safePosition, playbackRate: safeRate });
  } catch (error) {
    console.warn('Media Session position rejected:', error);
  }
}

/**
 * ربط أزرار النظام بدوال التطبيق
 *
 * @param {Object} handlers - المفتاح اسم الأكشن ('play', 'nexttrack', ...)
 *
 * أي أكشن المتصفح مش عارفه بيرمي TypeError من setActionHandler نفسها،
 * فبنجرّب كل واحد لوحده: مش لازم غياب 'seekto' في متصفح يمنع 'play'.
 */
export function setActionHandlers(handlers) {
  const ms = session();
  if (!ms) return;

  for (const [action, handler] of Object.entries(handlers)) {
    try {
      ms.setActionHandler(action, handler);
    } catch {
      // الأكشن ده مش مدعوم في المتصفح ده - عادي، الباقي بيشتغل
    }
  }
}

/** مسح كل حاجة - بيتنادى لما التطبيق يقفل */
export function clear() {
  const ms = session();
  if (!ms) return;

  for (const action of ACTIONS) {
    try {
      ms.setActionHandler(action, null);
    } catch {
      // مش مدعوم من الأصل، يبقى مفيش حاجة نمسحها
    }
  }

  setMetadata(null);
  setPlaybackState('none');
  setPositionState({});
}
