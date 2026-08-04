import { memo, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, Repeat, Repeat1 } from 'lucide-react';
import PropTypes from 'prop-types';
import { useTranslation } from '../../../i18n';

/**
 * مكون أزرار التحكم بالمشغل
 * يشمل: Play/Pause, Next, Previous, Repeat
 */
function PlayerControls({
    isPlaying = false,
    repeatMode = 'none',
    onTogglePlay,
    onNextSurah,
    onPreviousSurah,
    onCycleRepeatMode,
    size = 'normal', // 'normal' | 'compact'
    children // للمكونات الإضافية مثل ReciterSelector
}) {
  const { t } = useTranslation();

    /**
     * الحصول على أيقونة التكرار المناسبة
     */
    const getRepeatIcon = useCallback(() => {
        const iconSize = size === 'compact' ? 16 : 18;
        if (repeatMode === 'one') {
            return <Repeat1 size={iconSize} className="text-spotify-green" />;
        }
        if (repeatMode === 'all') {
            return <Repeat size={iconSize} className="text-spotify-green" />;
        }
        return <Repeat size={iconSize} className="text-gray-400" />;
    }, [repeatMode, size]);

    /**
     * الحصول على عنوان زر التكرار
     */
    const getRepeatTitle = () => {
        if (repeatMode === 'one') return 'تكرار واحد';
        if (repeatMode === 'all') return 'تكرار الكل';
        return 'بدون تكرار';
    };

    const buttonPadding = size === 'compact' ? 'p-1.5' : 'p-2.5';
    const playButtonSize = size === 'compact' ? 'w-12 h-12' : 'w-14 h-14';
    const navIconSize = size === 'compact' ? 20 : 22;
    const playIconSize = size === 'compact' ? 20 : 24;
    const navButtonPadding = size === 'compact' ? 'p-1.5' : 'p-3';

    return (
        <div className="flex items-center gap-3 md:gap-4 justify-center">
            {/* Repeat Button */}
            <button
                onClick={onCycleRepeatMode}
                className={`${buttonPadding} hover:bg-gray-700/60 rounded-xl transition-all hover:scale-110 active:scale-95`}
                title={getRepeatTitle()}
                aria-label={getRepeatTitle()}
            >
                {getRepeatIcon()}
            </button>

            {/* Previous Button */}
            <button
                onClick={onPreviousSurah}
                className={`${navButtonPadding} hover:bg-gray-700/60 rounded-xl transition-all group hover:scale-110 active:scale-95`}
                title={t('السابق')}
                aria-label={t('السورة السابقة')}
            >
                <SkipBack size={navIconSize} className="text-gray-300 group-hover:text-white transition-colors" />
            </button>

            {/* Play/Pause Button */}
            <button
                onClick={onTogglePlay}
                className={`${playButtonSize} bg-white hover:scale-105 active:scale-95 rounded-full flex items-center justify-center transition-all duration-200 shadow-2xl hover:shadow-spotify-green/30`}
                title={isPlaying ? 'إيقاف' : 'تشغيل'}
                aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
            >
                {isPlaying ? (
                    <Pause size={playIconSize} className="text-black" fill="black" />
                ) : (
                    <Play size={playIconSize} className="text-black mr-0.5" fill="black" />
                )}
            </button>

            {/* Next Button */}
            <button
                onClick={onNextSurah}
                className={`${navButtonPadding} hover:bg-gray-700/60 rounded-xl transition-all group hover:scale-110 active:scale-95`}
                title={t('التالي')}
                aria-label={t('السورة التالية')}
            >
                <SkipForward size={navIconSize} className="text-gray-300 group-hover:text-white transition-colors" />
            </button>

            {/* Additional Controls (e.g., ReciterSelector) */}
            {children}
        </div>
    );
}

PlayerControls.propTypes = {
    isPlaying: PropTypes.bool.isRequired,
    repeatMode: PropTypes.oneOf(['none', 'one', 'all']),
    onTogglePlay: PropTypes.func.isRequired,
    onNextSurah: PropTypes.func.isRequired,
    onPreviousSurah: PropTypes.func.isRequired,
    onCycleRepeatMode: PropTypes.func.isRequired,
    size: PropTypes.oneOf(['normal', 'compact']),
    children: PropTypes.node
};


export default memo(PlayerControls);
