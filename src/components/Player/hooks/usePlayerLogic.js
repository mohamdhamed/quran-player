import { useRef, useState, useCallback } from 'react';
import audioPlayer from '../../../services/audioPlayer';

/**
 * Custom hook للمنطق المشترك في مكونات المشغل
 * يحتوي على:
 * - formatTime: تنسيق الوقت
 * - handleSeek: التنقل في الصوت
 * - handleProgressHover: إظهار tooltip عند التحويم
 */
export function usePlayerLogic({ duration, currentTime, setCurrentTime }) {
    const progressRef = useRef(null);
    const [hoveredTime, setHoveredTime] = useState(null);
    const [hoverPosition, setHoverPosition] = useState(0);

    /**
     * تنسيق الوقت بالثواني إلى دقائق:ثواني
     */
    const formatTime = useCallback((seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }, []);

    /**
     * معالج النقر على شريط التقدم للتنقل
     * RTL: نعكس الحساب - من اليمين لليسار
     */
    const handleSeek = useCallback((e, customRef = null) => {
        const ref = customRef || progressRef;
        if (!duration || !ref.current) return;

        const progressBar = ref.current;
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;

        // RTL: نعكس الحساب - من اليمين لليسار
        const seekTime = ((width - clickX) / width) * duration;

        audioPlayer.seek(seekTime);
        setCurrentTime(seekTime);
    }, [duration, setCurrentTime]);

    /**
     * معالج التحويم على شريط التقدم
     * يحسب الوقت والموضع لإظهار tooltip
     */
    const handleProgressHover = useCallback((e, customRef = null) => {
        const ref = customRef || progressRef;
        if (!ref.current || !duration) return;

        const progressBar = ref.current;
        const rect = progressBar.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;

        // RTL: الوقت من اليمين لليسار (معكوس)
        const time = ((width - x) / width) * duration;
        // RTL: الموضع أيضاً معكوس (من اليمين)
        const percentage = ((width - x) / width) * 100;

        setHoveredTime(time);
        setHoverPosition(percentage);
    }, [duration]);

    /**
     * معالج مغادرة شريط التقدم
     */
    const handleProgressLeave = useCallback(() => {
        setHoveredTime(null);
    }, []);

    /**
     * حساب نسبة التقدم الحالية
     */
    const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

    return {
        // Refs
        progressRef,

        // State
        hoveredTime,
        hoverPosition,
        progressPercentage,

        // Functions
        formatTime,
        handleSeek,
        handleProgressHover,
        handleProgressLeave,
        setHoveredTime
    };
}

export default usePlayerLogic;
