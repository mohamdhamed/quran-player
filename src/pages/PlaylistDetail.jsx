import { Play, Trash2, ArrowLeft, Music } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';

export default function PlaylistDetail({ playlistId, onBack }) {
  const playlist = usePlayerStore((state) => state.getPlaylist(playlistId));
  const removeFromPlaylist = usePlayerStore((state) => state.removeFromPlaylist);
  const playSurah = usePlayerStore((state) => state.playSurah);
  const playPlaylist = usePlayerStore((state) => state.playPlaylist);
  const currentSurah = usePlayerStore((state) => state.currentSurah);

  if (!playlist) {
    return (
      <div className="p-8 pb-32" dir="rtl">
        <p className="text-gray-400">القائمة غير موجودة</p>
      </div>
    );
  }

  const handleRemove = (surahNumber) => {
    if (confirm('هل تريد إزالة هذه السورة من القائمة؟')) {
      removeFromPlaylist(playlistId, surahNumber);
    }
  };

  return (
    <div className="p-8 pb-32 animate-fadeIn" dir="rtl">
      {/* Header */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>رجوع</span>
      </button>

      <div className="flex items-start gap-6 mb-8">
        {/* Playlist Cover */}
        <div className="w-48 h-48 bg-gradient-to-br from-spotify-green to-green-800 rounded-xl flex items-center justify-center flex-shrink-0 shadow-2xl">
          <Music size={64} className="text-white" />
        </div>

        {/* Playlist Info */}
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-2">قائمة تشغيل</p>
          <h1 className="text-5xl font-bold mb-4">{playlist.name}</h1>
          {playlist.description && (
            <p className="text-gray-300 mb-4">{playlist.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>{playlist.surahs.length} سورة</span>
            <span>•</span>
            <span>{new Date(playlist.createdAt).toLocaleDateString('ar-EG')}</span>
          </div>

          {/* Play Button */}
          {playlist.surahs.length > 0 && (
            <button
              onClick={() => playPlaylist(playlistId)}
              className="mt-6 px-8 py-3 bg-spotify-green hover:bg-spotify-darkGreen rounded-full text-white font-bold transition-all hover:scale-105 flex items-center gap-2"
            >
              <Play size={20} fill="white" />
              <span>تشغيل الكل</span>
            </button>
          )}
        </div>
      </div>

      {/* Surahs List */}
      {playlist.surahs.length === 0 ? (
        <div className="text-center py-20">
          <Music size={64} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">القائمة فارغة</p>
          <p className="text-sm text-gray-500 mt-2">أضف سوراً من صفحة المكتبة</p>
        </div>
      ) : (
        <div className="bg-spotify-gray/30 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800/50">
                <th className="p-4 text-right text-sm text-gray-400 font-medium">#</th>
                <th className="p-4 text-right text-sm text-gray-400 font-medium">السورة</th>
                <th className="p-4 text-right text-sm text-gray-400 font-medium">الآيات</th>
                <th className="p-4 text-right text-sm text-gray-400 font-medium">النوع</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {playlist.surahs.map((surah, index) => {
                const isPlaying = currentSurah?.number === surah.number;
                
                return (
                  <tr
                    key={surah.number}
                    className={`group border-b border-gray-800/30 hover:bg-white/5 transition-all cursor-pointer ${
                      isPlaying ? 'bg-spotify-green/10' : ''
                    }`}
                    onClick={() => playSurah(surah)}
                  >
                    <td className="p-4">
                      <span className={`text-sm ${isPlaying ? 'text-spotify-green font-bold' : 'text-gray-400'}`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {isPlaying && (
                          <div className="flex gap-1 items-end h-6">
                            <div className="w-1 bg-spotify-green rounded-full animate-wave" style={{ height: '6px', animationDelay: '0ms' }}></div>
                            <div className="w-1 bg-spotify-green rounded-full animate-wave" style={{ height: '12px', animationDelay: '150ms' }}></div>
                            <div className="w-1 bg-spotify-green rounded-full animate-wave" style={{ height: '10px', animationDelay: '300ms' }}></div>
                          </div>
                        )}
                        <div>
                          <div className={`text-base font-bold arabic-text ${isPlaying ? 'text-spotify-green' : 'text-white group-hover:text-spotify-green'} transition-colors`}>
                            {surah.name}
                          </div>
                          <div className="text-xs text-gray-400">{surah.nameEn}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-400">{surah.verses} آية</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        surah.revelationType === 'Meccan'
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-green-500/10 text-green-400'
                      }`}>
                        {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(surah.number);
                        }}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} className="text-gray-400 hover:text-red-500" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
