/**
 * Error Handler
 * 
 * معالج الأخطاء الموحد
 * يتعامل مع الأخطاء ويعرض رسائل للمستخدم
 */

import { ApiError, ErrorCodes } from './ApiError';

// Listeners للأخطاء
const errorListeners = new Set();

/**
 * معالج الأخطاء المركزي
 */
class ErrorHandler {
    constructor() {
        this._errorLog = [];
        this._maxLogSize = 50;
    }

    /**
     * معالجة خطأ
     * @param {Error|ApiError} error - الخطأ
     * @param {Object} options - خيارات إضافية
     */
    handle(error, options = {}) {
        const {
            showToast = true,
            logToConsole = true,
            context = {}
        } = options;

        // تحويل لـ ApiError إذا لم يكن
        const apiError = this._normalizeError(error, context);

        // تسجيل في الـ log
        this._logError(apiError);

        // طباعة في الـ console
        if (logToConsole) {
            console.error('[ErrorHandler]', apiError.toJSON());
        }

        // إشعار الـ listeners
        if (showToast) {
            this._notifyListeners(apiError);
        }

        return apiError;
    }

    /**
     * معالجة خطأ fetch
     * @param {Error} error - الخطأ
     * @param {string} endpoint - الـ endpoint
     */
    handleFetchError(error, endpoint = '') {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return this.handle(ApiError.networkError(error), {
                context: { endpoint }
            });
        }

        return this.handle(error, { context: { endpoint } });
    }

    /**
     * معالجة خطأ Response
     * @param {Response} response - الـ response
     * @param {string} endpoint - الـ endpoint
     */
    handleResponseError(response, endpoint = '') {
        const error = ApiError.fromResponse(response, endpoint);
        return this.handle(error);
    }

    /**
     * إضافة listener للأخطاء
     * @param {Function} listener - الدالة التي ستُستدعى عند حدوث خطأ
     * @returns {Function} دالة لإزالة الـ listener
     */
    addListener(listener) {
        errorListeners.add(listener);
        return () => errorListeners.delete(listener);
    }

    /**
     * الحصول على سجل الأخطاء
     * @returns {Array}
     */
    getErrorLog() {
        return [...this._errorLog];
    }

    /**
     * مسح سجل الأخطاء
     */
    clearErrorLog() {
        this._errorLog = [];
    }

    // ═══════════════════════════════════════════════════════════════
    // Private Methods
    // ═══════════════════════════════════════════════════════════════

    /**
     * تحويل أي خطأ إلى ApiError
     * @private
     */
    _normalizeError(error, context = {}) {
        if (error instanceof ApiError) {
            return error;
        }

        // TypeError عادة يعني مشكلة شبكة
        if (error instanceof TypeError) {
            return new ApiError(
                error.message,
                ErrorCodes.NETWORK_ERROR,
                error,
                context
            );
        }

        // خطأ عام
        return new ApiError(
            error.message || 'Unknown error',
            ErrorCodes.UNKNOWN,
            error,
            context
        );
    }

    /**
     * تسجيل الخطأ
     * @private
     */
    _logError(error) {
        this._errorLog.push(error.toJSON());

        // الحفاظ على حجم الـ log
        if (this._errorLog.length > this._maxLogSize) {
            this._errorLog.shift();
        }
    }

    /**
     * إشعار الـ listeners
     * @private
     */
    _notifyListeners(error) {
        errorListeners.forEach(listener => {
            try {
                listener(error);
            } catch (e) {
                console.error('Error in error listener:', e);
            }
        });
    }
}

// تصدير instance واحد (Singleton)
const errorHandler = new ErrorHandler();
export default errorHandler;

// تصدير الـ class للاختبار
export { ErrorHandler };
