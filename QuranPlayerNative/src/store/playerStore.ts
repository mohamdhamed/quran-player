/**
 * Player Store
 * إدارة حالة المشغل باستخدام Zustand
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Surah } from '../config/surahs';

export interface PlayerState {
    // Player State
    currentSurah: Surah | null;
    currentReciter: string;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    repeatMode: 'none' | 'one' | 'all';
    playbackSpeed: number;

    // Favorites
    favorites: Surah[];

    // Recently Played
    recentlyPlayed: Surah[];

    // Queue
    queue: Surah[];

    // Actions
    setCurrentSurah: (surah: Surah | null) => void;
    setCurrentReciter: (reciter: string) => void;
    setIsPlaying: (isPlaying: boolean) => void;
    togglePlay: () => void;
    setCurrentTime: (time: number) => void;
    setDuration: (duration: number) => void;
    setVolume: (volume: number) => void;
    cycleRepeatMode: () => void;
    setPlaybackSpeed: (speed: number) => void;

    // Favorites
    toggleFavorite: (surah: Surah) => void;
    isFavorite: (surah: Surah) => boolean;

    // Recently Played
    addToRecentlyPlayed: (surah: Surah) => void;

    // Navigation
    nextSurah: () => void;
    previousSurah: () => void;

    // Queue
    addToQueue: (surah: Surah) => void;
    removeFromQueue: (surahNumber: number) => void;
    clearQueue: () => void;
}

export const usePlayerStore = create<PlayerState>()(
    persist(
        (set, get) => ({
            // Initial State
            currentSurah: null,
            currentReciter: 'mishary',
            isPlaying: false,
            currentTime: 0,
            duration: 0,
            volume: 1,
            repeatMode: 'none',
            playbackSpeed: 1,
            favorites: [],
            recentlyPlayed: [],
            queue: [],

            // Actions
            setCurrentSurah: surah => {
                set({ currentSurah: surah, currentTime: 0 });
                if (surah) {
                    get().addToRecentlyPlayed(surah);
                }
            },

            setCurrentReciter: reciter => set({ currentReciter: reciter }),

            setIsPlaying: isPlaying => set({ isPlaying }),

            togglePlay: () => set(state => ({ isPlaying: !state.isPlaying })),

            setCurrentTime: time => set({ currentTime: time }),

            setDuration: duration => set({ duration }),

            setVolume: volume => set({ volume: Math.max(0, Math.min(1, volume)) }),

            cycleRepeatMode: () =>
                set(state => {
                    const modes: Array<'none' | 'one' | 'all'> = ['none', 'one', 'all'];
                    const currentIndex = modes.indexOf(state.repeatMode);
                    const nextIndex = (currentIndex + 1) % modes.length;
                    return { repeatMode: modes[nextIndex] };
                }),

            setPlaybackSpeed: speed => set({ playbackSpeed: speed }),

            // Favorites
            toggleFavorite: surah =>
                set(state => {
                    const exists = state.favorites.some(f => f.number === surah.number);
                    if (exists) {
                        return {
                            favorites: state.favorites.filter(f => f.number !== surah.number),
                        };
                    }
                    return { favorites: [...state.favorites, surah] };
                }),

            isFavorite: surah => get().favorites.some(f => f.number === surah.number),

            // Recently Played
            addToRecentlyPlayed: surah =>
                set(state => {
                    const filtered = state.recentlyPlayed.filter(
                        s => s.number !== surah.number,
                    );
                    return {
                        recentlyPlayed: [surah, ...filtered].slice(0, 10),
                    };
                }),

            // Navigation
            nextSurah: () => {
                const { currentSurah, queue, repeatMode } = get();
                if (!currentSurah) return;

                // Check queue first
                if (queue.length > 0) {
                    const next = queue[0];
                    set(state => ({
                        currentSurah: next,
                        queue: state.queue.slice(1),
                        currentTime: 0,
                    }));
                    get().addToRecentlyPlayed(next);
                    return;
                }

                // Repeat one
                if (repeatMode === 'one') {
                    set({ currentTime: 0 });
                    return;
                }

                // Next surah
                const nextNumber = currentSurah.number + 1;
                if (nextNumber <= 114) {
                    // Will be loaded from SURAHS config
                    set({ currentTime: 0 });
                } else if (repeatMode === 'all') {
                    // Go back to first surah
                    set({ currentTime: 0 });
                }
            },

            previousSurah: () => {
                const { currentSurah, currentTime } = get();
                if (!currentSurah) return;

                // If more than 3 seconds in, restart current
                if (currentTime > 3) {
                    set({ currentTime: 0 });
                    return;
                }

                // Previous surah
                const prevNumber = currentSurah.number - 1;
                if (prevNumber >= 1) {
                    set({ currentTime: 0 });
                }
            },

            // Queue
            addToQueue: surah =>
                set(state => ({
                    queue: [...state.queue, surah],
                })),

            removeFromQueue: surahNumber =>
                set(state => ({
                    queue: state.queue.filter(s => s.number !== surahNumber),
                })),

            clearQueue: () => set({ queue: [] }),
        }),
        {
            name: 'quran-player-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: state => ({
                currentReciter: state.currentReciter,
                volume: state.volume,
                repeatMode: state.repeatMode,
                playbackSpeed: state.playbackSpeed,
                favorites: state.favorites,
                recentlyPlayed: state.recentlyPlayed,
            }),
        },
    ),
);
