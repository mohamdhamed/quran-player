import { useState, useCallback, useEffect } from 'react';
import errorHandler from '../utils/errorHandler';

/**
 * Toast Hook
 * 
 * Hook لإظهار رسائل Toast للمستخدم
 * يتكامل مع ErrorHandler لعرض رسائل الأخطاء تلقائياً
 */
export function useToast() {
    const [toasts, setToasts] = useState([]);

    /**
     * إضافة toast جديد
     */
    const show = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random();

        const toast = {
            id,
            message,
            type, // 'success' | 'error' | 'warning' | 'info'
            duration
        };

        setToasts(prev => [...prev, toast]);

        // إزالة تلقائية بعد المدة المحددة
        if (duration > 0) {
            setTimeout(() => {
                dismiss(id);
            }, duration);
        }

        return id;
    }, []);

    /**
     * إظهار رسالة نجاح
     */
    const success = useCallback((message, duration = 3000) => {
        return show(message, 'success', duration);
    }, [show]);

    /**
     * إظهار رسالة خطأ
     */
    const error = useCallback((message, duration = 5000) => {
        return show(message, 'error', duration);
    }, [show]);

    /**
     * إظهار رسالة تحذير
     */
    const warning = useCallback((message, duration = 4000) => {
        return show(message, 'warning', duration);
    }, [show]);

    /**
     * إظهار رسالة معلومات
     */
    const info = useCallback((message, duration = 4000) => {
        return show(message, 'info', duration);
    }, [show]);

    /**
     * إخفاء toast معين
     */
    const dismiss = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    /**
     * إخفاء جميع الـ toasts
     */
    const dismissAll = useCallback(() => {
        setToasts([]);
    }, []);

    /**
     * الاستماع لأخطاء ErrorHandler
     */
    useEffect(() => {
        const unsubscribe = errorHandler.addListener((apiError) => {
            error(apiError.getUserMessage());
        });

        return unsubscribe;
    }, [error]);

    return {
        toasts,
        show,
        success,
        error,
        warning,
        info,
        dismiss,
        dismissAll
    };
}

export default useToast;
