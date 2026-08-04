import errorHandler from '../utils/errorHandler';
import { ApiError } from '../utils/ApiError';

/**
 * howler وزنه ~105KB وهو 13% من الـ bundle، ومحدش محتاجه لحد ما
 * المستخدم يضغط تشغيل فعلاً. فبنحمّله عند أول تشغيل بس.
 *
 * الاستيراد بيتخزّن في الـ promise دي، فالمرات اللي بعدها بتاخده من
 * الذاكرة على طول من غير أي انتظار.
 */
let howlerPromise = null;

function loadHowl() {
  if (!howlerPromise) {
    howlerPromise = import('howler').then((m) => m.Howl);
  }
  return howlerPromise;
}

/**
 * لو الوقت مامشيش خلال المدة دي والتلاوة المفروض شغالة، يبقى الصوت
 * وقف ومش هيرجع لوحده.
 *
 * الحالة دي بتحصل فعلاً: الملف يبدأ، يطلّع أقل من ثانية، وبعدين يفصل
 * من غير ما howler يقول حاجة. من غير الحارس ده الـ store يفضل فاكر
 * إن التلاوة شغالة، وشاشة القفل تفضل مكتوب عليها "شغال" من غير شريط
 * تقدم - وهو بالظبط الشكل اللي المستخدم شافه.
 *
 * 8 ثواني مش رقم عشوائي: التحميل البطيء على شبكة ضعيفة ممكن يقف
 * ثانيتين تلاتة عادي، فمش عايزين نعلن فشل على أول تهتهة.
 */
const STALL_TIMEOUT_MS = 8000;

/**
 * أكواد أخطاء عنصر الصوت في المتصفح.
 *
 * "تعذر تحميل التلاوة، تأكد من اتصالك بالإنترنت" رسالة مالهاش لازمة
 * لما السبب مش الإنترنت أصلاً - والكود بيفرّق بين حالات علاجها مختلف
 * تماماً: الشبكة قطعت، ولا الملف نفسه وصل بايظ (ده بيحصل لما يكون
 * فيه كاش خزّن رد ناقص)، ولا المتصفح رفض المصدر من أصله (سياسة أمان
 * أو صيغة مش مدعومة).
 */
const MEDIA_ERROR_REASONS = {
  1: 'التحميل اتلغى',
  2: 'الشبكة قطعت أثناء التحميل',
  3: 'الملف وصل بايظ',
  4: 'المتصفح رفض الملف'
};

function mediaErrorReason(code) {
  return MEDIA_ERROR_REASONS[code] || `كود ${code === undefined || code === null ? '؟' : code}`;
}

class AudioPlayerService {
  constructor() {
    this.howl = null;
    this.Howl = null;
    this.onTimeUpdate = null;
    this.onFailure = null;
    this.onEnd = null;
    this.updateInterval = null;
    this.currentUrl = null;
    this.lastProgressTime = 0;
    this.lastProgressAt = 0;
    // بيتحفظوا هنا عشان المحاولة التانية تبدأ بنفس إعدادات الأولى
    this.volumeValue = 1;
    this.rateValue = 1;
  }

  /**
   * تشغيل ملف صوتي (سورة كاملة)
   * @param {string} audioUrl - رابط الملف
   * @param {Function} onEnd - يتنادى لما السورة تخلص
   * @param {Function} onTimeUpdate - يتنادى كل 100ms بالوقت والمدة
   * @param {Function} [onFailure] - يتنادى لما التلاوة تفشل أو تفصل،
   *        عشان الواجهة وشاشة القفل ماتفضلش مدّعية إنها شغالة
   */
  async play(audioUrl, onEnd, onTimeUpdate, onFailure) {
    // Cleanup previous audio
    if (this.howl) {
      this.howl.unload();
      this.stopTimeUpdates();
    }

    this.onTimeUpdate = onTimeUpdate;
    this.onFailure = onFailure;
    this.onEnd = onEnd;
    this.currentUrl = audioUrl;

    this.Howl = await loadHowl();

    this.load(audioUrl, false);
  }

  /**
   * @param {string} url - الرابط اللي هيتحمّل فعلاً (ممكن يكون فيه
   *        زيادة لتخطي الكاش في المحاولة التانية)
   * @param {boolean} isRetry - هل دي المحاولة التانية؟
   * @private
   */
  load(url, isRetry) {
    this.howl = new this.Howl({
      src: [url],
      html5: true,
      // لازم يتحدد صراحةً: في المحاولة التانية الرابط بينتهي بـ query
      // مش بـ .mp3، و howler مش هيعرف الصيغة لوحده
      format: ['mp3'],
      onplay: () => {
        this.startTimeUpdates();
      },
      onpause: () => {
        this.stopTimeUpdates();
      },
      onend: () => {
        this.stopTimeUpdates();
        if (this.onEnd) this.onEnd();
      },
      onloaderror: (id, error) => {
        this.handleLoadError(error, isRetry);
      },
      onplayerror: (id, error) => {
        // المتصفح بيمنع التشغيل التلقائي لحد ما المستخدم يتفاعل مع الصفحة.
        // ده مش خطأ نزعّج بيه المستخدم - howler بيفك القفل لوحده بعد أول لمسة.
        this.howl.once('unlock', () => {
          this.howl.play();
        });
        console.warn('Audio play deferred until user interaction:', error);
      }
    });

    this.howl.volume(this.volumeValue);
    this.howl.rate(this.rateValue);
    this.howl.play();
  }

  /**
   * محاولة تانية برابط جديد قبل ما نعلن الفشل.
   *
   * أشهر سبب لفشل التحميل هو رد باظ أو ناقص متخزّن في الطريق - كاش
   * المتصفح، أو service worker، أو وسيط في الشبكة. زيادة على الرابط
   * بتخلّيه رابط جديد بالنسبة لأي كاش، فبيتجاب من المصدر من تاني.
   * لو المشكلة حقيقية (النت مقطوع فعلاً) المحاولة التانية هتفشل زيها
   * وهنعلن الفشل ساعتها.
   * @private
   */
  handleLoadError(error, isRetry) {
    this.stopTimeUpdates();

    if (!isRetry) {
      const separator = this.currentUrl.includes('?') ? '&' : '?';
      const freshUrl = `${this.currentUrl}${separator}cb=${Date.now()}`;

      console.warn('Audio load failed, retrying past any cache:', mediaErrorReason(error));

      if (this.howl) this.howl.unload();
      this.load(freshUrl, true);
      return;
    }

    this.fail(mediaErrorReason(error));
  }

  /**
   * إعلان إن التلاوة مش هتشتغل، برسالة بتقول السبب
   * @private
   */
  fail(reason) {
    this.stopTimeUpdates();
    errorHandler.handle(ApiError.audioLoadError(this.currentUrl, null, reason));
    if (this.onFailure) this.onFailure();
  }

  pause() {
    if (this.howl && this.howl.playing()) {
      this.howl.pause();
    }
  }

  resume() {
    if (this.howl && !this.howl.playing()) {
      this.howl.play();
      this.startTimeUpdates(); // إعادة تشغيل التحديثات
    }
  }

  stop() {
    if (this.howl) {
      this.howl.stop();
      this.stopTimeUpdates();
    }
  }

  seek(seconds) {
    if (this.howl) {
      this.howl.seek(seconds);
    }
  }

  setVolume(value) {
    this.volumeValue = value;
    if (this.howl) {
      this.howl.volume(value);
    }
  }

  setRate(rate) {
    this.rateValue = rate;
    if (this.howl) {
      this.howl.rate(rate);
    }
  }

  getCurrentTime() {
    return this.howl ? this.howl.seek() : 0;
  }

  getDuration() {
    return this.howl ? this.howl.duration() : 0;
  }

  isPlaying() {
    return this.howl ? this.howl.playing() : false;
  }

  startTimeUpdates() {
    this.stopTimeUpdates();

    this.lastProgressTime = this.getCurrentTime();
    this.lastProgressAt = Date.now();

    // تحديث كل 100ms لتزامن أدق (بدلاً من 1000ms)
    this.updateInterval = setInterval(() => {
      if (!this.howl) return;

      const time = this.getCurrentTime();

      if (this.onTimeUpdate) {
        this.onTimeUpdate(time, this.getDuration());
      }

      if (time !== this.lastProgressTime) {
        this.lastProgressTime = time;
        this.lastProgressAt = Date.now();
        return;
      }

      if (Date.now() - this.lastProgressAt >= STALL_TIMEOUT_MS) {
        this.handleStall();
      }
    }, 100); // ⚡ 100ms = تحديث 10 مرات في الثانية
  }

  /**
   * الصوت وقف من غير ما حد يقول - نعلنها بدل ما نفضل مدّعيين إنه شغال
   */
  handleStall() {
    this.fail('التلاوة وقفت وما كمّلتش');
  }

  stopTimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  cleanup() {
    this.stopTimeUpdates();
    if (this.howl) {
      this.howl.unload();
      this.howl = null;
    }
  }
}

export default new AudioPlayerService();
