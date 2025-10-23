import { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';

export default function AddToPlaylistMenu({ surah, onClose }) {
  const playlists = usePlayerStore((state) => state.playlists);
  const addToPlaylist = usePlayerStore((state) => state.addToPlaylist);
  const [addedTo, setAddedTo] = useState(new Set());

  const handleAddToPlaylist = (playlistId) => {
    addToPlaylist(playlistId, surah);
    setAddedTo(new Set([...addedTo, playlistId]));
    
    // Auto close after 1 second
    setTimeout(() => {
      if (onClose) onClose();
    }, 1000);
  };

  if (playlists.length === 0) {
    return (
      <div className="absolute left-0 top-full mt-2 bg-spotify-lightGray border border-gray-700/50 rounded-lg shadow-xl p-4 z-10 min-w-[200px]">
        <p className="text-sm text-gray-400 text-center">لا توجد قوائم تشغيل</p>
        <p className="text-xs text-gray-500 text-center mt-1">أنشئ قائمة من صفحة القوائم</p>
      </div>
    );
  }

  return (
    <div className="absolute left-0 top-full mt-2 bg-spotify-lightGray border border-gray-700/50 rounded-lg shadow-xl overflow-hidden z-10 min-w-[220px] animate-slideDown">
      <div className="p-2 border-b border-gray-700/50">
        <p className="text-xs text-gray-400 font-medium px-2">إضافة إلى قائمة تشغيل</p>
      </div>
      <div className="max-h-60 overflow-y-auto">
        {playlists.map((playlist) => {
          const isAdded = addedTo.has(playlist.id) || playlist.surahs.some(s => s.number === surah.number);
          
          return (
            <button
              key={playlist.id}
              onClick={() => !isAdded && handleAddToPlaylist(playlist.id)}
              disabled={isAdded}
              className={`w-full px-4 py-2.5 flex items-center justify-between transition-all ${
                isAdded 
                  ? 'bg-spotify-green/20 text-spotify-green cursor-default' 
                  : 'hover:bg-white/5 text-gray-300 hover:text-white'
              }`}
            >
              <span className="text-sm truncate">{playlist.name}</span>
              {isAdded && <Check size={16} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
