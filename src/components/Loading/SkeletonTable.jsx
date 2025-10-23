export default function SkeletonTable({ rows = 5 }) {
  return (
    <div className="bg-spotify-lightGray rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="border-b border-gray-700">
          <tr className="text-gray-400 text-sm">
            <th className="p-4 text-right">#</th>
            <th className="p-4 text-right">اسم السورة</th>
            <th className="p-4 text-right">الاسم بالإنجليزية</th>
            <th className="p-4 text-right">الآيات</th>
            <th className="p-4 text-right">النوع</th>
            <th className="p-4 text-right"></th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, index) => (
            <tr key={index} className="border-b border-gray-800 animate-pulse">
              <td className="p-4">
                <div className="h-4 bg-gray-700 rounded skeleton w-8"></div>
              </td>
              <td className="p-4">
                <div className="h-5 bg-gray-700 rounded skeleton w-32"></div>
              </td>
              <td className="p-4">
                <div className="h-4 bg-gray-700 rounded skeleton w-24"></div>
              </td>
              <td className="p-4">
                <div className="h-4 bg-gray-700 rounded skeleton w-12"></div>
              </td>
              <td className="p-4">
                <div className="h-6 bg-gray-700 rounded-full skeleton w-16"></div>
              </td>
              <td className="p-4">
                <div className="w-10 h-10 bg-gray-700 rounded-full skeleton"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
