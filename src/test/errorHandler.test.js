/**
 * ErrorHandler Tests
 *
 * الخدمات كانت بتبلع الأخطاء في console.error وترجع null/[]،
 * فالمستخدم ما كانش بيعرف إن حاجة فشلت. التستات دي بتتأكد إن
 * الأخطاء بتوصل للـ listeners (اللي الـ Toasts متسجّلة فيهم).
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ErrorHandler } from '../utils/errorHandler';
import { ApiError, ErrorCodes } from '../utils/ApiError';
import { TimingProvider } from '../services/providers/TimingProvider';

describe('ErrorHandler', () => {
  let handler;

  beforeEach(() => {
    handler = new ErrorHandler();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('بيوصّل الخطأ للـ listeners برسالة عربية مفهومة', () => {
    const seen = [];
    handler.addListener((e) => seen.push(e.getUserMessage()));

    handler.handle(new ApiError('fetch failed', ErrorCodes.AUDIO_LOAD_ERROR));

    expect(seen).toHaveLength(1);
    expect(seen[0]).toContain('تعذر تحميل التلاوة');
  });

  it('ما بيكررش نفس الخطأ على المستخدم', () => {
    const seen = [];
    handler.addListener((e) => seen.push(e));

    // نفس الخطأ 5 مرات ورا بعض (زي تحميل توقيتات فاشل لكل سورة)
    for (let i = 0; i < 5; i++) {
      handler.handle(new ApiError('failed', ErrorCodes.TIMINGS_LOAD_ERROR));
    }

    expect(seen).toHaveLength(1);
  });

  it('بس بيفرّق بين الأنواع المختلفة', () => {
    const seen = [];
    handler.addListener((e) => seen.push(e.code));

    handler.handle(new ApiError('a', ErrorCodes.AUDIO_LOAD_ERROR));
    handler.handle(new ApiError('b', ErrorCodes.TEXT_LOAD_ERROR));
    handler.handle(new ApiError('c', ErrorCodes.TIMINGS_LOAD_ERROR));

    expect(seen).toEqual([
      ErrorCodes.AUDIO_LOAD_ERROR,
      ErrorCodes.TEXT_LOAD_ERROR,
      ErrorCodes.TIMINGS_LOAD_ERROR
    ]);
  });

  it('بيسجّل كل الأخطاء حتى المكرر منها', () => {
    for (let i = 0; i < 3; i++) {
      handler.handle(new ApiError('x', ErrorCodes.NETWORK_ERROR));
    }

    expect(handler.getErrorLog()).toHaveLength(3);
  });

  it('listener بيرمي استثناء ما بيوقفش الباقيين', () => {
    const seen = [];
    handler.addListener(() => {
      throw new Error('listener broke');
    });
    handler.addListener((e) => seen.push(e));

    handler.handle(new ApiError('x', ErrorCodes.UNKNOWN));

    expect(seen).toHaveLength(1);
  });
});

describe('الخدمات بتبلّغ عن الأخطاء', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('فشل تحميل التوقيتات بيوصل للمستخدم مش بس للـ console', async () => {
    const errorHandler = (await import('../utils/errorHandler')).default;
    const seen = [];
    const unsubscribe = errorHandler.addListener((e) => seen.push(e.code));

    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    const timings = await new TimingProvider().getTimings(1, 'mishary');

    expect(timings).toEqual([]); // التلاوة بتكمل عادي
    expect(seen).toContain(ErrorCodes.TIMINGS_LOAD_ERROR); // بس المستخدم بيعرف

    unsubscribe();
  });
});
