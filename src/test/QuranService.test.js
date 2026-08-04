/**
 * QuranService Tests
 *
 * اختبارات الواجهة الموحدة - تركّز على إن الميثودز موجودة فعلاً
 * وما اتغطّتش بالـ providers (باج حصل قبل كده)
 */

import { describe, it, expect } from 'vitest';
import quranService, { QuranService } from '../services/QuranService';

describe('QuranService', () => {
  describe('الواجهة العامة', () => {
    // الباج القديم: this.search = new SearchProvider() في الـ constructor
    // كانت بتغطّي الميثود search() فبقى quranService.search كائن مش دالة
    const methods = [
      'getAudioUrl',
      'getReciters',
      'getReciterById',
      'getSurahText',
      'getSurahInfo',
      'getTimings',
      'findCurrentAyah',
      'search',
      'semanticSearch',
      'clearAllCaches',
      'getCacheInfo'
    ];

    it.each(methods)('%s لازم تكون دالة مش كائن', (method) => {
      expect(typeof quranService[method]).toBe('function');
    });

    it('مفيش خاصية في الـ instance بتغطّي ميثود من الـ prototype', () => {
      const prototypeMethods = Object.getOwnPropertyNames(QuranService.prototype).filter(
        (name) => name !== 'constructor'
      );
      const shadowed = prototypeMethods.filter(
        (name) => Object.prototype.hasOwnProperty.call(quranService, name)
      );

      expect(shadowed).toEqual([]);
    });
  });

  describe('الـ providers', () => {
    it('كل provider موجود وله الميثودز المطلوبة', () => {
      expect(typeof quranService._audio.getAudioUrl).toBe('function');
      expect(typeof quranService._text.getSurahText).toBe('function');
      expect(typeof quranService._timing.getTimings).toBe('function');
      expect(typeof quranService._search.search).toBe('function');
    });
  });

  describe('getCacheInfo', () => {
    it('بيرجّع معلومات الـ caches من غير ما يرمي', () => {
      const info = quranService.getCacheInfo();

      expect(info).toHaveProperty('surahs');
      expect(info).toHaveProperty('audio');
      expect(info).toHaveProperty('timing');
      expect(info).toHaveProperty('search');
    });
  });
});
