/**
 * useKeyboardShortcuts Hook
 * 
 * اختصارات لوحة المفاتيح للتحكم بالمشغل
 * Keyboard shortcuts for player controls
 * 
 * Shortcuts:
 * - Space: Play/Pause
 * - ArrowRight: Next surah
 * - ArrowLeft: Previous surah
 * - ArrowUp: Volume up (+10%)
 * - ArrowDown: Volume down (-10%)
 * - M: Mute/Unmute
 * - R: Cycle repeat mode
 * - F: Toggle favorite
 * - /: Focus search
 * - Escape: Close modals/menus
 */

import { useEffect, useCallback, useRef } from 'react';
import { usePlayerStore } from '../store/playerStore';

export function useKeyboardShortcuts() {
  const previousVolume = useRef(0.8);
  
  const {
    togglePlay,
    nextSurah,
    previousSurah,
    volume,
    setVolume,
    cycleRepeatMode,
    currentSurah,
    toggleFavorite
  } = usePlayerStore();

  const handleKeyDown = useCallback((event) => {
    // Ignore if typing in input/textarea
    const target = event.target;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      // Allow Escape even in inputs
      if (event.key !== 'Escape') return;
    }

    switch (event.key) {
      case ' ':
        // Space: Play/Pause
        event.preventDefault();
        togglePlay();
        break;

      case 'ArrowRight':
        // Right Arrow: Next surah
        if (!event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          nextSurah();
        }
        break;

      case 'ArrowLeft':
        // Left Arrow: Previous surah
        if (!event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          previousSurah();
        }
        break;

      case 'ArrowUp':
        // Up Arrow: Volume up
        event.preventDefault();
        setVolume(Math.min(1, volume + 0.1));
        break;

      case 'ArrowDown':
        // Down Arrow: Volume down
        event.preventDefault();
        setVolume(Math.max(0, volume - 0.1));
        break;

      case 'm':
      case 'M':
        // M: Mute/Unmute
        event.preventDefault();
        if (volume > 0) {
          previousVolume.current = volume;
          setVolume(0);
        } else {
          setVolume(previousVolume.current || 0.8);
        }
        break;

      case 'r':
      case 'R':
        // R: Cycle repeat mode
        if (!event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          cycleRepeatMode();
        }
        break;

      case 'f':
      case 'F':
        // F: Toggle favorite (if surah is playing)
        if (!event.ctrlKey && !event.metaKey && currentSurah) {
          event.preventDefault();
          toggleFavorite(currentSurah);
        }
        break;

      case '/': {
        // /: Focus search input
        event.preventDefault();
        const searchInput = document.querySelector('input[type="text"][placeholder*="بحث"], input[type="search"]');
        if (searchInput) {
          searchInput.focus();
        }
        break;
      }

      case 'Escape':
        // Escape: Blur active element / close modals
        if (document.activeElement) {
          document.activeElement.blur();
        }
        break;

      default:
        break;
    }
  }, [togglePlay, nextSurah, previousSurah, volume, setVolume, cycleRepeatMode, currentSurah, toggleFavorite]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Keyboard Shortcuts Reference
 * For displaying in UI
 */
export const KEYBOARD_SHORTCUTS = [
  { key: 'Space', action: 'تشغيل / إيقاف', actionEn: 'Play/Pause' },
  { key: '→', action: 'السورة التالية', actionEn: 'Next Surah' },
  { key: '←', action: 'السورة السابقة', actionEn: 'Previous Surah' },
  { key: '↑', action: 'رفع الصوت', actionEn: 'Volume Up' },
  { key: '↓', action: 'خفض الصوت', actionEn: 'Volume Down' },
  { key: 'M', action: 'كتم / إلغاء الكتم', actionEn: 'Mute/Unmute' },
  { key: 'R', action: 'تغيير وضع التكرار', actionEn: 'Cycle Repeat' },
  { key: 'F', action: 'إضافة للمفضلة', actionEn: 'Toggle Favorite' },
  { key: '/', action: 'البحث', actionEn: 'Focus Search' },
  { key: 'Esc', action: 'إغلاق', actionEn: 'Close/Blur' },
];

export default useKeyboardShortcuts;
