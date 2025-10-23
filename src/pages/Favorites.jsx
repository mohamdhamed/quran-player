import { Play, Heart } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';

export default function Favorites() {
  // استخدام selectors لتجنب re-render غير ضروري
  const favorites = usePlayerStore((state) => state.favorites);
  const playSurah = usePlayerStore((state) => state.playSurah);
  const currentSurah = usePlayerStore((state) => state.currentSurah);
  const toggleFavorite = usePlayerStore((state) => state.toggleFavorite);

  if (favorites.length === 0) {
    return (
      <div className="p-8 pb-32 animate-fadeIn">
        <h1 className="text-4xl font-bold mb-8 animate-slideDown">المفضلة</h1>
        <div className="text-center py-20 animate-scaleIn">
          <Heart size={80} className="mx-auto text-gray-600 mb-4 animate-pulse" />
          <h2 className="text-2xl font-semibold mb-2">لا توجد سور مفضلة بعد</h2>
          <p className="text-gray-400">ابدأ بإضافة السور المفضلة لديك</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 pb-32 animate-fadeIn">
      {/* Header */}
      <div className="mb-8 animate-slideDown">
        <h1 className="text-4xl font-bold mb-2">المفضلة</h1>
        <p className="text-gray-400">{favorites.length} سورة</p>
      </div>

      {/* Favorites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {favorites.map((surah, index) => {
          const delayClass = index % 3 === 0 ? '' : index % 3 === 1 ? 'delay-100' : 'delay-200';
          const isPlaying = currentSurah?.number === surah.number;
          const isMeccan = surah.revelationType === 'Meccan';
          
          const typeColors = isMeccan 
            ? {
                bg: 'bg-blue-500/10',
                bgHover: 'group-hover:bg-blue-500/20',
                border: 'border-blue-500/30',
                text: 'text-blue-400',
                glow: 'group-hover:shadow-blue-500/20'
              }
            : {
                bg: 'bg-green-500/10',
                bgHover: 'group-hover:bg-green-500/20',
                border: 'border-green-500/30',
                text: 'text-green-400',
                glow: 'group-hover:shadow-green-500/20'
              };
          
          return (
            <div
              key={surah.number}
              className={`surah-card group relative animate-slideUp overflow-hidden ${delayClass} ${typeColors.bg} ${typeColors.bgHover} border ${typeColors.border}`}
              style={{
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <div className="flex items-center gap-4 relative z-10">
                {/* Thumbnail مع Wave */}
                <div className="relative w-20 h-20 bg-spotify-gray rounded-xl flex flex-col items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 p-2">
                  <span className={`text-base font-arabic ${typeColors.text} font-bold transition-transform duration-300 group-hover:scale-110 text-center leading-tight`}>
                    {surah.name}
                  </span>
                  <span className="text-xs text-gray-400 mt-0.5 transition-colors duration-300 group-hover:text-white">
                    {surah.nameEn}
                  </span>
                  
                  {/* Wave Animation */}
                  {isPlaying && (
                    <div className="absolute -bottom-1 -left-1 flex items-end gap-0.5 bg-spotify-green rounded-full px-1.5 py-1 shadow-lg animate-fadeIn">
                      <div className="w-0.5 bg-white rounded-full animate-wave" style={{ height: '4px', animationDelay: '0ms' }}></div>
                      <div className="w-0.5 bg-white rounded-full animate-wave" style={{ height: '8px', animationDelay: '150ms' }}></div>
                      <div className="w-0.5 bg-white rounded-full animate-wave" style={{ height: '6px', animationDelay: '300ms' }}></div>
                      <div className="w-0.5 bg-white rounded-full animate-wave" style={{ height: '4px', animationDelay: '450ms' }}></div>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 text-right cursor-pointer" onClick={() => playSurah(surah)}>
                  <h3 className={`text-lg font-semibold arabic-text mb-1 transition-colors duration-300 group-hover:${typeColors.text}`}>
                    سورة {surah.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 transition-colors duration-300 group-hover:text-gray-300">
                    {surah.verses} آية • {isMeccan ? 'مكية' : 'مدنية'}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    className="play-button-sm opacity-0 group-hover:opacity-100 transition-all duration-300"
                    onClick={() => playSurah(surah)}
                  >
                    <Play size={20} fill="white" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(surah);
                    }}
                    className="text-spotify-green hover:scale-125 active:scale-95 transition-all duration-300"
                    style={{
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }}
                  >
                    <Heart size={20} fill="#1DB954" />
                  </button>
                </div>
              </div>
              {/* Progress Bar */}
              {isPlaying && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-l from-spotify-green to-green-400 shadow-lg shadow-spotify-green/50"></div>
              )}
              
              {/* Glow Effect */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${typeColors.glow} blur-xl -z-10`}></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
