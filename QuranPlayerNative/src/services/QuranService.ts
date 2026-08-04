/**
 * Quran Service - الواجهة الموحدة لجميع خدمات القرآن
 * نسخة React Native
 */

import { AudioProvider } from './providers/AudioProvider';
import { TextProvider } from './providers/TextProvider';
import { TimingProvider } from './providers/TimingProvider';

class QuranService {
    private audio: AudioProvider;
    private text: TextProvider;
    private timing: TimingProvider;
    private _surahCache: Map<number, any>;

    constructor() {
        this.audio = new AudioProvider();
        this.text = new TextProvider();
        this.timing = new TimingProvider();
        this._surahCache = new Map();
    }

    // ═══════════════════════════════════════════════════════════════
    // Audio Methods
    // ═══════════════════════════════════════════════════════════════

    async getAudioUrl(reciterId: string, surahNumber: number): Promise<string | null> {
        return this.audio.getAudioUrl(reciterId, surahNumber);
    }

    getReciters() {
        return this.audio.getReciters();
    }

    getReciterById(reciterId: string) {
        return this.audio.getReciterById(reciterId);
    }

    // ═══════════════════════════════════════════════════════════════
    // Text Methods
    // ═══════════════════════════════════════════════════════════════

    async getSurahText(surahNumber: number) {
        if (this._surahCache.has(surahNumber)) {
            return this._surahCache.get(surahNumber);
        }

        const data = await this.text.getSurahText(surahNumber);
        if (data) {
            this._surahCache.set(surahNumber, data);
        }
        return data;
    }

    async getSurahInfo(surahNumber: number) {
        return this.text.getSurahInfo(surahNumber);
    }

    // ═══════════════════════════════════════════════════════════════
    // Timing Methods
    // ═══════════════════════════════════════════════════════════════

    async getTimings(surahNumber: number, reciterId: string) {
        return this.timing.getTimings(surahNumber, reciterId);
    }

    findCurrentAyah(currentTime: number, timings: any[]) {
        return this.timing.findCurrentAyah(currentTime, timings);
    }

    // ═══════════════════════════════════════════════════════════════
    // Cache Management
    // ═══════════════════════════════════════════════════════════════

    clearAllCaches() {
        this._surahCache.clear();
        this.audio.clearCache();
        this.timing.clearCache();
    }

    getCacheInfo() {
        return {
            surahs: this._surahCache.size,
            audio: this.audio.getCacheInfo(),
            timing: this.timing.getCacheInfo(),
        };
    }
}

const quranService = new QuranService();
export default quranService;
export { QuranService };
