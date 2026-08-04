/**
 * Surah Artwork Tests
 *
 * jsdom مافيهوش canvas حقيقي، فبنركّب واحد مزيّف. اللي مهم نتأكد منه
 * هنا مش شكل الصورة - ده حاجة بالعين - لكن إن الخدمة بترجّع شكل
 * artwork اللي الـ Media Session بتفهمه، وإنها بتفضل ساكتة لو الرسم
 * مش متاح بدل ما تقطع التشغيل.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createArtwork, clearArtworkCache } from '../services/surahArtwork';

const META = { title: 'سورة الكهف', artist: 'مشاري راشد العفاسي', album: 'القرآن الكريم' };

let paintCalls;
let originalCreateElement;

function fakeContext() {
  paintCalls += 1;
  return {
    createLinearGradient: () => ({ addColorStop: vi.fn() }),
    createRadialGradient: () => ({ addColorStop: vi.fn() }),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    fillText: vi.fn(),
    measureText: (text) => ({ width: text.length * 30 }),
    set font(_value) {},
    get font() {
      return '';
    },
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    textAlign: '',
    textBaseline: ''
  };
}

function installCanvas(getContext) {
  originalCreateElement = document.createElement.bind(document);
  vi.spyOn(document, 'createElement').mockImplementation((tag) => {
    if (tag !== 'canvas') return originalCreateElement(tag);
    return {
      width: 0,
      height: 0,
      getContext,
      toDataURL: (format, quality) => `data:${format};q=${quality};base64,FAKE`
    };
  });
}

describe('surahArtwork', () => {
  beforeEach(() => {
    paintCalls = 0;
    clearArtworkCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('بيرجّع artwork بالشكل اللي الـ Media Session بتفهمه', async () => {
    installCanvas(fakeContext);

    const artwork = await createArtwork(META);

    expect(artwork).toEqual([
      { src: 'data:image/jpeg;q=0.9;base64,FAKE', sizes: '512x512', type: 'image/jpeg' }
    ]);
  });

  it('بيطلّعها JPEG - الصورة كلها تدرّجات و PNG بيضخّمها لأربع أضعاف', async () => {
    installCanvas(fakeContext);

    const [image] = await createArtwork(META);

    expect(image.type).toBe('image/jpeg');
  });

  it('بيرجّع data URL مش blob - الـ CSP بتاعتنا بتسمح بـ data: بس', async () => {
    installCanvas(fakeContext);

    const [image] = await createArtwork(META);

    expect(image.src.startsWith('data:')).toBe(true);
  });

  it('مابيرسمش نفس السورة مرتين', async () => {
    installCanvas(fakeContext);

    await createArtwork(META);
    await createArtwork(META);

    expect(paintCalls).toBe(1);
  });

  it('كل سورة ليها غلافها', async () => {
    installCanvas(fakeContext);

    await createArtwork(META);
    await createArtwork({ ...META, title: 'سورة يس' });

    expect(paintCalls).toBe(2);
  });

  it('بيرجّع null لو الـ canvas مش متاح بدل ما يرمي', async () => {
    installCanvas(() => null);

    await expect(createArtwork(META)).resolves.toBeNull();
  });

  it('بيرجّع null لو الرسم نفسه رمى', async () => {
    installCanvas(() => {
      throw new Error('canvas disabled');
    });
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    await expect(createArtwork(META)).resolves.toBeNull();
  });
});
