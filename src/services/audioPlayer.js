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

class AudioPlayerService {
  constructor() {
    this.howl = null;
    this.onTimeUpdate = null;
    this.onFailure = null;
    this.updateInterval = null;
    this.currentUrl = null;
    this.lastProgressTime = 0;
    this.lastProgressAt = 0;
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
    this.currentUrl = audioUrl;

    const Howl = await loadHowl();

    this.howl = new Howl({
      src: [audioUrl],
      html5: true,
      format: ['mp3'],
      onload: () => {},
      onplay: () => {
        this.startTimeUpdates();
      },
      onpause: () => {
        this.stopTimeUpdates();
      },
      onend: () => {
        this.stopTimeUpdates();
        if (onEnd) onEnd();
      },
      onloaderror: (id, error) => {
        this.stopTimeUpdates();
        errorHandler.handle(ApiError.audioLoadError(audioUrl, error));
        if (this.onFailure) this.onFailure();
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
    
    this.howl.play();
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
    if (this.howl) {
      this.howl.volume(value);
    }
  }

  setRate(rate) {
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
    this.stopTimeUpdates();
    errorHandler.handle(ApiError.audioLoadError(this.currentUrl));
    if (this.onFailure) this.onFailure();
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
