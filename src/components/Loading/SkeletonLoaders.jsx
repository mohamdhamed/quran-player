// Skeleton Loader Components for Loading States

export function SurahCardSkeleton({ count = 6 }) {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="bg-spotify-lightGray rounded-lg p-4 animate-pulse"
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    <div className="flex items-center gap-4">
                        {/* Thumbnail skeleton */}
                        <div className="w-20 h-20 bg-gray-700/50 rounded-xl flex-shrink-0" />

                        {/* Content skeleton */}
                        <div className="flex-1 space-y-2">
                            <div className="h-5 bg-gray-700/50 rounded w-3/4" />
                            <div className="h-3 bg-gray-700/50 rounded w-1/2" />
                        </div>

                        {/* Button skeleton */}
                        <div className="w-10 h-10 bg-gray-700/50 rounded-full" />
                    </div>
                </div>
            ))}
        </>
    );
}

export function SurahGridSkeleton({ count = 10 }) {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="bg-spotify-lightGray rounded-2xl p-6 animate-pulse h-72"
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-3">
                            <div className="w-10 h-10 bg-gray-700/50 rounded-lg" />
                            <div className="w-6 h-6 bg-gray-700/50 rounded-full" />
                        </div>

                        {/* Center content */}
                        <div className="flex-1 flex flex-col justify-center items-center gap-3">
                            <div className="h-8 bg-gray-700/50 rounded w-2/3" />
                            <div className="h-4 bg-gray-700/50 rounded w-1/2" />
                            <div className="h-3 bg-gray-700/50 rounded w-1/3" />
                        </div>

                        {/* Footer */}
                        <div className="flex justify-between items-center">
                            <div className="h-6 bg-gray-700/50 rounded-full w-16" />
                            <div className="h-4 bg-gray-700/50 rounded w-12" />
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}

export function TableRowSkeleton({ count = 10 }) {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <tr
                    key={index}
                    className="border-b border-gray-800/50 animate-pulse"
                    style={{ animationDelay: `${index * 30}ms` }}
                >
                    <td className="p-4">
                        <div className="w-10 h-10 bg-gray-700/50 rounded-lg" />
                    </td>
                    <td className="p-4">
                        <div className="space-y-2">
                            <div className="h-5 bg-gray-700/50 rounded w-32" />
                            <div className="h-3 bg-gray-700/50 rounded w-24 md:hidden" />
                        </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                        <div className="h-4 bg-gray-700/50 rounded w-28" />
                    </td>
                    <td className="p-4">
                        <div className="h-4 bg-gray-700/50 rounded w-16" />
                    </td>
                    <td className="p-4">
                        <div className="h-6 bg-gray-700/50 rounded-full w-20" />
                    </td>
                    <td className="p-4">
                        <div className="flex gap-2">
                            <div className="w-10 h-10 bg-gray-700/50 rounded-full" />
                            <div className="w-10 h-10 bg-gray-700/50 rounded-full" />
                        </div>
                    </td>
                </tr>
            ))}
        </>
    );
}

export function LoadingSpinner({ size = 'md', message = 'جاري التحميل...' }) {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16'
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4 py-12" role="status" aria-live="polite">
            <div className={`${sizeClasses[size]} border-3 border-gray-700 border-t-spotify-green rounded-full animate-spin`} />
            {message && (
                <p className="text-gray-400 text-sm animate-pulse">{message}</p>
            )}
            <span className="sr-only">{message}</span>
        </div>
    );
}

export function AudioLoadingIndicator() {
    return (
        <div className="flex items-center gap-2 text-spotify-green animate-pulse" role="status" aria-live="polite">
            <div className="flex gap-1 items-end h-6">
                <div className="w-1 bg-spotify-green rounded-full animate-wave" style={{ height: '8px', animationDelay: '0ms' }} />
                <div className="w-1 bg-spotify-green rounded-full animate-wave" style={{ height: '16px', animationDelay: '150ms' }} />
                <div className="w-1 bg-spotify-green rounded-full animate-wave" style={{ height: '12px', animationDelay: '300ms' }} />
                <div className="w-1 bg-spotify-green rounded-full animate-wave" style={{ height: '8px', animationDelay: '450ms' }} />
            </div>
            <span className="text-sm font-semibold">جاري تحميل الصوت...</span>
            <span className="sr-only">جاري تحميل الصوت</span>
        </div>
    );
}
