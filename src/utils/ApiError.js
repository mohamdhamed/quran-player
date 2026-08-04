/**
 * API Error Class
 * 
 * فئة موحدة لأخطاء API
 * تحتوي على معلومات تفصيلية عن الخطأ
 */

// رموز الأخطاء
export const ErrorCodes = {
    // أخطاء الشبكة
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT: 'TIMEOUT',

    // أخطاء API
    API_ERROR: 'API_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    SERVER_ERROR: 'SERVER_ERROR',

    // أخطاء الصوت
    AUDIO_LOAD_ERROR: 'AUDIO_LOAD_ERROR',
    AUDIO_PLAY_ERROR: 'AUDIO_PLAY_ERROR',

    // أخطاء عامة
    UNKNOWN: 'UNKNOWN',
    VALIDATION_ERROR: 'VALIDATION_ERROR'
};

// رسائل الأخطاء بالعربية
export const ErrorMessages = {
    [ErrorCodes.NETWORK_ERROR]: 'تعذر الاتصال بالإنترنت',
    [ErrorCodes.TIMEOUT]: 'انتهى وقت الاتصال',
    [ErrorCodes.API_ERROR]: 'حدث خطأ في الخادم',
    [ErrorCodes.NOT_FOUND]: 'لم يتم العثور على البيانات',
    [ErrorCodes.SERVER_ERROR]: 'خطأ في الخادم',
    [ErrorCodes.AUDIO_LOAD_ERROR]: 'تعذر تحميل الصوت',
    [ErrorCodes.AUDIO_PLAY_ERROR]: 'تعذر تشغيل الصوت',
    [ErrorCodes.UNKNOWN]: 'حدث خطأ غير متوقع',
    [ErrorCodes.VALIDATION_ERROR]: 'بيانات غير صحيحة'
};

export class ApiError extends Error {
    /**
     * @param {string} message - رسالة الخطأ
     * @param {string} code - رمز الخطأ من ErrorCodes
     * @param {Error} originalError - الخطأ الأصلي (اختياري)
     * @param {Object} context - معلومات إضافية (اختياري)
     */
    constructor(message, code = ErrorCodes.UNKNOWN, originalError = null, context = {}) {
        super(message);

        this.name = 'ApiError';
        this.code = code;
        this.originalError = originalError;
        this.context = context;
        this.timestamp = new Date();

        // للحفاظ على stack trace صحيح
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }

    /**
     * الحصول على رسالة المستخدم
     * @returns {string} رسالة مناسبة للعرض للمستخدم
     */
    getUserMessage() {
        return ErrorMessages[this.code] || this.message || ErrorMessages[ErrorCodes.UNKNOWN];
    }

    /**
     * هل الخطأ قابل لإعادة المحاولة؟
     * @returns {boolean}
     */
    isRetryable() {
        return [
            ErrorCodes.NETWORK_ERROR,
            ErrorCodes.TIMEOUT,
            ErrorCodes.SERVER_ERROR
        ].includes(this.code);
    }

    /**
     * تحويل إلى JSON للـ logging
     * @returns {Object}
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            context: this.context,
            timestamp: this.timestamp.toISOString(),
            stack: this.stack
        };
    }

    /**
     * إنشاء خطأ شبكة
     * @static
     */
    static networkError(originalError = null) {
        return new ApiError(
            ErrorMessages[ErrorCodes.NETWORK_ERROR],
            ErrorCodes.NETWORK_ERROR,
            originalError
        );
    }

    /**
     * إنشاء خطأ تحميل صوت
     * @static
     */
    static audioLoadError(audioUrl, originalError = null) {
        return new ApiError(
            ErrorMessages[ErrorCodes.AUDIO_LOAD_ERROR],
            ErrorCodes.AUDIO_LOAD_ERROR,
            originalError,
            { audioUrl }
        );
    }

    /**
     * إنشاء خطأ API
     * @static
     */
    static apiError(endpoint, statusCode, originalError = null) {
        return new ApiError(
            ErrorMessages[ErrorCodes.API_ERROR],
            ErrorCodes.API_ERROR,
            originalError,
            { endpoint, statusCode }
        );
    }

    /**
     * إنشاء خطأ من Response
     * @static
     */
    static fromResponse(response, endpoint = '') {
        if (response.status === 404) {
            return new ApiError(
                ErrorMessages[ErrorCodes.NOT_FOUND],
                ErrorCodes.NOT_FOUND,
                null,
                { endpoint, status: response.status }
            );
        }

        if (response.status >= 500) {
            return new ApiError(
                ErrorMessages[ErrorCodes.SERVER_ERROR],
                ErrorCodes.SERVER_ERROR,
                null,
                { endpoint, status: response.status }
            );
        }

        return new ApiError(
            ErrorMessages[ErrorCodes.API_ERROR],
            ErrorCodes.API_ERROR,
            null,
            { endpoint, status: response.status }
        );
    }
}

export default ApiError;
