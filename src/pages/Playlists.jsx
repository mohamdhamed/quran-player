import { useState } from 'react';
import { Play, Plus, Trash2, Edit2, Music, Clock, X } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import PlaylistDetail from './PlaylistDetail';

export default function Playlists() {
  const playlists = usePlayerStore((state) => state.playlists);
  const createPlaylist = usePlayerStore((state) => state.createPlaylist);
  const deletePlaylist = usePlayerStore((state) => state.deletePlaylist);
  const playPlaylist = usePlayerStore((state) => state.playPlaylist);
  const currentSurah = usePlayerStore((state) => state.currentSurah);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);

  // Show playlist detail if one is selected
  if (selectedPlaylistId) {
    return <PlaylistDetail playlistId={selectedPlaylistId} onBack={() => setSelectedPlaylistId(null)} />;
  }

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName, newPlaylistDesc);
      setNewPlaylistName('');
      setNewPlaylistDesc('');
      setShowCreateModal(false);
    }
  };

  const handleDeletePlaylist = (playlistId) => {
    if (confirm('هل أنت متأكد من حذف هذه القائمة؟')) {
      deletePlaylist(playlistId);
    }
  };

  return (
    <div className="p-8 pb-32 animate-fadeIn" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">قوائم التشغيل</h1>
          <p className="text-gray-400">أنشئ قوائم تشغيل مخصصة لسورك المفضلة</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-spotify-green hover:bg-spotify-darkGreen rounded-full text-white font-bold transition-all hover:scale-105"
        >
          <Plus size={20} />
          <span>قائمة جديدة</span>
        </button>
      </div>

      {/* Playlists Grid */}
      {playlists.length === 0 ? (
        <div className="text-center py-20 animate-fadeIn">
          <Music size={64} className="mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-bold mb-2 text-gray-400">لا توجد قوائم تشغيل</h3>
          <p className="text-gray-500 mb-6">أنشئ قائمة تشغيل جديدة للبدء</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-spotify-green hover:bg-spotify-darkGreen rounded-full text-white font-bold transition-all"
          >
            إنشاء قائمة تشغيل
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              onClick={() => setSelectedPlaylistId(playlist.id)}
              className="group bg-spotify-gray hover:bg-spotify-lightGray rounded-xl p-6 transition-all duration-300 cursor-pointer"
            >
              {/* Playlist Cover */}
              <div className="relative mb-4">
                <div className="aspect-square bg-gradient-to-br from-spotify-green to-green-800 rounded-lg flex items-center justify-center">
                  <Music size={48} className="text-white" />
                </div>
                
                {/* Play Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playPlaylist(playlist.id);
                  }}
                  className="absolute bottom-2 left-2 w-12 h-12 bg-spotify-green hover:bg-spotify-darkGreen hover:scale-110 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl"
                >
                  <Play size={20} fill="white" className="mr-0.5" />
                </button>
              </div>

              {/* Playlist Info */}
              <h3 className="text-lg font-bold mb-1 truncate">{playlist.name}</h3>
              {playlist.description && (
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{playlist.description}</p>
              )}
              
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <Music size={14} />
                  {playlist.surahs.length} سورة
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePlaylist(playlist.id);
                  }}
                  className="flex-1 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm font-medium transition-all flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={14} />
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-spotify-lightGray rounded-xl p-8 max-w-md w-full mx-4 animate-slideUp">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">قائمة تشغيل جديدة</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">اسم القائمة</label>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="مثال: سور الصباح"
                  className="w-full px-4 py-3 bg-spotify-gray border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-spotify-green"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">الوصف (اختياري)</label>
                <textarea
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  placeholder="أضف وصفاً للقائمة..."
                  rows={3}
                  className="w-full px-4 py-3 bg-spotify-gray border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-spotify-green resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleCreatePlaylist}
                  disabled={!newPlaylistName.trim()}
                  className="flex-1 px-6 py-3 bg-spotify-green hover:bg-spotify-darkGreen disabled:bg-gray-700 disabled:cursor-not-allowed rounded-full text-white font-bold transition-all"
                >
                  إنشاء
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full text-white font-bold transition-all"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
