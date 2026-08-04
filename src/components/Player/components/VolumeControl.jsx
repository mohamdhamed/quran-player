import { memo, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * مكون التحكم بالصوت
 * يشمل: زر Mute/Unmute و Slider للصوت
 */
function VolumeControl({
    volume,
    isMuted,
    onVolumeChange,
    onToggleMute
}) {
    const [showVolume, setShowVolume] = useState(false);

    /**
     * معالج تغيير الصوت بالسحب
     */
    const handleVolumeSlider = (e) => {
        const slider = e.currentTarget;

        const handleMove = (moveEvent) => {
            const rect = slider.getBoundingClientRect();
            const y = rect.bottom - moveEvent.clientY;
            const newVolume = Math.max(0, Math.min(1, y / rect.height));
            onVolumeChange(newVolume);
        };

        handleMove(e);

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <div className="relative group/volume">
            {/* Volume Button */}
            <button
                onClick={onToggleMute}
                onMouseEnter={() => setShowVolume(true)}
                onMouseLeave={() => setShowVolume(false)}
                className="p-2 hover:bg-gray-700/60 rounded-xl transition-all hover:scale-110 active:scale-95"
                title={isMuted ? 'إلغاء الكتم' : `الصوت: ${Math.round(volume * 100)}%`}
                aria-label={isMuted ? 'إلغاء الكتم' : `مستوى الصوت ${Math.round(volume * 100)} بالمئة`}
            >
                {isMuted || volume === 0 ? (
                    <VolumeX size={18} className="text-red-400 group-hover/volume:text-red-300 transition-colors duration-200" />
                ) : (
                    <Volume2 size={18} className="text-gray-400 group-hover/volume:text-spotify-green transition-colors duration-200" />
                )}
            </button>

            {/* Volume Popup */}
            {showVolume && (
                <div
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-spotify-lightGray rounded-xl p-2.5 shadow-2xl border border-gray-700/50 backdrop-blur-sm animate-fadeIn"
                    onMouseEnter={() => setShowVolume(true)}
                    onMouseLeave={() => setShowVolume(false)}
                    style={{ zIndex: 100 }}
                >
                    {/* Arrow */}
                    <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-spotify-lightGray border-b border-r border-gray-700/50 rotate-45"></div>

                    <div className="flex flex-col items-center gap-2 w-8">
                        {/* Volume Percentage */}
                        <div className="flex items-center justify-center w-7 h-7 bg-spotify-green/10 rounded-lg border border-spotify-green/30">
                            <span className="text-xs font-bold text-spotify-green">{Math.round(volume * 100)}</span>
                        </div>

                        {/* Volume Slider */}
                        <div
                            className="relative h-20 w-1.5 bg-gray-700/50 rounded-full overflow-hidden cursor-pointer group/slider hover:w-2 transition-all duration-200"
                            onMouseDown={handleVolumeSlider}
                        >
                            {/* Fill */}
                            <div
                                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-spotify-green via-spotify-green to-green-400 rounded-full pointer-events-none"
                                style={{ height: `${volume * 100}%`, transition: 'height 0.05s ease-out' }}
                            ></div>

                            {/* Thumb */}
                            <div
                                className="absolute left-1/2 transform -translate-x-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-lg pointer-events-none opacity-0 group-hover/slider:opacity-100 scale-0 group-hover/slider:scale-100"
                                style={{ bottom: `calc(${volume * 100}% - 5px)`, transition: 'bottom 0.05s ease-out, opacity 0.15s, transform 0.15s' }}
                            ></div>
                        </div>

                        {/* Volume Icons */}
                        <div className="flex flex-col gap-0.5 text-gray-600 opacity-50">
                            <div className="w-0.5 h-2 bg-current rounded-full"></div>
                            <div className="w-0.5 h-1.5 bg-current rounded-full"></div>
                            <div className="w-0.5 h-1 bg-current rounded-full"></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

VolumeControl.propTypes = {
    volume: PropTypes.number.isRequired,
    isMuted: PropTypes.bool.isRequired,
    onVolumeChange: PropTypes.func.isRequired,
    onToggleMute: PropTypes.func.isRequired
};

export default memo(VolumeControl);
