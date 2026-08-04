import { Howl } from 'howler';
import errorHandler from '../utils/errorHandler';
import { ApiError } from '../utils/ApiError';

class AudioPlayerService {
  constructor() {
    this.howl = null;
    this.currentSurah = null;
    this.audioData = null; // Store audio data from API
    this.onTimeUpdate = null;
    this.updateInterval = null;
  }

  /**
   * Play audio from API data (multiple ayah files)
   * @param {Object} audioData - Data from getAudioUrl() containing basePath and ayahs
   */
  async playFromAPI(audioData, onEnd, onTimeUpdate) {
    // Cleanup previous audio
    if (this.howl) {
      this.howl.unload();
      this.stopTimeUpdates();
    }

    this.audioData = audioData;
    this.onTimeUpdate = onTimeUpdate;
    
    // Build playlist of all ayah URLs
    const audioUrls = audioData.ayahs.map(ayah => ayah.audio);
    
    // For now, play first ayah (we'll implement full surah playback later)
    // TODO: Concatenate all ayahs or use playlist functionality
    this.howl = new Howl({
      src: audioUrls, // Howler will play them sequentially
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
        console.error('Audio load error:', error);
      },
      onplayerror: (id, error) => {
        console.error('Audio play error:', error);
        this.howl.once('unlock', () => {
          this.howl.play();
        });
      }
    });
    
    this.howl.play();
  }

  /**
   * Legacy method for backward compatibility
   */
  play(audioUrl, onEnd, onTimeUpdate) {
    // Cleanup previous audio
    if (this.howl) {
      this.howl.unload();
      this.stopTimeUpdates();
    }

    this.onTimeUpdate = onTimeUpdate;
    
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
        errorHandler.handle(ApiError.audioLoadError(audioUrl, error));
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
    // تحديث كل 100ms لتزامن أدق (بدلاً من 1000ms)
    this.updateInterval = setInterval(() => {
      if (this.onTimeUpdate && this.howl) {
        this.onTimeUpdate(this.getCurrentTime(), this.getDuration());
      }
    }, 100); // ⚡ 100ms = تحديث 10 مرات في الثانية
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
