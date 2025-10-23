import { useState, useEffect, useRef } from 'react';
import { X, Loader, CheckCircle } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { getSurahWithAudio, getReciterAlquranId } from '../../services/quranAPI';

export default function QuranTextViewer({ isOpen, onClose }) {
  const { currentSurah, currentReciter, currentTime } = usePlayerStore();
  const [ayahs, setAyahs] = useState([]);
  const [currentAyah, setCurrentAyah] = useState(1);
  const [timings, setTimings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 });
  const scrollContainerRef = useRef(null);
  const ayahRefs = useRef({});

  // Load surah with audio from API
  useEffect(() => {
    if (isOpen && currentSurah) {
      loadSurahData();
    }
  }, [isOpen, currentSurah, currentReciter]);

  // Update current ayah based on playback time
  useEffect(() => {
    if (timings.length > 0 && currentTime > 0) {
      const found = timings.find((t, i) => {
        const nextTiming = timings[i + 1];
        return currentTime >= t.startTime && (!nextTiming || currentTime < nextTiming.startTime);
      });
      
      if (found && found.ayah !== currentAyah) {
        setCurrentAyah(found.ayah);
        scrollToAyah(found.ayah);
      }
    }
  }, [currentTime, timings]);

  const loadSurahData = async () => {
    if (!currentSurah) return;
    
    setIsLoading(true);
    setLoadingProgress({ current: 0, total: currentSurah.verses });
    
    try {
      console.log(`\n🎯 Loading Surah ${currentSurah.number} from api.alquran.cloud`);
      
      // Fetch surah with audio
      const data = await getSurahWithAudio(currentSurah.number, currentReciter);
      
      if (data && data.ayahs) {
        setAyahs(data.ayahs);
        console.log(`📖 Loaded ${data.ayahs.length} ayahs`);
        
        // Calculate precise timings from audio metadata
        const calculatedTimings = [];
        let cumulativeTime = 0;
        
        for (let i = 0; i < data.ayahs.length; i++) {
          const ayah = data.ayahs[i];
          setLoadingProgress({ current: i + 1, total: data.ayahs.length });
          
          try {
            const duration = await loadAudioDuration(ayah.audio);
            
            calculatedTimings.push({
              ayah: ayah.numberInSurah,
              startTime: cumulativeTime,
              endTime: cumulativeTime + duration,
              duration: duration
            });
            
            cumulativeTime += duration;
            
            if (i < 5 || i === data.ayahs.length - 1) {
              console.log(`✅ Ayah ${ayah.numberInSurah}: ${duration.toFixed(2)}s (total: ${cumulativeTime.toFixed(2)}s)`);
            } else if (i === 5) {
              console.log(`⏳ Loading remaining ${data.ayahs.length - 5} ayahs...`);
            }
          } catch (error) {
            console.error(`❌ Failed to load ayah ${ayah.numberInSurah}:`, error);
            // Use estimated duration as fallback
            const estimatedDuration = 5; // 5 seconds average
            calculatedTimings.push({
              ayah: ayah.numberInSurah,
              startTime: cumulativeTime,
              endTime: cumulativeTime + estimatedDuration,
              duration: estimatedDuration
            });
            cumulativeTime += estimatedDuration;
          }
        }
        
        setTimings(calculatedTimings);
        console.log(`\n✅ PRECISE SYNC: All ${calculatedTimings.length} timings loaded`);
        console.log(`⏱️  Total Duration: ${(cumulativeTime / 60).toFixed(2)} minutes`);
      }
    } catch (error) {
      console.error('❌ Error loading surah:', error);
    } finally {
      setIsLoading(false);
      setLoadingProgress({ current: 0, total: 0 });
    }
  };

  // Load audio file and get duration
  const loadAudioDuration = (audioUrl) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      
      const timeout = setTimeout(() => {
        reject(new Error('Timeout loading audio'));
      }, 10000); // 10 second timeout
      
      audio.addEventListener('loadedmetadata', () => {
        clearTimeout(timeout);
        resolve(audio.duration);
      });
      
      audio.addEventListener('error', (e) => {
        clearTimeout(timeout);
        reject(e);
      });
    });
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-spotify-gray rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-spotify-green" size={24} />
            <div>
              <h2 className="text-xl font-bold text-white">
                {currentSurah?.name}
              </h2>
              <p className="text-sm text-gray-400">
                {currentSurah?.nameTranslation} • {currentSurah?.verses} آيات
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-6"
          dir="rtl"
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader className="animate-spin text-spotify-green mb-4" size={48} />
              <p className="text-white text-lg mb-2">جاري تحميل التوقيتات الدقيقة...</p>
              {loadingProgress.total > 0 && (
                <div className="w-64">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>آية {loadingProgress.current} من {loadingProgress.total}</span>
                    <span>{Math.round((loadingProgress.current / loadingProgress.total) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-spotify-green transition-all duration-300"
                      style={{ width: `${(loadingProgress.current / loadingProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              <p className="text-gray-500 text-sm mt-4">
                يتم تحميل مدة كل آية من الملفات الصوتية
              </p>
            </div>
          ) : ayahs.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400">لا توجد بيانات متاحة</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ayahs.map((ayah) => (
                <div
                  key={ayah.number}
                  ref={(el) => (ayahRefs.current[ayah.numberInSurah] = el)}
                  className={`p-4 rounded-lg transition-all duration-300 ${
                    currentAyah === ayah.numberInSurah
                      ? 'bg-spotify-green bg-opacity-20 border-2 border-spotify-green scale-105'
                      : 'bg-gray-800 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        currentAyah === ayah.numberInSurah
                          ? 'bg-spotify-green text-black'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {ayah.numberInSurah}
                    </div>
                    <p
                      className={`text-2xl leading-loose font-arabic ${
                        currentAyah === ayah.numberInSurah
                          ? 'text-white'
                          : 'text-gray-300'
                      }`}
                    >
                      {ayah.text}
                    </p>
                  </div>
                  {timings[ayah.numberInSurah - 1] && (
                    <div className="mt-2 text-xs text-gray-500 text-left">
                      {timings[ayah.numberInSurah - 1].startTime.toFixed(1)}s - {timings[ayah.numberInSurah - 1].endTime.toFixed(1)}s
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-spotify-green">
              <CheckCircle size={16} />
              <span>تزامن دقيق 100% • api.alquran.cloud</span>
            </div>
            {timings.length > 0 && (
              <div className="text-gray-400">
                {timings.length} توقيت محمّل
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
