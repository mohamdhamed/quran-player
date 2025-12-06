/**
 * Player Store Tests
 * 
 * اختبارات وحدة لـ playerStore
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { usePlayerStore } from '../store/playerStore';

// Sample surah data for testing
const mockSurah1 = {
  number: 1,
  name: 'الفاتحة',
  nameEn: 'Al-Fatiha',
  nameTranslation: 'The Opening',
  verses: 7,
  revelationType: 'Meccan'
};

const mockSurah2 = {
  number: 2,
  name: 'البقرة',
  nameEn: 'Al-Baqarah',
  nameTranslation: 'The Cow',
  verses: 286,
  revelationType: 'Medinan'
};

describe('Player Store', () => {
  beforeEach(() => {
    // Reset store before each test
    usePlayerStore.setState({
      currentSurah: null,
      isPlaying: false,
      favorites: [],
      playlists: [],
      volume: 0.8,
      repeatMode: 'none',
      playbackSpeed: 1,
      recentlyPlayed: []
    });
  });

  describe('Player State', () => {
    it('should have initial state', () => {
      const state = usePlayerStore.getState();
      expect(state.currentSurah).toBeNull();
      expect(state.isPlaying).toBe(false);
      expect(state.volume).toBe(0.8);
    });

    it('should toggle play state', () => {
      const { togglePlay } = usePlayerStore.getState();
      
      togglePlay();
      expect(usePlayerStore.getState().isPlaying).toBe(true);
      
      togglePlay();
      expect(usePlayerStore.getState().isPlaying).toBe(false);
    });

    it('should set volume', () => {
      const { setVolume } = usePlayerStore.getState();
      
      setVolume(0.5);
      expect(usePlayerStore.getState().volume).toBe(0.5);
    });

    it('should play a surah', () => {
      const { playSurah } = usePlayerStore.getState();
      
      playSurah(mockSurah1);
      
      const state = usePlayerStore.getState();
      expect(state.currentSurah).toEqual(mockSurah1);
      expect(state.isPlaying).toBe(true);
    });

    it('should add to recently played when playing surah', () => {
      const { playSurah } = usePlayerStore.getState();
      
      playSurah(mockSurah1);
      playSurah(mockSurah2);
      
      const { recentlyPlayed } = usePlayerStore.getState();
      expect(recentlyPlayed).toHaveLength(2);
      expect(recentlyPlayed[0]).toEqual(mockSurah2);
      expect(recentlyPlayed[1]).toEqual(mockSurah1);
    });
  });

  describe('Repeat Mode', () => {
    it('should cycle through repeat modes', () => {
      const { cycleRepeatMode } = usePlayerStore.getState();
      
      expect(usePlayerStore.getState().repeatMode).toBe('none');
      
      cycleRepeatMode();
      expect(usePlayerStore.getState().repeatMode).toBe('all');
      
      cycleRepeatMode();
      expect(usePlayerStore.getState().repeatMode).toBe('one');
      
      cycleRepeatMode();
      expect(usePlayerStore.getState().repeatMode).toBe('none');
    });
  });

  describe('Favorites', () => {
    it('should toggle favorite', () => {
      const { toggleFavorite, isFavorite } = usePlayerStore.getState();
      
      // Add to favorites
      toggleFavorite(mockSurah1);
      expect(usePlayerStore.getState().favorites).toHaveLength(1);
      expect(isFavorite(mockSurah1)).toBe(true);
      
      // Remove from favorites
      toggleFavorite(mockSurah1);
      expect(usePlayerStore.getState().favorites).toHaveLength(0);
    });

    it('should not duplicate favorites', () => {
      const { toggleFavorite } = usePlayerStore.getState();
      
      toggleFavorite(mockSurah1);
      toggleFavorite(mockSurah1);
      
      expect(usePlayerStore.getState().favorites).toHaveLength(0);
    });
  });

  describe('Playlists', () => {
    it('should create a playlist', () => {
      const { createPlaylist } = usePlayerStore.getState();
      
      const playlist = createPlaylist('قائمتي', 'قائمة تشغيل تجريبية');
      
      expect(playlist.name).toBe('قائمتي');
      expect(playlist.description).toBe('قائمة تشغيل تجريبية');
      expect(playlist.surahs).toHaveLength(0);
      expect(usePlayerStore.getState().playlists).toHaveLength(1);
    });

    it('should delete a playlist', () => {
      const { createPlaylist, deletePlaylist } = usePlayerStore.getState();
      
      const playlist = createPlaylist('للحذف');
      deletePlaylist(playlist.id);
      
      expect(usePlayerStore.getState().playlists).toHaveLength(0);
    });

    it('should add surah to playlist', () => {
      const { createPlaylist, addToPlaylist, getPlaylist } = usePlayerStore.getState();
      
      const playlist = createPlaylist('قائمتي');
      addToPlaylist(playlist.id, mockSurah1);
      
      const updated = getPlaylist(playlist.id);
      expect(updated.surahs).toHaveLength(1);
      expect(updated.surahs[0]).toEqual(mockSurah1);
    });

    it('should not duplicate surah in playlist', () => {
      const { createPlaylist, addToPlaylist, getPlaylist } = usePlayerStore.getState();
      
      const playlist = createPlaylist('قائمتي');
      addToPlaylist(playlist.id, mockSurah1);
      addToPlaylist(playlist.id, mockSurah1);
      
      const updated = getPlaylist(playlist.id);
      expect(updated.surahs).toHaveLength(1);
    });

    it('should remove surah from playlist', () => {
      const { createPlaylist, addToPlaylist, removeFromPlaylist, getPlaylist } = usePlayerStore.getState();
      
      const playlist = createPlaylist('قائمتي');
      addToPlaylist(playlist.id, mockSurah1);
      addToPlaylist(playlist.id, mockSurah2);
      removeFromPlaylist(playlist.id, mockSurah1.number);
      
      const updated = getPlaylist(playlist.id);
      expect(updated.surahs).toHaveLength(1);
      expect(updated.surahs[0].number).toBe(2);
    });
  });

  describe('Search', () => {
    it('should search surahs by Arabic name', () => {
      const { searchSurahs } = usePlayerStore.getState();
      
      const results = searchSurahs('الفاتحة');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe('الفاتحة');
    });

    it('should search surahs by English name', () => {
      const { searchSurahs } = usePlayerStore.getState();
      
      const results = searchSurahs('fatiha');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should search surahs by number', () => {
      const { searchSurahs } = usePlayerStore.getState();
      
      const results = searchSurahs('1');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return all surahs for empty query', () => {
      const { searchSurahs } = usePlayerStore.getState();
      
      const results = searchSurahs('');
      expect(results.length).toBe(114);
    });
  });

  describe('Playback Speed', () => {
    it('should set playback speed', () => {
      const { setPlaybackSpeed } = usePlayerStore.getState();
      
      setPlaybackSpeed(1.5);
      expect(usePlayerStore.getState().playbackSpeed).toBe(1.5);
    });
  });
});
