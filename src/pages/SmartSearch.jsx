import { Sparkles } from 'lucide-react';

export default function SmartSearch() {
  return (
    <div className="flex items-center justify-center min-h-screen pb-32" dir="rtl">
      <div className="text-center max-w-lg px-8 bg-black/60 rounded-2xl shadow-2xl border border-spotify-green/30" style={{backdropFilter: 'blur(4px)'}}>
        <div className="inline-flex items-center justify-center w-20 h-20 bg-spotify-green/20 rounded-full mb-6 animate-pulse">
          <Sparkles size={40} className="text-spotify-green" />
        </div>
        <h1 className="text-4xl font-bold mb-4 text-white drop-shadow-lg" style={{textShadow: '0 2px 8px #000, 0 0 2px #1DB954'}}>قريباً...</h1>
        <p className="text-xl text-white mb-8 drop-shadow" style={{textShadow: '0 2px 8px #000, 0 0 2px #1DB954'}}>ميزة البحث الذكي بالذكاء الاصطناعي</p>
        <div className="bg-spotify-gray/70 border border-gray-700/70 rounded-xl p-6">
          <p className="text-white leading-relaxed drop-shadow" style={{textShadow: '0 2px 8px #000, 0 0 2px #1DB954'}}>نعمل على تطوير ميزة البحث الذكي التي ستمكنك من البحث عن معاني الآيات وموضوعاتها في القرآن الكريم بطريقة أكثر دقة وذكاء.</p>
        </div>
      </div>
    </div>
  );
}

