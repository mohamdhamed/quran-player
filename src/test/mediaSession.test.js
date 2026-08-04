/**
 * Media Session Service Tests
 *
 * الباجات اللي التستات دي بتحرسها كلها من نوع واحد: الـ API الأصلية
 * بترمي استثناءات في حالات عادية جداً عندنا (المدة لسه صفر، الموضع
 * عدّى المدة بجزء من الثانية، متصفح مش عارف أكشن). أي استثناء من دول
 * لو خرج بره الغلاف بيقطع التشغيل نفسه.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isSupported,
  setMetadata,
  setPlaybackState,
  setPositionState,
  setActionHandlers,
  clear
} from '../services/mediaSession';

class FakeMediaMetadata {
  constructor(init) {
    Object.assign(this, init);
  }
}

function createFakeSession() {
  return {
    metadata: null,
    playbackState: 'none',
    handlers: {},
    setActionHandler(action, handler) {
      // المتصفحات القديمة بترمي كده على الأكشنز اللي ماتعرفهاش
      if (action === 'seekto') throw new TypeError('Unsupported action');
      this.handlers[action] = handler;
    },
    setPositionState: vi.fn()
  };
}

function installSession(session) {
  Object.defineProperty(navigator, 'mediaSession', {
    value: session,
    configurable: true,
    writable: true
  });
}

describe('mediaSession', () => {
  let fake;

  beforeEach(() => {
    fake = createFakeSession();
    installSession(fake);
    window.MediaMetadata = FakeMediaMetadata;
  });

  afterEach(() => {
    delete navigator.mediaSession;
    delete window.MediaMetadata;
    vi.restoreAllMocks();
  });

  describe('في متصفح مش داعم', () => {
    beforeEach(() => {
      delete navigator.mediaSession;
    });

    it('isSupported بترجّع false', () => {
      expect(isSupported()).toBe(false);
    });

    it('كل الدوال بتعدي من غير ما ترمي', () => {
      expect(() => {
        setMetadata({ title: 'سورة الفاتحة', artist: 'مشاري' });
        setPlaybackState('playing');
        setPositionState({ duration: 100, position: 5, playbackRate: 1 });
        setActionHandlers({ play: () => {} });
        clear();
      }).not.toThrow();
    });
  });

  describe('setMetadata', () => {
    it('بتملا العنوان والقارئ والأيقونات', () => {
      setMetadata({ title: 'سورة الفاتحة', artist: 'مشاري راشد العفاسي' });

      expect(fake.metadata.title).toBe('سورة الفاتحة');
      expect(fake.metadata.artist).toBe('مشاري راشد العفاسي');
      expect(fake.metadata.artwork.length).toBeGreaterThan(0);
    });

    it('null بتمسح البيانات', () => {
      setMetadata({ title: 'سورة الفاتحة', artist: 'مشاري' });
      setMetadata(null);

      expect(fake.metadata).toBeNull();
    });

    it('مش بترمي لو MediaMetadata مش موجود', () => {
      delete window.MediaMetadata;
      expect(() => setMetadata({ title: 'سورة الفاتحة', artist: 'مشاري' })).not.toThrow();
    });
  });

  describe('setPositionState', () => {
    it('بتبعت المدة والموضع والسرعة', () => {
      setPositionState({ duration: 120, position: 30, playbackRate: 1.5 });

      expect(fake.setPositionState).toHaveBeenCalledWith({
        duration: 120,
        position: 30,
        playbackRate: 1.5
      });
    });

    it('بتقصّ الموضع لو عدّى المدة', () => {
      setPositionState({ duration: 120, position: 120.4, playbackRate: 1 });

      expect(fake.setPositionState).toHaveBeenCalledWith({
        duration: 120,
        position: 120,
        playbackRate: 1
      });
    });

    it('بتمسح الشريط لو المدة لسه صفر أو مش رقم', () => {
      setPositionState({ duration: 0, position: 0, playbackRate: 1 });
      setPositionState({ duration: NaN, position: 0, playbackRate: 1 });

      expect(fake.setPositionState).toHaveBeenCalledTimes(2);
      expect(fake.setPositionState).toHaveBeenLastCalledWith();
    });

    it('سرعة صفر بترجع 1 - الـ API بترفض الصفر', () => {
      setPositionState({ duration: 120, position: 10, playbackRate: 0 });

      expect(fake.setPositionState).toHaveBeenCalledWith({
        duration: 120,
        position: 10,
        playbackRate: 1
      });
    });

    it('مش بترمي لو الـ API نفسها رفضت', () => {
      fake.setPositionState = vi.fn(() => {
        throw new TypeError('rejected');
      });

      expect(() => setPositionState({ duration: 120, position: 10, playbackRate: 1 })).not.toThrow();
    });
  });

  describe('setActionHandlers', () => {
    it('أكشن مرفوض ما بيمنعش اللي بعده', () => {
      const play = vi.fn();
      const next = vi.fn();

      // seekto بيرمي في الـ fake - زي المتصفحات اللي ماتعرفهوش
      setActionHandlers({ play, seekto: () => {}, nexttrack: next });

      expect(fake.handlers.play).toBe(play);
      expect(fake.handlers.nexttrack).toBe(next);
      expect(fake.handlers.seekto).toBeUndefined();
    });
  });

  describe('clear', () => {
    it('بتشيل الهاندلرز والبيانات والحالة', () => {
      setActionHandlers({ play: () => {}, pause: () => {} });
      setMetadata({ title: 'سورة الفاتحة', artist: 'مشاري' });
      setPlaybackState('playing');

      clear();

      expect(fake.handlers.play).toBeNull();
      expect(fake.handlers.pause).toBeNull();
      expect(fake.metadata).toBeNull();
      expect(fake.playbackState).toBe('none');
    });
  });
});
