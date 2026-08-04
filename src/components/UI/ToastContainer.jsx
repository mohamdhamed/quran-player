import { memo } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * Toast Component
 * 
 * مكون لعرض رسائل Toast
 */
function Toast({ toast, onDismiss }) {
    const { id, message, type } = toast;

    const icons = {
        success: <CheckCircle size={20} className="text-green-400" />,
        error: <AlertCircle size={20} className="text-red-400" />,
        warning: <AlertTriangle size={20} className="text-yellow-400" />,
        info: <Info size={20} className="text-blue-400" />
    };

    const bgColors = {
        success: 'bg-green-500/10 border-green-500/30',
        error: 'bg-red-500/10 border-red-500/30',
        warning: 'bg-yellow-500/10 border-yellow-500/30',
        info: 'bg-blue-500/10 border-blue-500/30'
    };

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm shadow-lg animate-slideIn ${bgColors[type] || bgColors.info}`}
            role="alert"
        >
            {icons[type] || icons.info}

            <p className="text-white text-sm flex-1 font-medium">{message}</p>

            <button
                onClick={() => onDismiss(id)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="إغلاق"
            >
                <X size={16} className="text-gray-400" />
            </button>
        </div>
    );
}

Toast.propTypes = {
    toast: PropTypes.shape({
        id: PropTypes.number.isRequired,
        message: PropTypes.string.isRequired,
        type: PropTypes.oneOf(['success', 'error', 'warning', 'info'])
    }).isRequired,
    onDismiss: PropTypes.func.isRequired
};

/**
 * Toast Container
 * 
 * حاوية لعرض جميع الـ toasts
 */
function ToastContainer({ toasts, onDismiss }) {
    if (toasts.length === 0) return null;

    return (
        <div
            className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full"
            aria-live="polite"
            aria-label="الإشعارات"
        >
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
        </div>
    );
}

ToastContainer.propTypes = {
    toasts: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        message: PropTypes.string.isRequired,
        type: PropTypes.oneOf(['success', 'error', 'warning', 'info'])
    })).isRequired,
    onDismiss: PropTypes.func.isRequired
};

export default memo(ToastContainer);
export { Toast };
