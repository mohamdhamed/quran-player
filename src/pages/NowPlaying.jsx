import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import QuranTextViewer from '../components/Player/QuranTextViewerUnified';

export default function NowPlaying() {
  // استخدام selectors لتجنب re-render غير ضروري
  const currentSurah = usePlayerStore((state) => state.currentSurah);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const [showTextViewer, setShowTextViewer] = useState(false);

  if (!currentSurah) {
    return null;
  }

  return (
    <>
      {/* Quran Text Viewer Modal */}
      <QuranTextViewer 
        isOpen={showTextViewer} 
        onClose={() => setShowTextViewer(false)} 
      />

      <div className="p-8 pb-32 animate-fadeIn">
        {/* Header */}
        <div className="mb-8 animate-slideDown">
          <h1 className="text-4xl font-bold mb-2">قيد التشغيل</h1>
          <p className="text-gray-400">استمع واقرأ القرآن الكريم</p>
        </div>

        {/* Currently Playing Card */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-b from-spotify-green/20 to-spotify-lightGray rounded-lg overflow-hidden hover:shadow-2xl hover:shadow-spotify-green/20 transition-all duration-500 animate-scaleIn">
            {/* Surah Display */}
            <div className="p-12 text-center">
              <div className="w-32 h-32 bg-spotify-green/20 rounded-full mx-auto mb-6 flex items-center justify-center transition-all hover:scale-110 hover:rotate-12 animate-pulse">
                <span className="text-6xl font-arabic text-spotify-green font-bold">
                  {currentSurah.number}
                </span>
              </div>
              
              <h2 className="text-5xl font-bold arabic-text mb-3 transition-colors hover:text-spotify-green">
                {currentSurah.name}
              </h2>
              <p className="text-2xl text-gray-400 mb-2 transition-colors hover:text-white">{currentSurah.nameEn}</p>
              <p className="text-lg text-gray-400 transition-colors hover:text-gray-300">{currentSurah.nameTranslation}</p>
              
              <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-400">
                <span className="transition-colors hover:text-white">{currentSurah.verses} آية</span>
                <span>•</span>
                <span className="transition-colors hover:text-white">{currentSurah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</span>
              </div>

              {isPlaying && (
                <div className="mt-8 flex items-center justify-center gap-2 animate-slideUp">
                  <div className="flex gap-1">
                    <div className="w-1 h-8 bg-spotify-green animate-pulse"></div>
                    <div className="w-1 h-6 bg-spotify-green animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1 h-10 bg-spotify-green animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    <div className="w-1 h-7 bg-spotify-green animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                  </div>
                  <span className="text-spotify-green font-semibold animate-pulse">قيد التشغيل</span>
                </div>
              )}
            </div>
          </div>

          {/* Surah Info */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-spotify-lightGray rounded-lg p-6 transition-all hover:shadow-xl hover-lift animate-slideUp delay-100">
              <h3 className="text-lg font-semibold mb-3 transition-colors hover:text-spotify-green">معلومات السورة</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between transition-colors hover:text-white">
                  <span className="text-gray-400">الترتيب في المصحف:</span>
                  <span className="font-semibold">{currentSurah.number}</span>
                </div>
                <div className="flex justify-between transition-colors hover:text-white">
                  <span className="text-gray-400">عدد الآيات:</span>
                  <span className="font-semibold">{currentSurah.verses}</span>
                </div>
                <div className="flex justify-between transition-colors hover:text-white">
                  <span className="text-gray-400">مكان النزول:</span>
                  <span className="font-semibold">
                    {currentSurah.revelationType === 'Meccan' ? 'مكة المكرمة' : 'المدينة المنورة'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-spotify-lightGray rounded-lg p-6 transition-all hover:shadow-xl hover-lift animate-slideUp delay-200">
              <h3 className="text-lg font-semibold mb-3 transition-colors hover:text-spotify-green">خيارات القراءة</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setShowTextViewer(true)}
                  className="w-full btn bg-spotify-green hover:bg-spotify-darkGreen text-white flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                  <BookOpen size={18} />
                  <span>عرض النص القرآني</span>
                </button>
                <button className="w-full btn btn-secondary text-sm transition-all hover:scale-105 active:scale-95">
                  تحميل السورة للاستماع دون اتصال
                </button>
                <button className="w-full btn btn-secondary text-sm transition-all hover:scale-105 active:scale-95">
                  مشاركة السورة
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
