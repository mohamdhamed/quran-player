/**
 * SurahCard Component
 * 
 * كارد قابل لإعادة الاستخدام لعرض السور
 * Reusable surah card for displaying surahs across the app
 */

import { memo, useCallback } from 'react';
import { Play, Heart } from 'lucide-react';
import WaveAnimation from './WaveAnimation';

// ألوان حسب نوع النزول (خارج المكون للأداء)
const TYPE_COLORS = {
  Meccan: {
    bg: 'bg-blue-500/5',
    bgHover: 'hover:bg-blue-500/10',
    border: 'border-blue-500/10',
    text: 'text-blue-400',
    dot: 'bg-blue-500'
  },
  Medinan: {
    bg: 'bg-green-500/5',
    bgHover: 'hover:bg-green-500/10',
    border: 'border-green-500/10',
    text: 'text-green-400',
    dot: 'bg-green-500'
  }
};

/**
 * SurahCard Props:
 * @param {Object} surah - بيانات السورة
 * @param {boolean} isPlaying - هل السورة قيد التشغيل
 * @param {boolean} isFavorite - هل السورة في المفضلة
 * @param {Function} onPlay - دالة تشغيل السورة
 * @param {Function} onToggleFavorite - دالة المفضلة (اختياري)
 * @param {string} variant - نوع العرض: 'default' | 'compact' | 'list'
 */
function SurahCard({ 
  surah, 
  isPlaying = false, 
  isFavorite = false,
  onPlay, 
  onToggleFavorite,
  variant = 'default'
}) {
  const isMeccan = surah.revelationType === 'Meccan';
  const typeColors = TYPE_COLORS[surah.revelationType] || TYPE_COLORS.Meccan;

  // Memoized handlers
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPlay();
    }
  }, [onPlay]);

  const handleFavoriteClick = useCallback((e) => {
    e.stopPropagation();
    onToggleFavorite?.();
  }, [onToggleFavorite]);

  // Compact variant (للقوائم الصغيرة)
  if (variant === 'compact') {
    return (
      <button
        className={`p-3 rounded-xl ${typeColors.bg} ${typeColors.bgHover} border ${typeColors.border} w-full text-right transition-all duration-300 hover:scale-[1.02] group`}
        onClick={onPlay}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColors.bg}`}>
            <span className={`text-sm font-arabic ${typeColors.text} font-bold`}>{surah.number}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold arabic-text truncate">{surah.name}</p>
            <p className="text-xs text-gray-400">{surah.verses} آية</p>
          </div>
          {isPlaying && <WaveAnimation size="sm" color="green" />}
        </div>
      </button>
    );
  }

  // Default variant
  return (
    <button
      className={`surah-card group relative overflow-hidden ${typeColors.bg} ${typeColors.bgHover} border ${typeColors.border} w-full text-right`}
      onClick={onPlay}
      onKeyDown={handleKeyDown}
      style={{
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      aria-label={`تشغيل سورة ${surah.name} - ${surah.nameEn} - ${surah.verses} آية - ${isMeccan ? 'مكية' : 'مدنية'}`}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center gap-4 relative z-10">
        {/* Thumbnail مع Wave Animation */}
        <div className="relative w-20 h-20 bg-spotify-gray rounded-xl flex flex-col items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 p-2">
          <span className={`text-base font-arabic ${typeColors.text} font-bold transition-all duration-300 group-hover:scale-110 text-center leading-tight`}>
            {surah.name}
          </span>
          <span className="text-xs text-gray-400 mt-0.5 transition-colors duration-300 group-hover:text-white">
            {surah.nameEn}
          </span>

          {/* Wave Animation عند التشغيل */}
          {isPlaying && (
            <div className="absolute -bottom-1 -left-1 bg-spotify-green rounded-full px-1.5 py-1 shadow-lg animate-fadeIn">
              <WaveAnimation size="sm" color="white" />
            </div>
          )}
        </div>

        {/* معلومات السورة */}
        <div className="flex-1 text-right">
          <h3 className={`text-lg font-semibold arabic-text mb-1 transition-colors duration-300 group-hover:${typeColors.text}`}>
            سورة {surah.name}
          </h3>
          <p className="text-xs text-gray-500 mt-1 transition-colors duration-300 group-hover:text-gray-300">
            {surah.verses} آية • {isMeccan ? 'مكية' : 'مدنية'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onToggleFavorite && (
            <button 
              onClick={handleFavoriteClick}
              className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                isFavorite 
                  ? 'text-red-500 hover:text-red-400' 
                  : 'text-gray-400 hover:text-white opacity-0 group-hover:opacity-100'
              }`}
              aria-label={isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
            >
              <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          )}
          <button className="play-button-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-12">
            <Play size={20} fill="white" />
          </button>
        </div>
      </div>

      {/* Progress Bar عند التشغيل */}
      {isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-l from-spotify-green to-green-400 shadow-lg shadow-spotify-green/50" aria-hidden="true"></div>
      )}
    </button>
  );
}

export default memo(SurahCard);
