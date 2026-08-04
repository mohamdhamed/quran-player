/**
 * Timing Provider
 * مسؤول عن جلب التوقيتات الدقيقة للآيات
 */

const API_BASE = 'https://mp3quran.net/api/v3';

export interface AyahTiming {
    ayah: number;
    startTime: number;
    endTime: number;
    duration: number;
    page?: number;
}

const TIMING_RECITER_MAP: Record<string, { readId: number | null; fallback?: number }> = {
    mishary: { readId: null, fallback: 118 },
    abdulbasit: { readId: 53 },
    husary: { readId: 118 },
    minshawi: { readId: 112 },
    sudais: { readId: null, fallback: 31 },
    shuraim: { readId: 31 },
    ghamadi: { readId: 24 },
    ajmi: { readId: 4 },
    dosari: { readId: 210 },
};

export class TimingProvider {
    private timingsCache: Map<string, AyahTiming[]> = new Map();

    async getTimings(surahNumber: number, reciterId: string): Promise<AyahTiming[]> {
        try {
            const readId = this.getReadId(reciterId);
            const cacheKey = `${readId}-${surahNumber}`;

            if (this.timingsCache.has(cacheKey)) {
                return this.timingsCache.get(cacheKey)!;
            }

            const response = await fetch(
                `${API_BASE}/ayat_timing?surah=${surahNumber}&read=${readId}`
            );

            const data = await response.json();

            if (data?.value) {
                const timings: AyahTiming[] = data.value.map((timing: any) => ({
                    ayah: timing.ayah,
                    startTime: timing.start_time / 1000,
                    endTime: timing.end_time / 1000,
                    duration: (timing.end_time - timing.start_time) / 1000,
                    page: timing.page,
                }));

                this.timingsCache.set(cacheKey, timings);
                return timings;
            }

            return [];
        } catch (error) {
            console.error('Error fetching timings:', error);
            return [];
        }
    }

    findCurrentAyah(currentTime: number, timings: AyahTiming[]): number {
        if (!timings || timings.length === 0) {
            return 0;
        }

        for (let i = timings.length - 1; i >= 0; i--) {
            if (currentTime >= timings[i].startTime) {
                return timings[i].ayah;
            }
        }

        return timings[0].ayah;
    }

    clearCache(): void {
        this.timingsCache.clear();
    }

    getCacheInfo() {
        return {
            timings: this.timingsCache.size,
        };
    }

    private getReadId(reciterId: string): number {
        const mapping = TIMING_RECITER_MAP[reciterId];
        if (!mapping) return 118;
        return mapping.readId || mapping.fallback || 118;
    }
}
