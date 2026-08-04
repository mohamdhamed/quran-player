import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useState, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import PlayerBar from './components/Player/PlayerBar';
import BottomNav from './components/Navigation/BottomNav';
import ToastContainer from './components/UI/ToastContainer';
import { useToast } from './hooks/useToast';
// الرئيسية فورية - هي أول شاشة بتتفتح.
// الباقي بيتحمّل أول ما المستخدم يروح له، فما بيتقلش على أول فتح.
import Home from './pages/Home';

const Library = lazy(() => import('./pages/Library'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Playlists = lazy(() => import('./pages/Playlists'));
const Settings = lazy(() => import('./pages/Settings'));
const SmartSearch = lazy(() => import('./pages/SmartSearch'));
import { Menu, X } from 'lucide-react';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useMediaSession } from './hooks/useMediaSession';
import { useTheme } from './hooks/useTheme';
import { useLanguage } from './i18n';

// Map routes to page IDs for navigation state
const routeToPage = {
  '/': 'home',
  '/library': 'library',
  '/favorites': 'favorites',
  '/playlists': 'playlists',
  '/search': 'smartsearch',
  '/settings': 'settings'
};

const pageToRoute = {
  'home': '/',
  'library': '/library',
  'favorites': '/favorites',
  'playlists': '/playlists',
  'smartsearch': '/search',
  'settings': '/settings'
};

/** شاشة انتظار بسيطة أثناء تحميل صفحة */
function PageLoader() {
  return (
    <div className="flex items-center justify-center py-32" role="status" aria-live="polite">
      <div className="w-10 h-10 border-4 border-gray-700 border-t-spotify-green rounded-full animate-spin"></div>
      <span className="sr-only">جاري التحميل</span>
    </div>
  );
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Toast notifications
  const { toasts, dismiss } = useToast();

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // شاشة القفل وزراير السماعة والبلوتوث
  useMediaSession();

  // بيطبّقوا الثيم واللغة/الاتجاه على <html>
  useTheme();
  useLanguage();

  // Get current page from URL
  const currentPage = routeToPage[location.pathname] || 'home';

  // Navigate to page
  const setCurrentPage = (page) => {
    const route = pageToRoute[page] || '/';
    navigate(route);
    setIsSidebarOpen(false);
  };

  return (
    <div className="h-screen flex flex-col bg-black text-white">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden fixed top-4 right-4 z-50 bg-spotify-green text-on-accent p-2 rounded-full shadow-lg"
          aria-label="Toggle Menu"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Sidebar - Hidden on mobile by default */}
        <div className={`
          fixed md:relative inset-y-0 right-0 z-40
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}>
          <Sidebar
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-spotify-gray to-black pb-32 md:pb-24 relative">
          {/* طبقة النقش - معرّفة في globals.css */}
          <div className="app-pattern" aria-hidden="true"></div>
          <div className="relative z-10">
            <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/library" element={<Library />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/playlists" element={<Playlists />} />
              <Route path="/search" element={<SmartSearch />} />
              <Route path="/settings" element={<Settings />} />
              {/* Fallback to Home */}
              <Route path="*" element={<Home />} />
            </Routes>
            </Suspense>
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Player Bar */}
      <PlayerBar />
    </div>
  );
}

export default App;
