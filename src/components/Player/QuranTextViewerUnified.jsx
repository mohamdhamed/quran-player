import { useState, useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { X, Loader, CheckCircle, Zap } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import quranService from '../../services/QuranService';

/**
 * غلاف بسيط: بيمنع المحتوى من الاشتراك في الـ store وهو مقفول.
 * قبل كده كان المكوّن بيشترك في currentTime طول الوقت، فكان بيعمل
 * re-render 10 مرات في الثانية حتى لو العارض مش ظاهر أصلاً.
 */
export default function QuranTextViewer({ isOpen, onClose }) {
  if (!isOpen) return null;

  return <QuranTextViewerContent onClose={onClose} />;
}

function QuranTextViewerContent({ onClose }) {
  const { currentSurah, currentReciter, currentTime } = usePlayerStore(
    useShallow((state) => ({
      currentSurah: state.currentSurah,
      currentReciter: state.currentReciter,
      currentTime: state.currentTime
    }))
  );
  const [ayahs, setAyahs] = useState([]);
  const [currentAyah, setCurrentAyah] = useState(0);
  const [timings, setTimings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reciterInfo, setReciterInfo] = useState(null);
  const scrollContainerRef = useRef(null);
  const ayahRefs = useRef({});
  const textViewerRef = useRef(null);

  // تحميل السورة والتوقيتات
  useEffect(() => {
    if (currentSurah) {
      loadSurahData();
    }
  }, [currentSurah, currentReciter]);

  // تحديث الآية الحالية بناءً على الوقت
  useEffect(() => {
    if (timings.length > 0 && currentTime >= 0) {
      // mp3quran بيعدّ من 0 (البسملة = 0)، وalquran.cloud بيعدّ من 1.
      // بنحوّل هنا مرة واحدة عند الحدود، وباقي المكوّن يشتغل بترقيم
      // numberInSurah لوحده (1، 2، 3...) عشان ما يحصلش لبس تاني.
      const ayahNumber = quranService.findCurrentAyah(currentTime, timings) + 1;

      if (ayahNumber !== currentAyah) {
        setCurrentAyah(ayahNumber);
        scrollToAyah(ayahNumber);
      }
    }
  }, [currentTime, timings, currentAyah]);

  // قفل المربع لما تضغط برة
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (textViewerRef.current && !textViewerRef.current.contains(event.target)) {
        // تأكد إنه مش ضاغط على زرار الكتاب
        const bookButton = event.target.closest('[data-text-viewer-button]');
        if (!bookButton) {
          onClose();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const loadSurahData = async () => {
    if (!currentSurah) return;
    
    setIsLoading(true);
    
    try {
      // 1️⃣ معلومات القارئ
      setReciterInfo(quranService.getReciterById(currentReciter));

      // 2️⃣ النص القرآني
      const textData = await quranService.getSurahText(currentSurah.number);
      if (textData && textData.ayahs) {
        setAyahs(textData.ayahs);
      }

      // 3️⃣ توقيتات الآيات
      const preciseTimings = await quranService.getTimings(currentSurah.number, currentReciter);
      setTimings(preciseTimings || []);
    } catch (error) {
      console.error('Error loading surah data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToAyah = (ayahNumber) => {
    const ayahElement = ayahRefs.current[ayahNumber];
    if (ayahElement && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const elementTop = ayahElement.offsetTop;
      const elementHeight = ayahElement.offsetHeight;
      const containerHeight = container.offsetHeight;
      
      container.scrollTo({
        top: elementTop - containerHeight / 2 + elementHeight / 2,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      {/* Overlay خفيف */}
      <div 
        className="fixed inset-0 bg-black/20 z-40 animate-fadeIn pointer-events-none"
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      />
      
      {/* Popup على اليمين */}
      <div 
        ref={textViewerRef}
        className="fixed bottom-24 left-6 w-[500px] max-h-[70vh] bg-spotify-gray/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 z-50 flex flex-col animate-slideUp pointer-events-auto"
        style={{ 
          animation: 'slideUpScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.5), 0 0 100px rgba(29, 185, 84, 0.1)'
        }}
      >
        {/* Header مدمج */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
          <div className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-1.5">
              <Zap className="text-spotify-green" size={18} />
              <CheckCircle className="text-spotify-green" size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-white truncate">
                {currentSurah?.name}
              </h2>
              <p className="text-xs text-gray-400 truncate">
                {currentSurah?.verses} آيات
                {reciterInfo && ` • ${reciterInfo.name || reciterInfo.nameEn}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-700/60 rounded-lg transition-all hover:scale-110 active:scale-95 flex-shrink-0"
          >
            <X size={20} className="text-gray-400 hover:text-white transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4"
          dir="rtl"
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader className="animate-spin text-spotify-green mb-4" size={48} />
              <p className="text-white text-lg mb-2">جاري تحميل التوقيتات الدقيقة...</p>
              <p className="text-gray-400 text-sm">من mp3quran.net ⚡</p>
            </div>
          ) : ayahs.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400">لا توجد بيانات متاحة</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ayahs.map((ayah) => {
                // timings جاية من mp3quran بترقيم يبدأ من 0، فبنطرح 1
                const timing = timings.find(t => t.ayah === ayah.numberInSurah - 1);

                // currentAyah متحوّل فوق لترقيم numberInSurah نفسه
                const isActive = currentAyah === ayah.numberInSurah;
                
                return (
                  <div
                    key={ayah.number}
                    ref={(el) => (ayahRefs.current[ayah.numberInSurah] = el)}
                    className={`p-4 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-spotify-green bg-opacity-20 border-2 border-spotify-green scale-105 shadow-lg'
                        : 'bg-gray-800 border-2 border-transparent hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                          isActive
                            ? 'bg-spotify-green text-black shadow-lg scale-110'
                            : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        {ayah.numberInSurah}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-2xl leading-loose font-arabic ${
                            isActive
                              ? 'text-white font-semibold'
                              : 'text-gray-300'
                          }`}
                        >
                          {ayah.text}
                        </p>
                        {timing && (
                          <div className="mt-2 flex items-center gap-4 text-xs">
                            <div className="text-gray-500">
                              ⏱️ {timing.startTime.toFixed(1)}s - {timing.endTime.toFixed(1)}s
                            </div>
                            <div className="text-spotify-green">
                              ⚡ مدة: {timing.duration.toFixed(1)}s
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Zap className="text-spotify-green" size={16} />
              <CheckCircle className="text-spotify-green" size={14} />
              <span className="text-spotify-green font-semibold">
                تزامن آية بآية • mp3quran.net
              </span>
            </div>
            {timings.length > 0 && (
              <div className="text-gray-400">
                {timings.length} آية موقّتة ⚡
              </div>
            )}
          </div>
          {reciterInfo && (
            <div className="mt-2 text-xs text-gray-500">
              🎙️ القارئ: {reciterInfo.name} • {reciterInfo.rewaya || 'حفص عن عاصم'}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
