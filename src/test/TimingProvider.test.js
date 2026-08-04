/**
 * TimingProvider Tests
 *
 * الباج اللي بتحرسه: الـ API مش ثابت على ترقيم واحد للآيات.
 * لو افترضنا إزاحة ثابتة، التظليل بيسبق الصوت أو يتأخر عنه حسب القارئ.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TimingProvider } from '../services/providers/TimingProvider';

/** يبني رد زي بتاع الـ API الحقيقي */
function apiResponse(ayahNumbers) {
  return ayahNumbers.map((n, i) => ({
    ayah: n,
    start_time: i * 5000,
    end_time: (i + 1) * 5000,
    polygon: null,
    x: null,
    y: null,
    page: null
  }));
}

function mockFetchOnce(payload) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => payload
  });
}

describe('TimingProvider', () => {
  let provider;

  beforeEach(() => {
    provider = new TimingProvider();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('توحيد ترقيم الآيات', () => {
    // الحالات دي كلها متحقق منها من الـ API الحقيقي
    const cases = [
      { desc: 'مشاري/الفاتحة - مطابق أصلاً', surah: 1, raw: [1, 2, 3, 4, 5, 6, 7], expected: [1, 2, 3, 4, 5, 6, 7] },
      { desc: 'الحصري/الفاتحة - يبدأ من صفر', surah: 1, raw: [0, 1, 2, 3, 4, 5, 6], expected: [1, 2, 3, 4, 5, 6, 7] },
      { desc: 'الحصري/الإخلاص - الصفر بسملة', surah: 112, raw: [0, 1, 2, 3, 4], expected: [0, 1, 2, 3, 4] },
      { desc: 'عبدالباسط/الفاتحة - الصفر استعاذة', surah: 1, raw: [0, 1, 2, 3, 4, 5, 6, 7], expected: [0, 1, 2, 3, 4, 5, 6, 7] },
      { desc: 'مشاري/الإخلاص', surah: 112, raw: [1, 2, 3, 4], expected: [1, 2, 3, 4] }
    ];

    it.each(cases)('$desc', async ({ surah, raw, expected }) => {
      mockFetchOnce(apiResponse(raw));

      const timings = await provider.getTimings(surah, 'mishary');

      expect(timings.map((t) => t.ayah)).toEqual(expected);
    });

    it('آخر آية دايماً بتطابق عدد آيات السورة', async () => {
      mockFetchOnce(apiResponse([0, 1, 2, 3, 4, 5, 6]));

      const timings = await provider.getTimings(1, 'husary');

      expect(Math.max(...timings.map((t) => t.ayah))).toBe(7);
    });
  });

  describe('قراءة رد الـ API', () => {
    it('بيقرا المصفوفة المباشرة (الشكل الحقيقي)', async () => {
      mockFetchOnce(apiResponse([1, 2, 3, 4]));

      const timings = await provider.getTimings(112, 'mishary');

      expect(timings).toHaveLength(4);
      expect(timings[0].startTime).toBe(0);
      expect(timings[0].endTime).toBe(5);
    });

    it('بيقبل الشكل الملفوف في value برضه', async () => {
      mockFetchOnce({ value: apiResponse([1, 2, 3, 4]) });

      const timings = await provider.getTimings(112, 'mishary');

      expect(timings).toHaveLength(4);
    });

    it('بيرجّع مصفوفة فاضية لو الطلب فشل', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });

      expect(await provider.getTimings(1, 'mishary')).toEqual([]);
    });
  });

  describe('findCurrentAyah', () => {
    const timings = [
      { ayah: 1, startTime: 0, endTime: 10 },
      { ayah: 2, startTime: 10, endTime: 20 },
      { ayah: 3, startTime: 20, endTime: 30 }
    ];

    it('بيرجّع الآية اللي الوقت واقع فيها', () => {
      expect(provider.findCurrentAyah(5, timings)).toBe(1);
      expect(provider.findCurrentAyah(15, timings)).toBe(2);
      expect(provider.findCurrentAyah(25, timings)).toBe(3);
    });

    it('عند بداية الآية بالظبط بيرجّعها هي مش اللي قبلها', () => {
      expect(provider.findCurrentAyah(10, timings)).toBe(2);
      expect(provider.findCurrentAyah(20, timings)).toBe(3);
    });

    it('بيرجّع صفر لو مفيش توقيتات', () => {
      expect(provider.findCurrentAyah(5, [])).toBe(0);
      expect(provider.findCurrentAyah(5, null)).toBe(0);
    });

    it('ما يظللش حاجة قبل ما أول آية تبدأ (فترة الاستعاذة)', () => {
      const withIntro = [
        { ayah: 1, startTime: 6.4, endTime: 11.1 },
        { ayah: 2, startTime: 11.1, endTime: 17.6 }
      ];

      expect(provider.findCurrentAyah(3, withIntro)).toBe(0);
      expect(provider.findCurrentAyah(6.4, withIntro)).toBe(1);
    });
  });
});
