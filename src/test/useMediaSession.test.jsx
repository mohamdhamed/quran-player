/**
 * useMediaSession Tests
 *
 * الهوك ده هو الوصلة بين زراير النظام (شاشة القفل، السماعة، البلوتوث)
 * وبين الـ store. التستات هنا بتتأكد إن الوصلة دي شغّالة في الاتجاهين:
 * حالة المشغل بتوصل لشاشة القفل، وضغط الزرار بيوصل للمشغل.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaSession } from '../hooks/useMediaSession';
import { usePlayerStore } from '../store/playerStore';
import audioPlayer from '../services/audioPlayer';

vi.mock('../services/audioPlayer', () => ({
  default: {
    seek: vi.fn(),
    stop: vi.fn(),
    getCurrentTime: vi.fn(() => 0),
    getDuration: vi.fn(() => 0),
    isPlaying: vi.fn(() => false),
    pause: vi.fn(),
    resume: vi.fn(),
    setVolume: vi.fn(),
    setRate: vi.fn()
  }
}));

class FakeMediaMetadata {
  constructor(init) {
    Object.assign(this, init);
  }
}

const FATIHA = { number: 1, name: 'الفاتحة', nameEn: 'Al-Fatiha' };

let fake;

function installFakeSession() {
  fake = {
    metadata: null,
    playbackState: 'none',
    handlers: {},
    setActionHandler(action, handler) {
      this.handlers[action] = handler;
    },
    setPositionState: vi.fn()
  };

  Object.defineProperty(navigator, 'mediaSession', {
    value: fake,
    configurable: true,
    writable: true
  });
  window.MediaMetadata = FakeMediaMetadata;
}

/** ضغطة زرار من النظام */
function press(action, details) {
  act(() => {
    fake.handlers[action](details);
  });
}

describe('useMediaSession', () => {
  beforeEach(() => {
    installFakeSession();
    usePlayerStore.setState({
      currentSurah: FATIHA,
      currentReciter: 'mishary',
      isPlaying: false,
      language: 'ar',
      currentTime: 0,
      duration: 0,
      playbackSpeed: 1
    });
  });

  afterEach(() => {
    delete navigator.mediaSession;
    delete window.MediaMetadata;
    vi.clearAllMocks();
  });

  it('بيعرض اسم السورة والقارئ بالعربي', () => {
    renderHook(() => useMediaSession());

    expect(fake.metadata.title).toBe('سورة الفاتحة');
    expect(fake.metadata.artist).toBe('مشاري راشد العفاسي');
  });

  it('بيتبع لغة التطبيق', () => {
    usePlayerStore.setState({ language: 'en' });
    renderHook(() => useMediaSession());

    expect(fake.metadata.title).toBe('Surah Al-Fatiha');
    expect(fake.metadata.artist).toBe('Mishari Rashid Alafasy');
  });

  it('بيحدّث البيانات لما القارئ يتغيّر', () => {
    renderHook(() => useMediaSession());

    act(() => {
      usePlayerStore.setState({ currentReciter: 'husary' });
    });

    expect(fake.metadata.artist).toBe('محمود خليل الحصري');
  });

  it('بيبلّغ النظام بحالة التشغيل', () => {
    renderHook(() => useMediaSession());
    expect(fake.playbackState).toBe('paused');

    act(() => {
      usePlayerStore.setState({ isPlaying: true });
    });
    expect(fake.playbackState).toBe('playing');
  });

  it('من غير سورة الحالة تبقى none', () => {
    usePlayerStore.setState({ currentSurah: null });
    renderHook(() => useMediaSession());

    expect(fake.playbackState).toBe('none');
    expect(fake.metadata).toBeNull();
  });

  it('زرار التشغيل والإيقاف بيغيّر الـ store', () => {
    renderHook(() => useMediaSession());

    press('play');
    expect(usePlayerStore.getState().isPlaying).toBe(true);

    press('pause');
    expect(usePlayerStore.getState().isPlaying).toBe(false);
  });

  it('زرار التالي بينقل للسورة اللي بعدها', () => {
    renderHook(() => useMediaSession());

    press('nexttrack');

    expect(usePlayerStore.getState().currentSurah.number).toBe(2);
    expect(usePlayerStore.getState().isPlaying).toBe(true);
  });

  it('التقديم بيحرّك الصوت نفسه مش الواجهة بس', () => {
    usePlayerStore.setState({ duration: 300 });
    audioPlayer.getCurrentTime.mockReturnValue(40);
    renderHook(() => useMediaSession());

    press('seekforward');

    expect(audioPlayer.seek).toHaveBeenCalledWith(50);
    expect(usePlayerStore.getState().currentTime).toBe(50);
  });

  it('الترجيع مابيعديش الصفر', () => {
    usePlayerStore.setState({ duration: 300 });
    audioPlayer.getCurrentTime.mockReturnValue(4);
    renderHook(() => useMediaSession());

    press('seekbackward');

    expect(audioPlayer.seek).toHaveBeenCalledWith(0);
  });

  it('السحب على شريط شاشة القفل بينقل لمكان محدد', () => {
    usePlayerStore.setState({ duration: 300 });
    renderHook(() => useMediaSession());

    press('seekto', { seekTime: 123 });

    expect(audioPlayer.seek).toHaveBeenCalledWith(123);
    expect(usePlayerStore.getState().currentTime).toBe(123);
  });

  it('التقديم مابيعديش نهاية السورة', () => {
    usePlayerStore.setState({ duration: 100 });
    audioPlayer.getCurrentTime.mockReturnValue(95);
    renderHook(() => useMediaSession());

    press('seekforward');

    expect(audioPlayer.seek).toHaveBeenCalledWith(100);
  });

  it('زرار الإيقاف بيوقف ويرجّع من الأول', () => {
    usePlayerStore.setState({ isPlaying: true, currentTime: 50, duration: 300 });
    renderHook(() => useMediaSession());

    press('stop');

    expect(audioPlayer.stop).toHaveBeenCalled();
    expect(usePlayerStore.getState().isPlaying).toBe(false);
    expect(usePlayerStore.getState().currentTime).toBe(0);
  });

  it('مابيغرقش النظام بتحديثات الموضع', () => {
    usePlayerStore.setState({ duration: 300, isPlaying: true });
    renderHook(() => useMediaSession());

    const before = fake.setPositionState.mock.calls.length;

    // نبضة كل 100ms زي المشغل الحقيقي
    act(() => {
      for (let i = 1; i <= 8; i++) {
        usePlayerStore.setState({ currentTime: i * 0.1 });
      }
    });

    expect(fake.setPositionState.mock.calls.length).toBe(before);
  });

  it('النطّة في التلاوة بتوصل للشريط فوراً', () => {
    usePlayerStore.setState({ duration: 300, isPlaying: true, currentTime: 10 });
    renderHook(() => useMediaSession());

    act(() => {
      usePlayerStore.setState({ currentTime: 200 });
    });

    expect(fake.setPositionState).toHaveBeenLastCalledWith({
      duration: 300,
      position: 200,
      playbackRate: 1
    });
  });

  it('بيسيب النظام نضيف لما التطبيق يقفل', () => {
    const { unmount } = renderHook(() => useMediaSession());

    unmount();

    expect(fake.handlers.play).toBeNull();
    expect(fake.metadata).toBeNull();
    expect(fake.playbackState).toBe('none');
  });

  it('مابيرميش في متصفح مش داعم', () => {
    delete navigator.mediaSession;

    expect(() => {
      const { unmount } = renderHook(() => useMediaSession());
      act(() => {
        usePlayerStore.setState({ isPlaying: true });
      });
      unmount();
    }).not.toThrow();
  });
});
