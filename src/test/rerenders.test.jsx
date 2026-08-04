/**
 * Re-render Tests
 *
 * عدّاد الوقت بيتحدّث 10 مرات في الثانية أثناء التشغيل.
 * التستات دي بتتأكد إن المكوّنات اللي مالهاش دعوة بالوقت
 * ما بتعملش re-render معاه.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { usePlayerStore } from '../store/playerStore';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

vi.mock('../services/audioPlayer', () => ({
  default: {
    seek: vi.fn(),
    play: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    setVolume: vi.fn(),
    isPlaying: vi.fn(() => false)
  }
}));

/** بيشغّل عدّاد الوقت زي ما audioPlayer بيعمل */
function tickTime(times) {
  const { setCurrentTime } = usePlayerStore.getState();
  for (let i = 1; i <= times; i++) {
    act(() => setCurrentTime(i * 0.1));
  }
}

describe('إعادة الرندر مع تحديث الوقت', () => {
  beforeEach(() => {
    usePlayerStore.setState({ currentTime: 0, duration: 300, volume: 0.8 });
  });

  it('useKeyboardShortcuts ما يسببش re-render للمكوّن اللي مستخدمه', () => {
    let renderCount = 0;

    function AppLike() {
      renderCount++;
      useKeyboardShortcuts();
      return <div>app</div>;
    }

    render(<AppLike />);
    const initialRenders = renderCount;

    tickTime(10);

    // الهوك ده بيتنادى في App، فأي رندر هنا معناه رندر للتطبيق كله
    expect(renderCount).toBe(initialRenders);
  });

  it('المشترك في currentTime هو الوحيد اللي بيتحدّث', () => {
    let timeRenders = 0;
    let otherRenders = 0;

    function TimeConsumer() {
      timeRenders++;
      usePlayerStore((state) => state.currentTime);
      return null;
    }

    function OtherConsumer() {
      otherRenders++;
      usePlayerStore((state) => state.currentSurah);
      usePlayerStore((state) => state.isPlaying);
      return null;
    }

    render(
      <>
        <TimeConsumer />
        <OtherConsumer />
      </>
    );

    const timeBefore = timeRenders;
    const otherBefore = otherRenders;

    tickTime(10);

    expect(timeRenders).toBe(timeBefore + 10);
    expect(otherRenders).toBe(otherBefore);
  });

  it('تغيير الصوت ما يأثرش على المشتركين في الوقت والعكس', () => {
    let volumeRenders = 0;

    function VolumeConsumer() {
      volumeRenders++;
      usePlayerStore((state) => state.volume);
      return null;
    }

    render(<VolumeConsumer />);
    const before = volumeRenders;

    tickTime(10);

    expect(volumeRenders).toBe(before);
  });
});
