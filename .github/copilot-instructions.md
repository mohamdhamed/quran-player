# Qur'an Player - AI Coding Instructions

## Architecture Overview

A Spotify-inspired Qur'an player (React 18 + Vite) with **three-layer audio architecture**:

```
┌─────────────────────────────────────────────────────────────────────┐
│ UI Layer: PlayerBar.jsx ─► usePlayerStore() ─► audioPlayer.js      │
├─────────────────────────────────────────────────────────────────────┤
│ Service Layer (pick one per feature):                               │
│   • mp3quranAPI.js - Full surah audio + timing from mp3quran.net   │
│   • quranaiAPI.js  - Semantic search + text from Qurani.ai         │
│   • preciseTimingService.js - Verse-by-verse sync from alquran.cloud│
├─────────────────────────────────────────────────────────────────────┤
│ Audio: Howler.js (html5 mode) → mp3quran.net servers               │
└─────────────────────────────────────────────────────────────────────┘
```

**Key insight**: Audio always comes from mp3quran.net (one file per surah). Timing/text comes from different APIs based on precision needs.

## Commands

```bash
npm run dev          # Dev server (localhost:5173)
npm run build        # Production build
npm run test         # Vitest unit tests
npm run lint:fix     # ESLint + auto-fix
```

## Critical Patterns

### 1. State Management (Zustand + Persistence)
All player state flows through `src/store/playerStore.js`:
```javascript
// Reading state - use shallow comparison for performance
import { useShallow } from 'zustand/react/shallow';
const { isPlaying, currentSurah } = usePlayerStore(
  useShallow((state) => ({ isPlaying: state.isPlaying, currentSurah: state.currentSurah }))
);

// Actions auto-persist: reciter, volume, repeatMode, favorites, recentlyPlayed
```

### 2. RTL Layout (Required for all new components)
```jsx
// ALWAYS wrap Arabic content with dir="rtl"
<div dir="rtl" className="text-right">
  <span className="font-arabic">{surah.name}</span>
</div>
```

### 3. API Rate Limiting
```javascript
// Use rateLimitedFetch for external APIs (60 req/min limit)
import { rateLimitedFetch } from '../utils/rateLimiter';
const response = await rateLimitedFetch(url);
```

### 4. Audio URL Format
```javascript
// Surah number is zero-padded to 3 digits
`${reciter.baseUrl}/${String(surahNumber).padStart(3, '0')}.mp3`
// Example: https://server8.mp3quran.net/afs/001.mp3
```

### 5. Reciter ID Mapping
When using Qurani.ai API, map local IDs:
```javascript
// mp3quranAPI.js uses: 'mishary', 'abdulbasit', 'husary'
// quranaiAPI.js needs: 'ar.alafasy', 'ar.abdulbasit', 'ar.husary'
import { mapReciterToQuranai } from '../services/quranaiAPI';
```

## File Conventions

| Location | Purpose |
|----------|---------|
| `src/pages/*.jsx` | Route components (add to `App.jsx` routes + `Sidebar.jsx`) |
| `src/components/Player/` | Player UI - uses sub-components pattern |
| `src/services/` | API wrappers - each service caches in `Map` |
| `src/data/*.json` | Static data (114 surahs, 10 reciters) |
| `src/hooks/usePlayer.js` | Optimized store selectors |

## Adding Features

### New Page
1. Create `src/pages/NewPage.jsx`
2. Add route in `App.jsx`: `<Route path="/new" element={<NewPage />} />`
3. Add nav item in `src/components/Sidebar/Sidebar.jsx`
4. Update `routeToPage` and `pageToRoute` maps in `App.jsx`

### New Reciter
1. Add to `src/data/reciters.json` with `baseUrl`
2. Add mapping in `src/services/mp3quranAPI.js` → `RECITER_MAPPING`
3. If using Qurani.ai, add to `mapReciterToQuranai()` in `quranaiAPI.js`

### Modifying Player
- Controls UI: `src/components/Player/components/` (sub-components)
- State/logic: `src/store/playerStore.js`
- Audio engine: `src/services/audioPlayer.js` (Howler wrapper)

## Styling

**Theme**: Spotify-dark with RTL support
```javascript
// tailwind.config.js colors:
'spotify-green': '#1DB954'    // Primary accent
'spotify-gray': '#121212'     // Card backgrounds  
'spotify-lightGray': '#282828' // Sidebar/player bar
```

**Fonts**: `font-arabic` (Amiri) for Quranic text, `font-sans` (Cairo) for UI

## Testing

```bash
npm run test                    # Watch mode
npm run test:coverage           # Coverage report
```

Tests use Vitest + Testing Library. Mock setup in `src/test/setup.js` handles:
- `window.matchMedia`, `localStorage`, `HTMLMediaElement`

## External APIs

| API | Used For | Rate Limit |
|-----|----------|------------|
| mp3quran.net | Audio files + precise timings | Generous |
| api.alquran.cloud | Verse text + individual ayah audio | ~60/min |
| api.qurani.ai | Semantic search | ~60/min |

## Native App (QuranPlayerNative/)

React Native version in `QuranPlayerNative/`. Separate project with own `package.json`. See `QuranPlayerNative/README.md` for setup.
