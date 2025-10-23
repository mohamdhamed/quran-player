# Qur'an Player - AI Coding Instructions

## Project Overview
A modern web-based Qur'an player inspired by Spotify's UI/UX, built with React, Tailwind CSS, and Howler.js for audio playback. Progressive Web App (PWA) capable for future desktop and mobile deployment.

## Technology Stack

- **Framework**: React 18+ with Vite
- **Styling**: Tailwind CSS (Spotify-like dark theme, RTL support)
- **State Management**: Zustand (lightweight, persistent)
- **Audio**: Howler.js (cross-browser audio streaming)
- **PWA**: Vite PWA Plugin with Workbox
- **Icons**: Lucide React

## Project Structure

```
src/
├── components/
│   ├── Player/PlayerBar.jsx    # Bottom audio player controls
│   └── Sidebar/Sidebar.jsx     # Left navigation sidebar
├── pages/
│   ├── Home.jsx                # Main dashboard with popular surahs
│   ├── Library.jsx             # Full surah list with search
│   └── Favorites.jsx           # User's favorite surahs
├── services/
│   ├── audioPlayer.js          # Howler.js audio service wrapper
│   └── quranAPI.js             # Audio URLs and API integration
├── store/
│   └── playerStore.js          # Zustand state management
├── data/
│   ├── surahs.json             # 114 surahs metadata
│   └── reciters.json           # Available reciters with base URLs
├── styles/
│   └── globals.css             # Tailwind + custom Spotify-like styles
└── App.jsx                     # Main app component with routing
```

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Core Patterns

### Audio Playback
- Audio streaming via Howler.js (`src/services/audioPlayer.js`)
- MP3 files from mp3quran.net servers
- URL format: `{baseUrl}/{surah:003}.mp3`
- Auto-advance to next surah on completion
- Real-time progress tracking with 1-second intervals

### Precise Verse Synchronization (NEW! ✨)
- **Service**: `src/services/verseTimingService.js`
- **Method**: Fetch metadata from verse-by-verse audio files (everyayah.com)
- **Process**:
  1. Load individual MP3 file metadata for each verse
  2. Calculate duration of each verse from audio metadata
  3. Build timing table: `[{verse: 1, startTime: 0, endTime: 4.2, duration: 4.2}, ...]`
  4. Cache timings in Map for instant reuse
  5. Use `getCurrentVerseFromTimings(currentTime, timings)` for 100% accurate sync
- **Fallback**: Progress-based estimation if precise timings unavailable
- **Reciters**: All 5 reciters support precise sync via everyayah.com
- **Performance**: 2-30s initial load (depends on verses count), instant after caching
- **UI Indicator**: Shows "✓ تزامن دقيق" (precise) or "⚠️ تزامن تقديري" (estimated)

### State Management (Zustand)
- **Player state**: currentSurah, isPlaying, volume, currentTime, duration
- **Repeat modes**: 'none', 'all', 'one'
- **Persistence**: reciter, volume, repeatMode, favorites, recentlyPlayed
- **Queue management**: All 114 surahs by default

### UI Components
- **RTL Layout**: All Arabic text right-aligned with `dir="rtl"`
- **Spotify Theme**: Dark background (#121212), green accent (#1DB954)
- **Player Bar**: Fixed bottom bar with progress, controls, volume
- **Surah Cards**: Hover effects, play buttons, current playing indicator

### Data Structure
```javascript
// Surah object
{
  number: 1,
  name: "الفاتحة",
  nameEn: "Al-Fatiha",
  nameTranslation: "The Opening",
  verses: 7,
  revelationType: "Meccan"
}

// Reciter object
{
  id: "mishary",
  name: "مشاري راشد العفاسي",
  nameEn: "Mishary Rashid Alafasy",
  country: "الكويت",
  baseUrl: "https://server8.mp3quran.net/afs"
}
```

## Key Features

### Implemented
✅ Audio playback with play/pause/seek controls
✅ Next/Previous surah navigation
✅ Volume control with visual indicator
✅ Repeat modes (none/all/one)
✅ Favorites system with heart icon
✅ Recently played tracking (last 20)
✅ Full surah library with search
✅ Arabic text with RTL support
✅ Spotify-like dark theme
✅ Progress bar with time display
✅ Reciter selection (5 reciters available)
✅ Playback speed control (0.5x - 2x)
✅ Settings page with customization options
✅ Smooth animations (60fps cubic-bezier)
✅ **Semantic Search** (AI-powered from Qurani.ai) 🆕
✅ **Quran Text Viewer** (precise ayah-by-ayah sync) 🆕
✅ **Qurani.ai API Service** (8 functions) 🆕

### To Implement
- [ ] Offline mode (download surahs)
- [ ] Playlist creation
- [ ] Translation display (English, etc.)
- [ ] Keyboard shortcuts
- [ ] Theme switcher (dark/light)
- [ ] Language switcher (AR/EN)
- [ ] Persistent timing cache (localStorage)
- [ ] Preload timings for next surah
- [ ] Word-by-word synchronization (advanced)

## RTL (Right-to-Left) Support

All pages use `dir="rtl"` for proper Arabic text flow:
```jsx
<div dir="rtl">...</div>
```

CSS classes for Arabic:
```css
.arabic-text {
  @apply font-arabic;
  font-size: 1.125rem;
  line-height: 1.8;
}
```

## Styling Conventions

### Tailwind Custom Classes
- `.sidebar-item`: Navigation menu items
- `.surah-card`: Surah display cards with hover
- `.play-button`: Large circular play button
- `.play-button-sm`: Small play button for cards
- `.search-input`: Rounded search input field

### Color Palette
- `spotify-black`: #000000 (main background)
- `spotify-gray`: #121212 (cards background)
- `spotify-lightGray`: #282828 (sidebar, player bar)
- `spotify-green`: #1DB954 (primary accent)
- `spotify-darkGreen`: #1aa34a (hover state)

## Audio API Integration

### Reciters Base URLs
```javascript
const RECITERS = {
  mishary: "https://server8.mp3quran.net/afs",
  abdulbasit: "https://server7.mp3quran.net/basit",
  husary: "https://server11.mp3quran.net/husary",
  sudais: "https://server11.mp3quran.net/sds"
};
```

### Audio URL Generator
```javascript
getAudioUrl(reciterId, surahNumber)
// Returns: "https://server8.mp3quran.net/afs/001.mp3"
```

## State Management Details

### Player Actions
- `playSurah(surah)`: Play specific surah, add to recently played
- `nextSurah()`: Play next in queue or loop if repeat=all
- `previousSurah()`: Play previous or restart if >3 seconds
- `togglePlay()`: Toggle play/pause state
- `cycleRepeatMode()`: Cycle through none → all → one
- `toggleFavorite(surah)`: Add/remove from favorites

### Persistence
Automatically saved to localStorage:
- Selected reciter
- Volume level
- Repeat mode
- Favorites list
- Recently played list

## PWA Configuration

- **Manifest**: RTL, Arabic, portrait orientation
- **Service Worker**: Caches audio files for offline playback
- **Cache Strategy**: CacheFirst for mp3quran.net audio
- **Max Entries**: 50 surahs cached
- **Expiration**: 30 days

## Testing Considerations

### Critical Tests
- Audio playback on Chrome, Firefox, Safari
- RTL layout rendering correctness
- Arabic font loading (Amiri, Cairo)
- State persistence after page refresh
- Progress bar seek accuracy
- Volume control responsiveness
- Repeat mode logic (especially 'one')
- Favorites sync across page loads

### Known Limitations
- Requires internet for first-time audio streaming
- Browser autoplay policies may require user interaction
- PWA installation varies by browser

## Quick Start for AI Agents

1. **Install dependencies**: `npm install`
2. **Run dev server**: `npm run dev`
3. **Test audio playback**: Click any surah in Library or Home
4. **Check state persistence**: Refresh page, verify reciter/volume/favorites persist
5. **Test RTL**: Verify all Arabic text aligns right

## Common Tasks

### Adding a New Reciter
1. Add entry to `src/data/reciters.json`
2. Verify baseUrl works: `{baseUrl}/001.mp3`
3. Test audio playback

### Adding a New Page
1. Create component in `src/pages/`
2. Add route to `App.jsx`
3. Add menu item to `Sidebar.jsx`

### Modifying Player Controls
- PlayerBar component: `src/components/Player/PlayerBar.jsx`
- Player state: `src/store/playerStore.js`
- Audio service: `src/services/audioPlayer.js`

## References

- **Quran Audio**: mp3quran.net
- **Quran API**: api.alquran.cloud
- **Howler.js Docs**: howlerjs.com
- **Zustand Docs**: github.com/pmndrs/zustand
- **Tailwind CSS**: tailwindcss.com

---

**Current Status**: ✅ Feature 1 (Semantic Search) & Feature 2 (Precise Timing) COMPLETE! Using ONLY Qurani.ai API. See `FEATURES_COMPLETE.md` for details.
