import { Sparkles } from 'lucide-react';

export default function SmartSearch() {
  return (
    <div className="flex items-center justify-center min-h-screen pb-32" dir="rtl">
      <div className="text-center max-w-lg px-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-spotify-green/20 rounded-full mb-6 animate-pulse">
          <Sparkles size={40} className="text-spotify-green" />
        </div>
        <h1 className="text-4xl font-bold mb-4 text-white">
          قريباً...
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          ميزة البحث الذكي بالذكاء الاصطناعي
        </p>
        <div className="bg-spotify-gray/50 border border-gray-700/50 rounded-xl p-6">
          <p className="text-gray-300 leading-relaxed">
            نعمل على تطوير ميزة البحث الذكي التي ستمكنك من البحث عن معاني الآيات وموضوعاتها في القرآن الكريم بطريقة أكثر دقة وذكاء.
          </p>
        </div>
      </div>
    </div>
  );
}

