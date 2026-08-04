/**
 * Audio Cache Cleanup Tests
 *
 * الباج: جهاز خزّن رد صوت باظ في quran-audio-cache بـ CacheFirst
 * بيفضل يقدّمه لنفسه من غير ما يراجع المصدر، فالتلاوة ماتشتغلش على
 * الجهاز ده وبس. شيل الإعداد من vite.config.js مابيمسحش اللي اتخزّن
 * خلاص - المسح لازم يتم من التطبيق.
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { dropLegacyAudioCache } from '../services/audioCacheCleanup';

function installCaches(impl) {
  Object.defineProperty(globalThis, 'caches', {
    value: { delete: impl },
    configurable: true,
    writable: true
  });
}

describe('dropLegacyAudioCache', () => {
  afterEach(() => {
    delete globalThis.caches;
    vi.restoreAllMocks();
  });

  it('بيمسح الكاش القديم بالاسم', async () => {
    const remove = vi.fn(async () => true);
    installCaches(remove);

    await expect(dropLegacyAudioCache()).resolves.toBe(true);
    expect(remove).toHaveBeenCalledWith('quran-audio-cache');
  });

  it('بيعدّي عادي لو مكانش موجود', async () => {
    installCaches(async () => false);

    await expect(dropLegacyAudioCache()).resolves.toBe(false);
  });

  it('مابيرميش لو المتصفح مالوش Cache API', async () => {
    delete globalThis.caches;

    await expect(dropLegacyAudioCache()).resolves.toBe(false);
  });

  it('مابيرميش لو المتصفح منع الوصول للكاش', async () => {
    installCaches(async () => {
      throw new DOMException('denied');
    });
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    await expect(dropLegacyAudioCache()).resolves.toBe(false);
  });
});
