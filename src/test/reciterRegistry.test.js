/**
 * Reciter Registry Tests
 *
 * الباج اللي التستات دي بتحرسه: التوقيتات مربوطة بتسجيل صوتي معيّن.
 * لو timingReadId بتاع قارئ بيشاور على read تسجيله مختلف، التظليل
 * بيمشي على تلاوة تانية خالص.
 */

import { describe, it, expect } from 'vitest';
import {
  RECITERS,
  getReciter,
  getTimingReadId,
  getAudioUrl,
  getAllReciters,
  DEFAULT_RECITER_ID
} from '../services/reciterRegistry';

// الـ readId الصحيح لكل قارئ، متحقق منه من
// https://www.mp3quran.net/api/v3/ayat_timing/reads
// بمطابقة folder_url مع audioFolder
const VERIFIED_READ_IDS = {
  mishary: 123,
  abdulbasit: 53,
  husary: 118,
  minshawi: 112,
  sudais: 54,
  shuraim: 31,
  ghamadi: 30,
  ajmi: 5,
  shatri: 4,
  dosari: 92
};

describe('reciterRegistry', () => {
  it('كل قارئ له timingReadId متحقق منه', () => {
    for (const [id, expectedReadId] of Object.entries(VERIFIED_READ_IDS)) {
      expect(getTimingReadId(id), `readId بتاع ${id}`).toBe(expectedReadId);
    }
  });

  it('مفيش قارئين بيتشاركوا نفس الـ readId', () => {
    const ids = Object.values(RECITERS).map((r) => r.timingReadId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('كل قارئ عنده اسم ومجلد صوت صالح', () => {
    for (const [id, r] of Object.entries(RECITERS)) {
      expect(r.name, `اسم ${id}`).toBeTruthy();
      expect(r.audioFolder, `مجلد ${id}`).toMatch(/^https:\/\//);
      expect(typeof r.timingReadId, `نوع readId بتاع ${id}`).toBe('number');
    }
  });

  it('بيبني رابط الصوت بأرقام مصفّرة من اليسار', () => {
    expect(getAudioUrl('husary', 1)).toBe('https://server13.mp3quran.net/husr/001.mp3');
    expect(getAudioUrl('husary', 18)).toBe('https://server13.mp3quran.net/husr/018.mp3');
    expect(getAudioUrl('husary', 114)).toBe('https://server13.mp3quran.net/husr/114.mp3');
  });

  it('بيرجع للقارئ الافتراضي لو المعرّف مش معروف', () => {
    expect(getReciter('not-a-reciter')).toBe(RECITERS[DEFAULT_RECITER_ID]);
    expect(getTimingReadId('not-a-reciter')).toBe(RECITERS[DEFAULT_RECITER_ID].timingReadId);
  });

  it('getAllReciters بترجع كل القراء بمعرّفاتهم', () => {
    const all = getAllReciters();
    expect(all).toHaveLength(Object.keys(RECITERS).length);
    expect(all.every((r) => r.id && r.name)).toBe(true);
  });
});
