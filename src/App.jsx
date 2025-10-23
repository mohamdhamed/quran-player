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

function App() {
  const [currentPage, setCurrentPage] = useState('home');

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
        {/* Sidebar */}
        <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-spotify-gray to-black">
          {renderPage()}
        </main>
      </div>
      
      {/* Player Bar */}
      <PlayerBar />
    </div>
  );
}

export default App;
