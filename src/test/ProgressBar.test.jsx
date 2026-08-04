/**
 * ProgressBar Tests
 *
 * التنقل داخل السورة كان بالماوس بس (حساب من e.clientX)، يعني مستخدم
 * الكيبورد أو قارئ الشاشة ما كانش يقدر يتحرك في التلاوة خالص.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProgressBar from '../components/Player/components/ProgressBar';
import { usePlayerStore } from '../store/playerStore';
import audioPlayer from '../services/audioPlayer';

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

describe('ProgressBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePlayerStore.setState({ currentTime: 100, duration: 300, isPlaying: true });
  });

  it('عنصر slider له قيم يقراها قارئ الشاشة', () => {
    render(<ProgressBar />);
    const slider = screen.getByRole('slider');

    expect(slider).toHaveAttribute('aria-valuenow', '100');
    expect(slider).toHaveAttribute('aria-valuemax', '300');
    expect(slider).toHaveAttribute('aria-valuetext', '1:40 من 5:00');
    expect(slider).toHaveAttribute('tabindex', '0');
  });

  it('يوصله الفوكس بالـ Tab', async () => {
    render(<ProgressBar />);

    await userEvent.tab();

    expect(document.activeElement).toBe(screen.getByRole('slider'));
  });

  // RTL: الشمال بيقدّم واليمين بيرجّع
  const keys = [
    ['{ArrowLeft}', 105],
    ['{ArrowRight}', 95],
    ['{ArrowUp}', 105],
    ['{ArrowDown}', 95],
    ['{PageUp}', 160],
    ['{PageDown}', 40],
    ['{Home}', 0],
    ['{End}', 300]
  ];

  it.each(keys)('%s ينقل الصوت لـ %i ثانية', async (key, expected) => {
    render(<ProgressBar />);
    screen.getByRole('slider').focus();

    await userEvent.keyboard(key);

    expect(audioPlayer.seek).toHaveBeenCalledWith(expected);
    expect(usePlayerStore.getState().currentTime).toBe(expected);
  });

  it('ما يخرجش عن حدود السورة', async () => {
    usePlayerStore.setState({ currentTime: 298 });
    render(<ProgressBar />);
    screen.getByRole('slider').focus();

    await userEvent.keyboard('{ArrowLeft}');

    expect(audioPlayer.seek).toHaveBeenCalledWith(300);
  });

  it('ما يعملش حاجة لو مفيش سورة محمّلة', async () => {
    usePlayerStore.setState({ currentTime: 0, duration: 0 });
    render(<ProgressBar />);
    screen.getByRole('slider').focus();

    await userEvent.keyboard('{ArrowLeft}');

    expect(audioPlayer.seek).not.toHaveBeenCalled();
  });
});
