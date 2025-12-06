// Empty State Components

export function EmptyFavorites() {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fadeIn">
            <div className="w-24 h-24 bg-spotify-lightGray rounded-full flex items-center justify-center mb-6 animate-pulse">
                <span className="text-5xl">💚</span>
            </div>
            <h3 className="text-2xl font-bold mb-3">لا توجد سور مفضلة</h3>
            <p className="text-gray-400 mb-6 max-w-md">
                ابدأ بإضافة السور المفضلة لديك بالضغط على أيقونة القلب ❤️
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>💡</span>
                <span>نصيحة: يمكنك الوصول السريع للسور المفضلة من هنا</span>
            </div>
        </div>
    );
}

export function EmptyPlaylists() {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fadeIn">
            <div className="w-24 h-24 bg-spotify-lightGray rounded-full flex items-center justify-center mb-6 animate-pulse">
                <span className="text-5xl">🎵</span>
            </div>
            <h3 className="text-2xl font-bold mb-3">لا توجد قوائم تشغيل</h3>
            <p className="text-gray-400 mb-6 max-w-md">
                أنشئ قائمة تشغيل جديدة لتنظيم السور المفضلة لديك
            </p>
            <button className="btn btn-primary flex items-center gap-2">
                <span>➕</span>
                <span>إنشاء قائمة جديدة</span>
            </button>
        </div>
    );
}

export function EmptySearchResults({ query }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fadeIn">
            <div className="w-24 h-24 bg-spotify-lightGray rounded-full flex items-center justify-center mb-6">
                <span className="text-5xl">🔍</span>
            </div>
            <h3 className="text-2xl font-bold mb-3">لم يتم العثور على نتائج</h3>
            <p className="text-gray-400 mb-2 max-w-md">
                لم نجد أي نتائج لـ <span className="text-white font-semibold">"{query}"</span>
            </p>
            <p className="text-gray-500 text-sm mb-6">جرب البحث بكلمات مختلفة أو تحقق من الإملاء</p>
            <div className="flex flex-col gap-2 text-sm text-gray-500 text-right max-w-md">
                <p className="font-semibold text-gray-400">💡 نصائح للبحث:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>استخدم كلمات مفتاحية أقصر</li>
                    <li>جرب البحث باسم السورة بالعربية أو الإنجليزية</li>
                    <li>يمكنك البحث برقم السورة</li>
                </ul>
            </div>
        </div>
    );
}

export function EmptyRecentlyPlayed() {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-16 h-16 bg-spotify-lightGray rounded-full flex items-center justify-center mb-4 opacity-50">
                <span className="text-3xl">🎧</span>
            </div>
            <p className="text-gray-400 text-sm">لم تستمع لأي سورة بعد</p>
            <p className="text-gray-500 text-xs mt-1">ابدأ بتشغيل سورة لتظهر هنا</p>
        </div>
    );
}

export function ErrorState({
    title = 'حدث خطأ ما',
    message = 'عذراً، حدث خطأ أثناء تحميل البيانات',
    onRetry
}) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fadeIn" role="alert">
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border-2 border-red-500/30">
                <span className="text-5xl">⚠️</span>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-red-400">{title}</h3>
            <p className="text-gray-400 mb-6 max-w-md">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="btn btn-primary flex items-center gap-2"
                    aria-label="إعادة المحاولة"
                >
                    <span>🔄</span>
                    <span>إعادة المحاولة</span>
                </button>
            )}
        </div>
    );
}

export function NoConnection() {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fadeIn">
            <div className="w-24 h-24 bg-spotify-lightGray rounded-full flex items-center justify-center mb-6 animate-pulse">
                <span className="text-5xl">📡</span>
            </div>
            <h3 className="text-2xl font-bold mb-3">لا توجد اتصال بالإنترنت</h3>
            <p className="text-gray-400 mb-6 max-w-md">
                يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>💡</span>
                <span>تحقق من إعدادات الشبكة لديك</span>
            </div>
        </div>
    );
}
