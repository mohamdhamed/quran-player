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
