import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import surahsData from '../data/surahs.json';

export const usePlayerStore = create(
  persist(
    (set, get) => ({
      // State
      currentSurah: null,
      currentReciter: 'mishary',
      isPlaying: false,
      volume: 0.8,
      currentTime: 0,
      duration: 0,
      repeatMode: 'none', // 'none' | 'one' | 'all'
      playbackSpeed: 1, // 0.5 - 2
      queue: [...surahsData],
      favorites: [],
      recentlyPlayed: [],
      playlists: [], // Array of {id, name, description, surahs[], createdAt}
      theme: 'dark',
      language: 'ar',
      
      // Actions
      setCurrentSurah: (surah) => set({ currentSurah: surah }),
      
      setCurrentReciter: (reciterId) => set({ currentReciter: reciterId }),
      
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      
      setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
      
      setTheme: (theme) => set({ theme }),
      
      setLanguage: (lang) => set({ language: lang }),
      
      togglePlay: () => set({ isPlaying: !get().isPlaying }),
      
      setVolume: (volume) => {
        set({ volume });
      },
      
      setCurrentTime: (time) => set({ currentTime: time }),
      
      setDuration: (duration) => set({ duration }),
      
      playSurah: (surah) => {
        const { recentlyPlayed } = get();
        
        // Add to recently played (keep last 20)
        const updated = [surah, ...recentlyPlayed.filter(s => s.number !== surah.number)].slice(0, 20);
        
        set({ 
          currentSurah: surah, 
          isPlaying: true,
          recentlyPlayed: updated
        });
      },
      
      nextSurah: () => {
        const { queue, currentSurah, repeatMode } = get();
        
        if (repeatMode === 'one') {
          set({ isPlaying: true });
          return;
        }
        
        const currentIndex = queue.findIndex(s => s.number === currentSurah?.number);
        
        if (currentIndex < queue.length - 1) {
          set({ 
            currentSurah: queue[currentIndex + 1], 
            isPlaying: true 
          });
        } else if (repeatMode === 'all') {
          set({ 
            currentSurah: queue[0], 
            isPlaying: true 
          });
        } else {
          set({ isPlaying: false });
        }
      },
      
      previousSurah: () => {
        const { queue, currentSurah, currentTime } = get();
        
        // If more than 3 seconds played, restart current surah
        if (currentTime > 3) {
          set({ currentTime: 0 });
          return;
        }
        
        const currentIndex = queue.findIndex(s => s.number === currentSurah?.number);
        
        if (currentIndex > 0) {
          set({ 
            currentSurah: queue[currentIndex - 1], 
            isPlaying: true 
          });
        }
      },
      
      setRepeatMode: (mode) => set({ repeatMode: mode }),
      
      cycleRepeatMode: () => {
        const modes = ['none', 'all', 'one'];
        const currentMode = get().repeatMode;
        const nextIndex = (modes.indexOf(currentMode) + 1) % modes.length;
        set({ repeatMode: modes[nextIndex] });
      },
      
      toggleFavorite: (surah) => {
        const { favorites } = get();
        const isFavorite = favorites.some(s => s.number === surah.number);
        
        if (isFavorite) {
          set({ favorites: favorites.filter(s => s.number !== surah.number) });
        } else {
          set({ favorites: [...favorites, surah] });
        }
      },
      
      isFavorite: (surah) => {
        return get().favorites.some(s => s.number === surah.number);
      },
      
      setQueue: (queue) => set({ queue }),
      
      addToQueue: (surah) => {
        const { queue } = get();
        if (!queue.some(s => s.number === surah.number)) {
          set({ queue: [...queue, surah] });
        }
      },
      
      clearQueue: () => set({ queue: [...surahsData] }),
      
      searchSurahs: (query) => {
        if (!query) return surahsData;
        
        const lowerQuery = query.toLowerCase();
        return surahsData.filter(surah => 
          surah.name.includes(query) ||
          surah.nameEn.toLowerCase().includes(lowerQuery) ||
          surah.nameTranslation.toLowerCase().includes(lowerQuery) ||
          String(surah.number).includes(query)
        );
      },

      // Playlist Actions
      createPlaylist: (name, description = '') => {
        const { playlists } = get();
        const newPlaylist = {
          id: Date.now().toString(),
          name,
          description,
          surahs: [],
          createdAt: new Date().toISOString()
        };
        set({ playlists: [...playlists, newPlaylist] });
        return newPlaylist;
      },

      deletePlaylist: (playlistId) => {
        const { playlists } = get();
        set({ playlists: playlists.filter(p => p.id !== playlistId) });
      },

      updatePlaylist: (playlistId, updates) => {
        const { playlists } = get();
        set({ 
          playlists: playlists.map(p => 
            p.id === playlistId ? { ...p, ...updates } : p
          ) 
        });
      },

      addToPlaylist: (playlistId, surah) => {
        const { playlists } = get();
        set({
          playlists: playlists.map(p => {
            if (p.id === playlistId) {
              // Check if surah already exists
              if (p.surahs.some(s => s.number === surah.number)) {
                return p;
              }
              return { ...p, surahs: [...p.surahs, surah] };
            }
            return p;
          })
        });
      },

      removeFromPlaylist: (playlistId, surahNumber) => {
        const { playlists } = get();
        set({
          playlists: playlists.map(p => {
            if (p.id === playlistId) {
              return { ...p, surahs: p.surahs.filter(s => s.number !== surahNumber) };
            }
            return p;
          })
        });
      },

      playPlaylist: (playlistId) => {
        const { playlists } = get();
        const playlist = playlists.find(p => p.id === playlistId);
        
        if (playlist && playlist.surahs.length > 0) {
          set({ 
            queue: playlist.surahs,
            currentSurah: playlist.surahs[0],
            isPlaying: true
          });
        }
      },

      getPlaylist: (playlistId) => {
        return get().playlists.find(p => p.id === playlistId);
      }
    }),
    {
      name: 'quraan-player-storage',
      partialize: (state) => ({ 
        currentReciter: state.currentReciter,
        volume: state.volume,
        repeatMode: state.repeatMode,
        playbackSpeed: state.playbackSpeed,
        favorites: state.favorites,
        recentlyPlayed: state.recentlyPlayed,
        playlists: state.playlists,
        theme: state.theme,
        language: state.language
      })
    }
  )
);
