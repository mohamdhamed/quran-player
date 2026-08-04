import { memo, useEffect } from 'react';
import { ChevronDown, Heart } from 'lucide-react';
import PropTypes from 'prop-types';
import WaveAnimation from '../../UI/WaveAnimation';
import PlayerControls from './PlayerControls';
import ProgressBar from './ProgressBar';
import { useModal } from '../../../hooks/useModal';
import { useTranslation } from '../../../i18n';

/**
 * مكون المشغل الموسع (Popup)
 * يظهر فوق شريط المشغل مع معلومات تفصيلية
 */
function ExpandedPlayer({
    isOpen,
    onClose,
    currentSurah,
    isPlaying = false,
    repeatMode = 'none',
    onTogglePlay,
    onNextSurah,
    onPreviousSurah,
    onCycleRepeatMode,
    onToggleFavorite,
    isFavorite = false
}) {
  const { t, tVerses } = useTranslation();
    const expandedRef = useModal(isOpen, onClose);

    // إغلاق عند الضغط خارج المكون
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && expandedRef.current && !expandedRef.current.contains(event.target)) {
                // تأكد إنه مش ضاغط على زرار الفتح نفسه
                const surahNameButton = event.target.closest('[data-surah-name-button]');
                if (!surahNameButton) {
                    onClose();
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    if (!isOpen || !currentSurah) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/20 z-40 animate-fadeIn pointer-events-none"
                style={{ animation: 'fadeIn 0.2s ease-out' }}
            />

            {/* Expanded Popup */}
            <div
                ref={expandedRef}
                role="dialog"
                aria-modal="true"
                aria-label={`المشغل الموسع - سورة ${currentSurah?.name || ''}`}
                tabIndex={-1}
                className="fixed bottom-24 right-6 w-96 bg-spotify-gray/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 z-50 animate-slideUp pointer-events-auto"
                style={{
                    animation: 'slideUpScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxShadow: '0 -10px 40px rgba(0,0,0,0.5), 0 0 100px rgba(29, 185, 84, 0.1)'
                }}
            >
                <div className="p-6">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 left-3 p-1.5 hover:bg-gray-700/60 rounded-lg transition-all hover:scale-110 active:scale-95 group"
                        aria-label={t('إغلاق')}
                    >
                        <ChevronDown size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                    </button>

                    {/* Content */}
                    <div className="flex flex-col items-center gap-5">
                        {/* Thumbnail */}
                        <div className="relative">
                            <div className="w-32 h-32 bg-gradient-to-br from-spotify-green/30 via-green-600/20 to-green-900/30 rounded-xl flex items-center justify-center border-2 border-spotify-green/30 shadow-xl shadow-spotify-green/20 backdrop-blur-sm p-4">
                                <span className="text-3xl font-arabic text-spotify-green font-bold drop-shadow-xl text-center leading-tight">
                                    {currentSurah.name}
                                </span>
                            </div>
                            {/* Playing Wave Indicator */}
                            {isPlaying && (
                                <div className="absolute -bottom-1.5 -right-1.5 bg-spotify-green rounded-lg px-2 py-1.5 shadow-lg animate-fadeIn">
                                    <WaveAnimation size="md" color="white" />
                                </div>
                            )}
                        </div>

                        {/* Surah Info */}
                        <div className="text-center -mt-1">
                            <div className="flex items-center justify-center gap-2 mb-1.5">
                                <h1 className="text-2xl font-bold arabic-text text-white">{currentSurah.name}</h1>
                                <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${currentSurah.revelationType === 'Meccan'
                                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                        : 'bg-green-500/20 text-green-400 border border-green-500/30'
                                    }`}>
                                    {currentSurah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-400 mb-1">{currentSurah.nameEn}</p>
                            <p className="text-spotify-green text-xs">{tVerses(currentSurah.verses)}</p>
                        </div>

                        {/* Progress Bar */}
                        <ProgressBar
                            variant="compact"
                            showTimeLabels={true}
                        />

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-3 -mt-1">
                            <PlayerControls
                                isPlaying={isPlaying}
                                repeatMode={repeatMode}
                                onTogglePlay={onTogglePlay}
                                onNextSurah={onNextSurah}
                                onPreviousSurah={onPreviousSurah}
                                onCycleRepeatMode={onCycleRepeatMode}
                                size="compact"
                            >
                                {/* Favorite Button */}
                                <button
                                    onClick={() => onToggleFavorite(currentSurah)}
                                    className="p-1.5 hover:bg-gray-700/60 rounded-lg transition-all hover:scale-110 active:scale-95 group"
                                    title={isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                                    aria-label={isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                                >
                                    <Heart
                                        size={18}
                                        className={`transition-all duration-200 ${isFavorite
                                                ? 'fill-red-500 text-red-500 scale-110'
                                                : 'text-gray-400 group-hover:text-red-400 group-hover:scale-110'
                                            }`}
                                    />
                                </button>
                            </PlayerControls>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

ExpandedPlayer.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    currentSurah: PropTypes.shape({
        name: PropTypes.string,
        nameEn: PropTypes.string,
        number: PropTypes.number,
        verses: PropTypes.number,
        revelationType: PropTypes.string
    }),
    isPlaying: PropTypes.bool,
    repeatMode: PropTypes.oneOf(['none', 'one', 'all']),
    onTogglePlay: PropTypes.func.isRequired,
    onNextSurah: PropTypes.func.isRequired,
    onPreviousSurah: PropTypes.func.isRequired,
    onCycleRepeatMode: PropTypes.func.isRequired,
    onToggleFavorite: PropTypes.func.isRequired,
    isFavorite: PropTypes.bool
};


export default memo(ExpandedPlayer);
