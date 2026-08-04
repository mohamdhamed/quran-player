import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import PlayerBar from './components/Player/PlayerBar';
import BottomNav from './components/Navigation/BottomNav';
import ToastContainer from './components/UI/ToastContainer';
import { useToast } from './hooks/useToast';
import Home from './pages/Home';
import Library from './pages/Library';
import Favorites from './pages/Favorites';
import Playlists from './pages/Playlists';
import Settings from './pages/Settings';
import SemanticSearch from './pages/SemanticSearch';
import SmartSearch from './pages/SmartSearch';
import { Menu, X } from 'lucide-react';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

// Map routes to page IDs for navigation state
const routeToPage = {
  '/': 'home',
  '/library': 'library',
  '/favorites': 'favorites',
  '/playlists': 'playlists',
  '/search': 'smartsearch',
  '/semantic-search': 'semanticsearch',
  '/settings': 'settings'
};

const pageToRoute = {
  'home': '/',
  'library': '/library',
  'favorites': '/favorites',
  'playlists': '/playlists',
  'smartsearch': '/search',
  'semanticsearch': '/semantic-search',
  'settings': '/settings'
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Toast notifications
  const { toasts, dismiss } = useToast();

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Get current page from URL
  const currentPage = routeToPage[location.pathname] || 'home';

  // Navigate to page
  const setCurrentPage = (page) => {
    const route = pageToRoute[page] || '/';
    navigate(route);
    setIsSidebarOpen(false);
  };

  return (
    <div className="h-screen flex flex-col bg-black text-white" dir="rtl">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden fixed top-4 right-4 z-50 bg-spotify-green text-white p-2 rounded-full shadow-lg"
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
          {/* Islamic Pattern Overlay */}
          <div className="absolute inset-0 pointer-events-none z-0 opacity-60" style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(29, 185, 84, 0.2) 1.5px, transparent 1.5px),
              radial-gradient(circle at 75% 75%, rgba(29, 185, 84, 0.2) 1.5px, transparent 1.5px),
              radial-gradient(circle at 25% 75%, rgba(29, 185, 84, 0.15) 1px, transparent 1px),
              radial-gradient(circle at 75% 25%, rgba(29, 185, 84, 0.15) 1px, transparent 1px),
              radial-gradient(circle at 50% 50%, rgba(29, 185, 84, 0.18) 2px, transparent 2px)
            `,
            backgroundSize: '100px 100px',
            animation: 'patternFloat 60s linear infinite',
            minHeight: '100%'
          }}></div>
          <div className="relative z-10">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/library" element={<Library />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/playlists" element={<Playlists />} />
              <Route path="/search" element={<SmartSearch />} />
              <Route path="/semantic-search" element={<SemanticSearch />} />
              <Route path="/settings" element={<Settings />} />
              {/* Fallback to Home */}
              <Route path="*" element={<Home />} />
            </Routes>
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
