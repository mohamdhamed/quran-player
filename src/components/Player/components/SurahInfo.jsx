import { memo } from 'react';
import { Heart } from 'lucide-react';
import PropTypes from 'prop-types';
import WaveAnimation from '../../UI/WaveAnimation';
import { useTranslation } from '../../../i18n';

/**
 * مكون معلومات السورة الحالية
 * يعرض اسم السورة والمعلومات الأساسية مع زر المفضلة
 */
function SurahInfo({
    currentSurah,
    isPlaying = false,
    isFavorite = false,
    onToggleFavorite,
    onExpand
}) {
  const { tVerses } = useTranslation();
    if (!currentSurah) return null;

    return (
        <div className="flex items-center gap-2 md:gap-4 justify-end order-1 md:order-1">
            {/* Thumbnail with Playing Animation */}
            <div className="relative flex-shrink-0 group">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-spotify-green/30 via-green-600/20 to-green-900/30 rounded-xl flex flex-col items-center justify-center border border-spotify-green/30 transition-all duration-300 group-hover:scale-110 group-hover:border-spotify-green/50 group-hover:shadow-lg group-hover:shadow-spotify-green/20 backdrop-blur-sm p-1">
                    <span className="text-xs md:text-sm font-arabic text-spotify-green font-bold drop-shadow-lg text-center leading-tight">
                        {currentSurah.name}
                    </span>
                    <span className="text-[8px] md:text-[10px] text-gray-400 mt-0.5 hidden md:block">
                        {currentSurah.nameEn}
                    </span>
                </div>
                {/* Playing Wave Indicator */}
                {isPlaying && (
                    <div className="absolute -bottom-1 -right-1 bg-spotify-green rounded-full px-1.5 py-1 shadow-lg animate-fadeIn">
                        <WaveAnimation size="sm" color="white" />
                    </div>
                )}
            </div>

            {/* Surah Details - Clickable to Expand */}
            <button
                data-surah-name-button
                onClick={onExpand}
                className="min-w-0 flex-1 text-right group/expand hidden md:block"
            >
                <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-white font-bold arabic-text text-lg truncate transition-all duration-200 group-hover/expand:text-spotify-green cursor-pointer">
                        {currentSurah.name}
                    </p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${currentSurah.revelationType === 'Meccan'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-green-500/20 text-green-400 border border-green-500/30'
                        }`}>
                        {currentSurah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="transition-colors group-hover/expand:text-white cursor-pointer">{currentSurah.nameEn}</span>
                    <span className="text-gray-600">•</span>
                    <span className="transition-colors group-hover/expand:text-spotify-green cursor-pointer">{tVerses(currentSurah.verses)}</span>
                </div>
            </button>

            {/* Favorite Button */}
            <button
                onClick={() => onToggleFavorite(currentSurah)}
                className="p-2.5 hover:bg-gray-700/60 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 flex-shrink-0"
                title={isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                aria-label={isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
            >
                <Heart
                    size={20}
                    fill={isFavorite ? '#1DB954' : 'none'}
                    className={`transition-all duration-300 ${isFavorite
                            ? 'text-spotify-green drop-shadow-[0_0_8px_rgba(29,185,84,0.6)]'
                            : 'text-gray-400 hover:text-spotify-green'
                        }`}
                />
            </button>
        </div>
    );
}

SurahInfo.propTypes = {
    currentSurah: PropTypes.shape({
        name: PropTypes.string,
        nameEn: PropTypes.string,
        number: PropTypes.number,
        verses: PropTypes.number,
        revelationType: PropTypes.string
    }),
    isPlaying: PropTypes.bool,
    isFavorite: PropTypes.bool,
    onToggleFavorite: PropTypes.func.isRequired,
    onExpand: PropTypes.func.isRequired
};


export default memo(SurahInfo);
