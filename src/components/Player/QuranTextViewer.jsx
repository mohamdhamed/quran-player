import { useState, useEffect, useRef } from 'react';
import { X, Loader, BookOpen, CheckCircle, User, AlertTriangle } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { getSurahData, mapReciterToQuranai } from '../../services/quranaiAPI';
import { getReciterById } from '../../services/quranAPI';
import { loadPreciseTimings, getCurrentAyah } from '../../services/preciseTimingService';

export default function QuranTextViewer({ isOpen, onClose }) {
  const { currentSurah, currentReciter, currentTime, duration } = usePlayerStore();
  const [surahData, setSurahData] = useState(null);
  const [timings, setTimings] = useState([]);
  const [currentAyah, setCurrentAyah] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [timingStatus, setTimingStatus] = useState('loading'); // loading, precise, estimated
  const ayahRefs = useRef({});

  // Load surah text and timing when opened
  useEffect(() => {
    if (isOpen && currentSurah) {
      loadSurahData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentSurah?.number, currentReciter]);

  // Update current ayah based on time
  useEffect(() => {
    if (timings.length > 0 && currentTime > 0) {
      const current = getCurrentAyah(currentTime, timings);
      if (current !== currentAyah) {
        setCurrentAyah(current);
        scrollToAyah(current);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime, timings]);

  const loadSurahData = async () => {
    if (!currentSurah) return;

    setIsLoading(true);
    setTimingStatus('loading');
    
    const quranaiReciter = mapReciterToQuranai(currentReciter);
    console.log(`\n🎯 Loading data for Surah ${currentSurah.number}`);
    console.log(`🎤 Reciter: ${currentReciter} → ${quranaiReciter}`);
    console.log(`📊 Verses: ${currentSurah.verses}`);

    try {
      // Get surah text
      console.log(`\n📖 Step 1: Loading surah text...`);
      const data = await getSurahData(currentSurah.number, 'quran-simple');
      
      if (data && data.data) {
        setSurahData(data.data);
        console.log(`✅ Loaded ${data.data.ayahs?.length || 0} ayahs text`);
      }

      // Get PRECISE timing from individual audio files
      // كل قارئ له توقيتات مختلفة لأن طريقة القراءة تختلف
      console.log(`\n⏱️  Step 2: Loading PRECISE timings from audio files...`);
      console.log(`🎯 This is specific to ${currentReciter} - each reciter has different timing!`);
      
      const preciseTimings = await loadPreciseTimings(
        currentSurah.number,
        quranaiReciter,
        currentSurah.verses
      );
      
      if (preciseTimings && preciseTimings.length > 0) {
        setTimings(preciseTimings);
        setTimingStatus('precise');
        console.log(`\n✅ SUCCESS: Loaded ${preciseTimings.length} PRECISE timings`);
        console.log(`⏱️  Each timing is from actual audio file duration`);
        console.log(`📊 Sample:`, preciseTimings.slice(0, 2));
      } else {
        throw new Error('No precise timings loaded');
      }
    } catch (error) {
      console.error('\n❌ Error loading precise timings:', error);
      console.log('⚠️  Falling back to estimated timing...');
      
      // Fallback to estimated timing
      const estimatedTimings = createEstimatedTimings(currentSurah.verses);
      setTimings(estimatedTimings);
      setTimingStatus('estimated');
    } finally {
      setIsLoading(false);
    }
  };

  const createEstimatedTimings = (verseCount) => {
    if (!duration || duration === 0) return [];

    // Smart weighted distribution
    const weights = [];
    for (let i = 0; i < verseCount; i++) {
      if (i === 0) {
        weights.push(0.3); // Bismillah shorter
      } else if (i < 5) {
        weights.push(0.7); // First few verses shorter
      } else if (i >= verseCount - 3) {
        weights.push(0.8); // Last few verses shorter
      } else {
        weights.push(1); // Normal verses
      }
    }

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const baseDuration = duration / totalWeight;

    let currentTime = 0;
    const timings = [];

    for (let i = 0; i < verseCount; i++) {
      const verseDuration = baseDuration * weights[i];
      timings.push({
        ayah: i + 1,
        start: currentTime,
        end: currentTime + verseDuration,
        duration: verseDuration
      });
      currentTime += verseDuration;
    }

    return timings;
  };

  const findCurrentAyah = (time) => {
    if (!timings.length) return 0;

    for (let i = 0; i < timings.length; i++) {
      const timing = timings[i];
      if (time >= timing.start && time <= timing.end) {
        return i + 1;
      }
    }
    return timings.length;
  };

  const scrollToAyah = (ayahNumber) => {
    const element = ayahRefs.current[ayahNumber];
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const reciterInfo = getReciterById(currentReciter);
  const quranaiReciter = mapReciterToQuranai(currentReciter);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn">
      <div 
        className="bg-gradient-to-b from-spotify-gray to-black w-full max-w-4xl h-[90vh] rounded-lg shadow-2xl flex flex-col animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <BookOpen className="text-spotify-green" size={28} />
            <div>
              <h2 className="text-2xl font-bold arabic-text">
                {currentSurah?.name || 'النص القرآني'}
              </h2>
              <p className="text-sm text-gray-400">
                {currentSurah?.nameEn} • {currentSurah?.verses} آية
              </p>
              <div className="flex items-center gap-2 mt-1">
                <User size={14} className="text-spotify-green" />
                <p className="text-xs text-spotify-green">
                  {reciterInfo?.name || 'القارئ'} ({quranaiReciter})
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Timing Status */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-spotify-lightGray">
              {timingStatus === 'precise' ? (
                <>
                  <CheckCircle size={16} className="text-spotify-green" />
                  <span className="text-xs text-spotify-green font-semibold">تزامن دقيق 100%</span>
                </>
              ) : timingStatus === 'estimated' ? (
                <>
                  <AlertTriangle size={16} className="text-yellow-400" />
                  <span className="text-xs text-yellow-400">تزامن تقديري</span>
                </>
              ) : (
                <>
                  <Loader size={16} className="animate-spin text-gray-400" />
                  <span className="text-xs text-gray-400">جاري التحميل...</span>
                </>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-full transition-all hover:scale-110 active:scale-95"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader className="animate-spin text-spotify-green mb-4" size={48} />
              <p className="text-gray-400">جاري تحميل النص...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Bismillah */}
              {currentSurah?.number !== 1 && currentSurah?.number !== 9 && (
                <div className="text-center mb-8 animate-fadeIn">
                  <p className="quran-verse text-4xl text-spotify-green">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </p>
                </div>
              )}

              {/* Ayahs */}
              {surahData?.ayahs?.map((ayah) => {
                const ayahNumber = ayah.numberInSurah;
                const isActive = ayahNumber === currentAyah;
                const timing = timings.find(t => t.ayah === ayahNumber);

                return (
                  <div
                    key={ayah.number}
                    ref={(el) => (ayahRefs.current[ayahNumber] = el)}
                    className={`p-6 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-spotify-green/20 border-2 border-spotify-green shadow-lg shadow-spotify-green/20'
                        : 'bg-spotify-lightGray hover:bg-gray-700'
                    }`}
                    style={{
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    {/* Ayah Header */}
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                          isActive
                            ? 'bg-spotify-green border-spotify-green text-white scale-110'
                            : 'bg-spotify-gray border-gray-600 text-gray-400'
                        }`}>
                          <span className="font-bold text-sm">{ayahNumber}</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          آية {ayahNumber}
                          {timing && (
                            <span className="mr-2">
                              ({formatTime(timing.start)} - {formatTime(timing.end)})
                            </span>
                          )}
                        </div>
                      </div>

                      {isActive && (
                        <div className="flex items-center gap-1 animate-pulse">
                          <div className="w-1 h-6 bg-spotify-green rounded"></div>
                          <div className="w-1 h-8 bg-spotify-green rounded" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1 h-5 bg-spotify-green rounded" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      )}
                    </div>

                    {/* Ayah Text */}
                    <p className={`quran-verse leading-loose text-right transition-all duration-300 ${
                      isActive ? 'text-white text-2xl' : 'text-gray-300 text-xl'
                    }`}>
                      {ayah.text}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-gray-700 bg-spotify-lightGray">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              {timingStatus === 'precise' && (
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-spotify-green" />
                  <span className="text-spotify-green font-semibold">
                    تزامن دقيق 100% من ملفات الصوت الخاصة بـ {reciterInfo?.name}
                  </span>
                </div>
              )}
              {timingStatus === 'estimated' && (
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-yellow-400" />
                  <span className="text-yellow-400">
                    تزامن تقديري (فشل تحميل التوقيتات الدقيقة)
                  </span>
                </div>
              )}
            </div>
            <div className="text-gray-400">
              الآية: <span className="text-white font-semibold">{currentAyah}</span> / {currentSurah?.verses}
            </div>
          </div>
          
          {timingStatus === 'precise' && (
            <div className="mt-2 text-xs text-gray-500">
              💡 كل قارئ له توقيتات مختلفة لأن طريقة القراءة تختلف
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
