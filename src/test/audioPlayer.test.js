/**
 * Audio Player Tests
 *
 * الباج اللي التستات دي بتحرسه: التلاوة بتبدأ، تطلّع أقل من ثانية،
 * وتفصل من غير ما howler يقول حاجة. النتيجة كانت إن الـ store يفضل
 * فاكر إنها شغالة، والواجهة وشاشة القفل يفضلوا مكتوب عليهم "شغال"
 * من غير شريط تقدم، والمستخدم مايعرفش إن فيه غلط أصلاً.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import audioPlayer from '../services/audioPlayer';
import errorHandler from '../utils/errorHandler';

/** بديل عن Howl - بنتحكم في الوقت اللي بيرجّعه بإيدينا */
function fakeHowl(startTime = 0) {
  return {
    time: startTime,
    playing: () => true,
    seek() {
      return this.time;
    },
    duration: () => 300,
    unload: vi.fn(),
    stop: vi.fn()
  };
}

describe('audioPlayer - حارس التوقف', () => {
  let onFailure;
  let onTimeUpdate;
  let howl;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(errorHandler, 'handle').mockImplementation(() => {});

    onFailure = vi.fn();
    onTimeUpdate = vi.fn();
    howl = fakeHowl();

    audioPlayer.howl = howl;
    audioPlayer.onFailure = onFailure;
    audioPlayer.onTimeUpdate = onTimeUpdate;
    audioPlayer.currentUrl = 'https://server8.mp3quran.net/afs/018.mp3';
    audioPlayer.startTimeUpdates();
  });

  afterEach(() => {
    audioPlayer.stopTimeUpdates();
    audioPlayer.howl = null;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('مابيبلّغش عن فشل طول ما الوقت ماشي', () => {
    for (let tick = 0; tick < 200; tick++) {
      howl.time += 0.1;
      vi.advanceTimersByTime(100);
    }

    expect(onFailure).not.toHaveBeenCalled();
  });

  it('بيبلّغ إن التلاوة وقفت لما الوقت يقف', () => {
    // الصوت طلع شوية وبعدين فصل
    howl.time = 0.8;
    vi.advanceTimersByTime(100);

    vi.advanceTimersByTime(8000);

    expect(onFailure).toHaveBeenCalledTimes(1);
    expect(errorHandler.handle).toHaveBeenCalled();
  });

  it('بيستحمّل تهتهة قصيرة من غير ما يعلن فشل', () => {
    // 5 ثواني واقف - ده تحميل بطيء مش فشل
    vi.advanceTimersByTime(5000);
    expect(onFailure).not.toHaveBeenCalled();

    // الوقت مشي تاني، فالعدّاد بيتصفّر
    howl.time = 1.5;
    vi.advanceTimersByTime(100);
    vi.advanceTimersByTime(5000);

    expect(onFailure).not.toHaveBeenCalled();
  });

  it('بيبلّغ مرة واحدة بس مش كل 100ms', () => {
    vi.advanceTimersByTime(20000);

    expect(onFailure).toHaveBeenCalledTimes(1);
  });

  it('بيوقف التحديثات لما يعلن الفشل', () => {
    vi.advanceTimersByTime(8100);
    const callsAtFailure = onTimeUpdate.mock.calls.length;

    vi.advanceTimersByTime(2000);

    expect(onTimeUpdate.mock.calls.length).toBe(callsAtFailure);
  });
});
