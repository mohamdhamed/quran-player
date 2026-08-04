import { useState, useEffect, useRef, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { X, Loader, CheckCircle, Zap, BookOpen, AlignRight, Maximize2, Minimize2 } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import audioPlayer from '../../services/audioPlayer';
import { useModal } from '../../hooks/useModal';
import MushafPage from './MushafPage';
import quranService from '../../services/QuranService';
import { useTranslation } from '../../i18n';

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
  const { t, tVerses } = useTranslation();
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
  const [mode, setMode] = useState('text'); // 'text' | 'mushaf'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const scrollContainerRef = useRef(null);
  const ayahRefs = useRef({});
  // Escape بيخرج من ملء الشاشة الأول لو كان مفتوح، وبعدين يقفل العارض
  const handleEscape = useCallback(() => {
    if (isFullscreen) {
      setIsFullscreen(false);
    } else {
      onClose();
    }
  }, [isFullscreen, onClose]);

  // بيدّي الفوكس للمودال، بيلفّه جواه، وبيقفل بـ Escape
  const textViewerRef = useModal(true, handleEscape);

  // الضغط على آية في المصحف بينقل التلاوة لبدايتها
  const setCurrentTime = usePlayerStore((state) => state.setCurrentTime);

  const handleSeekToAyah = useCallback(
    (startTime) => {
      audioPlayer.seek(startTime);
      setCurrentTime(startTime);
    },
    [setCurrentTime]
  );

  // تحميل السورة والتوقيتات
  useEffect(() => {
    if (currentSurah) {
      loadSurahData();
    }
  }, [currentSurah, currentReciter]);

  // تحديث الآية الحالية بناءً على الوقت
  useEffect(() => {
    if (timings.length > 0 && currentTime >= 0) {
      // TimingProvider بيوحّد الترقيم على ترقيم المصحف قبل ما يوصل هنا،
      // فالرقم ده = numberInSurah مباشرةً (و 0 يعني بسملة/استعاذة)
      const ayahNumber = quranService.findCurrentAyah(currentTime, timings);

      if (ayahNumber !== currentAyah) {
        setCurrentAyah(ayahNumber);
        scrollToAyah(ayahNumber);
      }
    }
  }, [currentTime, timings, currentAyah]);

  // قفل المربع لما تضغط برة
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isFullscreen) return; // في ملء الشاشة مفيش "برّه" أصلاً

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
  }, [onClose, isFullscreen]);

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

  // توقيت الآية اللي بتتقري دلوقتي - منه بنجيب الـ polygon
  const activeTiming = timings.find((t) => t.ayah === currentAyah);

  // الصفحة المعروضة: صفحة الآية الحالية، وقبل ما التلاوة تبدأ (الاستعاذة)
  // بنعرض صفحة أول آية عشان المصحف ما يفضلش فاضي
  const mushafTiming = activeTiming?.page ? activeTiming : timings.find((t) => t.page);

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
        role="dialog"
        aria-modal="true"
        aria-label={`نص سورة ${currentSurah?.name || ''}`}
        tabIndex={-1}
        className={
          isFullscreen
            ? 'fixed inset-0 bg-spotify-gray z-50 flex flex-col pointer-events-auto'
            : `fixed bottom-24 left-6 ${mode === 'mushaf' ? 'w-[560px]' : 'w-[500px]'} max-h-[80vh] bg-spotify-gray/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 z-50 flex flex-col animate-slideUp pointer-events-auto`
        }
        style={
          isFullscreen
            ? undefined
            : {
                animation: 'slideUpScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: '0 -10px 40px rgba(0,0,0,0.5), 0 0 100px rgba(29, 185, 84, 0.1)'
              }
        }
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
                {tVerses(currentSurah?.verses || 0)}
                {reciterInfo && ` • ${reciterInfo.name || reciterInfo.nameEn}`}
              </p>
            </div>
          </div>
          {/* التبديل بين قائمة الآيات وصفحة المصحف */}
          <div className="flex items-center gap-1 bg-black/30 rounded-lg p-1 flex-shrink-0 me-2" role="group" aria-label={t('طريقة العرض')}>
            <button
              onClick={() => setMode('text')}
              className={`p-1.5 rounded-md transition-colors ${mode === 'text' ? 'bg-spotify-green text-on-accent' : 'text-content-secondary hover:text-white'}`}
              aria-pressed={mode === 'text'}
              aria-label={t('عرض النص كقائمة آيات')}
              title={t('قائمة الآيات')}
            >
              <AlignRight size={16} />
            </button>
            <button
              onClick={() => setMode('mushaf')}
              className={`p-1.5 rounded-md transition-colors ${mode === 'mushaf' ? 'bg-spotify-green text-on-accent' : 'text-content-secondary hover:text-white'}`}
              aria-pressed={mode === 'mushaf'}
              aria-label={t('عرض صفحة المصحف')}
              title={t('صفحة المصحف')}
            >
              <BookOpen size={16} />
            </button>
          </div>

          {mode === 'mushaf' && (
            <button
              onClick={() => setIsFullscreen((v) => !v)}
              className="p-1.5 hover:bg-gray-700/60 rounded-lg transition-all hover:scale-110 active:scale-95 flex-shrink-0 me-1 text-content-secondary hover:text-white"
              aria-pressed={isFullscreen}
              aria-label={isFullscreen ? 'الخروج من وضع القراءة' : 'وضع القراءة بملء الشاشة'}
              title={isFullscreen ? 'خروج' : 'ملء الشاشة'}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-700/60 rounded-lg transition-all hover:scale-110 active:scale-95 flex-shrink-0"
            aria-label={t('إغلاق عارض النص')}
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
              <p className="text-white text-lg mb-2">{t('جاري تحميل التوقيتات الدقيقة...')}</p>
              <p className="text-gray-400 text-sm">{t('من mp3quran.net ⚡')}</p>
            </div>
          ) : mode === 'mushaf' ? (
            mushafTiming ? (
              <div className={isFullscreen ? 'mx-auto max-w-[min(90vw,700px)]' : ''}>
                <MushafPage
                  pageUrl={mushafTiming.page}
                  timings={timings}
                  currentAyah={currentAyah}
                  onSeek={handleSeekToAyah}
                />
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-content-secondary">{t('صفحة المصحف غير متاحة لهذا القارئ')}</p>
              </div>
            )
          ) : ayahs.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400">{t('لا توجد بيانات متاحة')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ayahs.map((ayah) => {
                const timing = timings.find(t => t.ayah === ayah.numberInSurah);
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
                            ? 'bg-spotify-green text-on-accent shadow-lg scale-110'
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
                            <div className="text-content-secondary">
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
                {t('تزامن آية بآية • mp3quran.net')}
              </span>
            </div>
            {timings.length > 0 && (
              <div className="text-gray-400">
                {timings.length} {t('آية موقّتة')} ⚡
              </div>
            )}
          </div>
          {reciterInfo && (
            <div className="mt-2 text-xs text-content-secondary">
              🎙️ القارئ: {reciterInfo.name} • {reciterInfo.rewaya || 'حفص عن عاصم'}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
