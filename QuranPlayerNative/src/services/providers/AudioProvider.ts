/**
 * Audio Provider
 * مسؤول عن جلب روابط الصوت
 */

import { RECITERS } from '../../config/reciters';

export interface ReciterConfig {
    id: string;
    name: string;
    nameEn: string;
    readId: number | null;
    fallback?: number;
    folder: string;
}

const RECITER_MAPPING: Record<string, ReciterConfig> = {
    mishary: {
        id: 'mishary',
        name: 'مشاري راشد العفاسي',
        nameEn: 'Mishary Rashid Alafasy',
        readId: null,
        fallback: 118,
        folder: 'https://server8.mp3quran.net/afs',
    },
    abdulbasit: {
        id: 'abdulbasit',
        name: 'عبد الباسط عبد الصمد',
        nameEn: 'Abdul Basit',
        readId: 53,
        folder: 'https://server7.mp3quran.net/basit',
    },
    husary: {
        id: 'husary',
        name: 'محمود خليل الحصري',
        nameEn: 'Mahmoud Khalil Al-Hussary',
        readId: 118,
        folder: 'https://server13.mp3quran.net/husr',
    },
    minshawi: {
        id: 'minshawi',
        name: 'محمد صديق المنشاوي',
        nameEn: 'Mohamed Siddiq Al-Minshawi',
        readId: 112,
        folder: 'https://server10.mp3quran.net/minsh',
    },
    sudais: {
        id: 'sudais',
        name: 'عبد الرحمن السديس',
        nameEn: 'Abdul Rahman Al-Sudais',
        readId: null,
        fallback: 31,
        folder: 'https://server11.mp3quran.net/sds',
    },
    shuraim: {
        id: 'shuraim',
        name: 'سعود الشريم',
        nameEn: 'Saud Al-Shuraim',
        readId: 31,
        folder: 'https://server7.mp3quran.net/shur',
    },
    ghamadi: {
        id: 'ghamadi',
        name: 'سعد الغامدي',
        nameEn: 'Saad Al-Ghamdi',
        readId: 24,
        folder: 'https://server7.mp3quran.net/s_gmd',
    },
    ajmi: {
        id: 'ajmi',
        name: 'أحمد بن علي العجمي',
        nameEn: 'Ahmad Al-Ajmi',
        readId: 4,
        folder: 'https://server10.mp3quran.net/ajm',
    },
    dosari: {
        id: 'dosari',
        name: 'ياسر الدوسري',
        nameEn: 'Yasser Al-Dosari',
        readId: 210,
        folder: 'https://server11.mp3quran.net/yasser',
    },
};

export class AudioProvider {
    private recitersCache: Map<number, any> = new Map();

    async getAudioUrl(reciterId: string, surahNumber: number): Promise<string | null> {
        try {
            const paddedNumber = String(surahNumber).padStart(3, '0');

            const mapping = RECITER_MAPPING[reciterId];
            if (mapping?.folder) {
                return `${mapping.folder}/${paddedNumber}.mp3`;
            }

            return null;
        } catch (error) {
            console.error('Error getting audio URL:', error);
            return null;
        }
    }

    getReciters(): ReciterConfig[] {
        return Object.values(RECITER_MAPPING);
    }

    getReciterById(reciterId: string): ReciterConfig | undefined {
        return RECITER_MAPPING[reciterId];
    }

    clearCache(): void {
        this.recitersCache.clear();
    }

    getCacheInfo() {
        return {
            reciters: this.recitersCache.size,
        };
    }
}

export { RECITER_MAPPING };
