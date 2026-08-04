import { memo, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { usePlayerLogic } from '../hooks/usePlayerLogic';
import { usePlayerStore } from '../../../store/playerStore';
import audioPlayer from '../../../services/audioPlayer';

/**
 * مكون شريط التقدم
 * يعرض تقدم التشغيل ويسمح بالتنقل
 *
 * بيقرا الوقت من الـ store مباشرةً بدل ما ياخده props.
 * السبب: الوقت بيتحدّث 10 مرات في الثانية، ولو كان جاي من فوق كان
 * لازم كل مكوّن في السلسلة (PlayerBar وما تحته) يعمل re-render معاه.
 * كده المكوّن ده وحده هو اللي بيتحدّث.
 */
function ProgressBar({
    variant = 'full', // 'full' | 'compact'
    showTimeLabels = true
}) {
    const localProgressRef = useRef(null);

    const currentTime = usePlayerStore((state) => state.currentTime);
    const duration = usePlayerStore((state) => state.duration);
    const isPlaying = usePlayerStore((state) => state.isPlaying);
    const setCurrentTime = usePlayerStore((state) => state.setCurrentTime);

    const {
        hoveredTime,
        hoverPosition,
        progressPercentage,
        formatTime,
        handleSeek,
        handleProgressHover,
        handleProgressLeave
    } = usePlayerLogic({ duration, currentTime, setCurrentTime });

    const handleLocalSeek = (e) => handleSeek(e, localProgressRef);
    const handleLocalHover = (e) => handleProgressHover(e, localProgressRef);

    /**
     * التنقل بالكيبورد - قبل كده كان التنقل بالماوس بس، يعني مستخدم
     * الكيبورد أو قارئ الشاشة ما كانش يقدر يتحرك جوه السورة خالص.
     * الأسهم بتتحرك 5 ثواني، PageUp/Down دقيقة، Home/End للبداية والنهاية.
     * ملاحظة RTL: السهم الشمال بيقدّم واليمين بيرجّع، زي اتجاه القراءة.
     */
    const handleKeyDown = useCallback((e) => {
        if (!duration) return;

        const STEP = 5;
        const BIG_STEP = 60;
        let next = null;

        switch (e.key) {
            case 'ArrowLeft': next = currentTime + STEP; break;
            case 'ArrowRight': next = currentTime - STEP; break;
            case 'ArrowUp': next = currentTime + STEP; break;
            case 'ArrowDown': next = currentTime - STEP; break;
            case 'PageUp': next = currentTime + BIG_STEP; break;
            case 'PageDown': next = currentTime - BIG_STEP; break;
            case 'Home': next = 0; break;
            case 'End': next = duration; break;
            default: return;
        }

        // نوقف الحدث هنا عشان ما يوصلش لاختصارات المشغل العامة
        e.preventDefault();
        e.stopPropagation();

        const clamped = Math.min(duration, Math.max(0, next));
        audioPlayer.seek(clamped);
        setCurrentTime(clamped);
    }, [currentTime, duration, setCurrentTime]);

    // خصائص مشتركة تخلي الشريط عنصر slider حقيقي لقارئات الشاشة
    const sliderProps = {
        role: 'slider',
        tabIndex: 0,
        'aria-label': 'موضع التشغيل داخل السورة',
        'aria-valuemin': 0,
        'aria-valuemax': Math.round(duration) || 0,
        'aria-valuenow': Math.round(currentTime) || 0,
        'aria-valuetext': `${formatTime(currentTime)} من ${formatTime(duration)}`,
        onKeyDown: handleKeyDown
    };

    if (variant === 'compact') {
        return (
            <div className="w-full">
                <div
                    ref={localProgressRef}
                    {...sliderProps}
                    className="relative h-1.5 bg-gray-700/50 rounded-full cursor-pointer overflow-hidden group"
                    onClick={handleLocalSeek}
                    onMouseMove={handleLocalHover}
                    onMouseLeave={handleProgressLeave}
                >
                    <div
                        className="absolute top-0 h-full bg-gradient-to-l from-spotify-green via-green-500 to-green-400 rounded-full transition-all duration-200"
                        style={{ width: `${progressPercentage}%`, right: 0 }}
                    >
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>

                    {/* Hover Tooltip */}
                    {hoveredTime !== null && (
                        <div
                            className="absolute -top-10 transform -translate-x-1/2 bg-spotify-lightGray px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xl border border-gray-700 whitespace-nowrap pointer-events-none"
                            style={{ right: `${hoverPosition}%`, transform: 'translateX(50%)' }}
                        >
                            {formatTime(hoveredTime)}
                        </div>
                    )}
                </div>

                {/* Time Display */}
                {showTimeLabels && (
                    <div className="flex justify-between mt-3 text-sm text-gray-400">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                )}
            </div>
        );
    }

    // Full variant
    return (
        <div className="px-6 pt-3 pb-2">
            <div className="flex items-center gap-4">
                {/* Current Time */}
                <span className="text-xs text-gray-400 font-mono w-11 text-right transition-all duration-200 hover:text-spotify-green hover:scale-105">
                    {formatTime(currentTime)}
                </span>

                {/* Progress Bar */}
                <div className="flex-1 relative">
                    <div
                        ref={localProgressRef}
                        {...sliderProps}
                        className="h-1.5 bg-gray-700/60 rounded-full cursor-pointer relative group transition-all duration-200 hover:h-2.5"
                        onClick={handleLocalSeek}
                        onMouseMove={handleLocalHover}
                        onMouseLeave={handleProgressLeave}
                    >
                        {/* Background Glow */}
                        <div className="absolute inset-0 bg-spotify-green/5 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        {/* Progress Fill with Gradient */}
                        <div
                            className="absolute h-full bg-gradient-to-l from-spotify-green via-green-400 to-green-300 rounded-full transition-all duration-150 shadow-lg shadow-spotify-green/20"
                            style={{ width: `${progressPercentage}%`, right: 0 }}
                        >
                            {/* Playhead */}
                            <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-xl shadow-spotify-green/40 transition-all duration-200 scale-0 group-hover:scale-100 ring-2 ring-spotify-green/30"></div>

                            {/* Wave Animation when playing */}
                            {isPlaying && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-full bg-white/40 blur-sm animate-pulse"></div>
                            )}
                        </div>

                        {/* Hover Tooltip */}
                        {hoveredTime !== null && (
                            <div
                                className="absolute -top-10 transition-all duration-100 pointer-events-none"
                                style={{
                                    right: `${hoverPosition}%`,
                                    transform: 'translateX(50%)'
                                }}
                            >
                                <div className="bg-white text-black px-2.5 py-1.5 rounded-lg shadow-xl text-xs font-semibold whitespace-nowrap">
                                    {formatTime(hoveredTime)}
                                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-4 border-transparent border-t-white"></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Duration */}
                <span className="text-xs text-gray-400 font-mono w-11 transition-all duration-200 hover:text-spotify-green hover:scale-105">
                    {formatTime(duration)}
                </span>
            </div>
        </div>
    );
}

ProgressBar.propTypes = {
    variant: PropTypes.oneOf(['full', 'compact']),
    showTimeLabels: PropTypes.bool
};

export default memo(ProgressBar);
