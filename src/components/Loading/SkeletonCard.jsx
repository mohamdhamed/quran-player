export default function SkeletonCard() {
  return (
    <div className="surah-card animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gray-700 rounded skeleton"></div>
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-700 rounded skeleton w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded skeleton w-1/2"></div>
          <div className="h-3 bg-gray-700 rounded skeleton w-2/3"></div>
        </div>
      </div>
    </div>
  );
}
