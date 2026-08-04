/**
 * Text Provider
 * مسؤول عن جلب النصوص القرآنية
 */

const API_BASE = 'https://api.alquran.cloud/v1';

export interface SurahInfo {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: 'Meccan' | 'Medinan';
}

export interface Ayah {
    number: number;
    text: string;
    numberInSurah: number;
    juz: number;
    manzil: number;
    page: number;
    ruku: number;
    hizbQuarter: number;
}

export interface SurahData extends SurahInfo {
    ayahs: Ayah[];
}

export class TextProvider {
    private surahInfoCache: Map<number, SurahInfo> = new Map();

    async getSurahText(surahNumber: number): Promise<SurahData | null> {
        try {
            const response = await fetch(
                `${API_BASE}/surah/${surahNumber}/quran-simple`
            );
            const data = await response.json();

            if (data.code === 200) {
                return data.data;
            }

            return null;
        } catch (error) {
            console.error('Error fetching surah text:', error);
            return null;
        }
    }

    async getSurahInfo(surahNumber: number): Promise<SurahInfo | null> {
        if (this.surahInfoCache.has(surahNumber)) {
            return this.surahInfoCache.get(surahNumber)!;
        }

        try {
            const response = await fetch(
                `${API_BASE}/surah/${surahNumber}/quran-simple`
            );
            const data = await response.json();

            if (data.code === 200) {
                const info: SurahInfo = {
                    number: data.data.number,
                    name: data.data.name,
                    englishName: data.data.englishName,
                    englishNameTranslation: data.data.englishNameTranslation,
                    numberOfAyahs: data.data.numberOfAyahs,
                    revelationType: data.data.revelationType,
                };

                this.surahInfoCache.set(surahNumber, info);
                return info;
            }

            return null;
        } catch (error) {
            console.error('Error fetching surah info:', error);
            return null;
        }
    }

    clearCache(): void {
        this.surahInfoCache.clear();
    }

    getCacheInfo() {
        return {
            surahInfo: this.surahInfoCache.size,
        };
    }
}
