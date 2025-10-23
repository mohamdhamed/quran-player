import { useState } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import PlayerBar from './components/Player/PlayerBar';
import Home from './pages/Home';
import Library from './pages/Library';
import Favorites from './pages/Favorites';
import Playlists from './pages/Playlists';
import Settings from './pages/Settings';
import SemanticSearch from './pages/SemanticSearch';
import SmartSearch from './pages/SmartSearch';
import { Menu, X } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'library':
        return <Library />;
      case 'favorites':
        return <Favorites />;
      case 'playlists':
        return <Playlists />;
      case 'smartsearch':
        return <SmartSearch />;
      case 'semanticsearch':
        return <SemanticSearch />;
      case 'settings':
        return <Settings />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-black text-white" dir="rtl">
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
            setCurrentPage={(page) => {
              setCurrentPage(page);
              setIsSidebarOpen(false); // Close sidebar on mobile after selection
            }} 
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
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-spotify-gray to-black pb-24 md:pb-0">
          {renderPage()}
        </main>
      </div>
      
      {/* Player Bar */}
      <PlayerBar />
    </div>
  );
}

export default App;
