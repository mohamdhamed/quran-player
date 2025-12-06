/**
 * usePlayer Hook
 * 
 * Custom hook لتسهيل استخدام Player Store
 * Provides optimized selectors and common player operations
 */

import { useCallback, useMemo } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useShallow } from 'zustand/react/shallow';

/**
 * Hook للتحكم الأساسي بالمشغل
 * Basic player controls
 */
export function usePlayerControls() {
  const { 
    isPlaying, 
    togglePlay, 
    nextSurah, 
    previousSurah,
    setVolume,
    volume 
  } = usePlayerStore(
    useShallow((state) => ({
      isPlaying: state.isPlaying,
      togglePlay: state.togglePlay,
      nextSurah: state.nextSurah,
      previousSurah: state.previousSurah,
      setVolume: state.setVolume,
      volume: state.volume
    }))
  );

  return { isPlaying, togglePlay, nextSurah, previousSurah, setVolume, volume };
}

/**
 * Hook للسورة الحالية
 * Current surah info
 */
export function useCurrentSurah() {
  const { currentSurah, playSurah, currentTime, duration } = usePlayerStore(
    useShallow((state) => ({
      currentSurah: state.currentSurah,
      playSurah: state.playSurah,
      currentTime: state.currentTime,
      duration: state.duration
    }))
  );

  const progress = useMemo(() => {
    if (!duration) return 0;
    return (currentTime / duration) * 100;
  }, [currentTime, duration]);

  return { currentSurah, playSurah, currentTime, duration, progress };
}

/**
 * Hook للمفضلة
 * Favorites management
 */
export function useFavorites() {
  const { favorites, toggleFavorite, isFavorite } = usePlayerStore(
    useShallow((state) => ({
      favorites: state.favorites,
      toggleFavorite: state.toggleFavorite,
      isFavorite: state.isFavorite
    }))
  );

  const checkIsFavorite = useCallback(
    (surah) => favorites.some(s => s.number === surah?.number),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite, checkIsFavorite };
}

/**
 * Hook لقوائم التشغيل
 * Playlist management
 */
export function usePlaylists() {
  const { 
    playlists, 
    createPlaylist, 
    deletePlaylist, 
    addToPlaylist, 
    removeFromPlaylist,
    playPlaylist,
    getPlaylist 
  } = usePlayerStore(
    useShallow((state) => ({
      playlists: state.playlists,
      createPlaylist: state.createPlaylist,
      deletePlaylist: state.deletePlaylist,
      addToPlaylist: state.addToPlaylist,
      removeFromPlaylist: state.removeFromPlaylist,
      playPlaylist: state.playPlaylist,
      getPlaylist: state.getPlaylist
    }))
  );

  return { 
    playlists, 
    createPlaylist, 
    deletePlaylist, 
    addToPlaylist, 
    removeFromPlaylist,
    playPlaylist,
    getPlaylist,
    playlistCount: playlists.length
  };
}

/**
 * Hook لإعدادات التشغيل
 * Playback settings
 */
export function usePlaybackSettings() {
  const { 
    repeatMode, 
    cycleRepeatMode, 
    playbackSpeed, 
    setPlaybackSpeed,
    currentReciter,
    setCurrentReciter
  } = usePlayerStore(
    useShallow((state) => ({
      repeatMode: state.repeatMode,
      cycleRepeatMode: state.cycleRepeatMode,
      playbackSpeed: state.playbackSpeed,
      setPlaybackSpeed: state.setPlaybackSpeed,
      currentReciter: state.currentReciter,
      setCurrentReciter: state.setCurrentReciter
    }))
  );

  return { 
    repeatMode, 
    cycleRepeatMode, 
    playbackSpeed, 
    setPlaybackSpeed,
    currentReciter,
    setCurrentReciter
  };
}

/**
 * Hook للبحث
 * Search functionality
 */
export function useSearch() {
  const searchSurahs = usePlayerStore((state) => state.searchSurahs);
  return { searchSurahs };
}

/**
 * Hook للسور المشغلة مؤخراً
 * Recently played
 */
export function useRecentlyPlayed() {
  const recentlyPlayed = usePlayerStore((state) => state.recentlyPlayed);
  return { recentlyPlayed };
}
