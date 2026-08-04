import { useEffect, useRef, useState, useCallback } from 'react';
import { BookOpen } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { usePlayerStore } from '../../store/playerStore';
import audioPlayer from '../../services/audioPlayer';
import quranService from '../../services/QuranService';
import ReciterSelector from './ReciterSelector';
import QuranTextViewer from './QuranTextViewerUnified';

// المكونات المقسمة
import {
  PlayerControls,
  ProgressBar,
  VolumeControl,
  ExpandedPlayer,
  SurahInfo
} from './components';

/**
 * شريط المشغل الرئيسي
 * تم إعادة هيكلته ليستخدم مكونات صغيرة ومنفصلة
 * 
 * المكونات:
 * - SurahInfo: معلومات السورة الحالية
 * - PlayerControls: أزرار التحكم (Play, Pause, Next, Previous)
 * - ProgressBar: شريط التقدم
 * - VolumeControl: التحكم بالصوت
 * - ExpandedPlayer: المشغل الموسع (Popup)
 */
export default function PlayerBar() {
  // State المحلي
  const [showTextViewer, setShowTextViewer] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);

  // Ref لتتبع الصوت الحالي
  const currentAudioRef = useRef(null);

  // Store
  // مهم: currentTime و duration مش هنا عن قصد.
  // دول بيتحدّثوا 10 مرات في الثانية، ولو اشتركنا فيهم هنا كان المشغل
  // كله (وكل المكوّنات اللي تحته) هيعمل re-render بنفس المعدّل.
  // ProgressBar بيقراهم من الـ store لوحده.
  const {
    currentSurah,
    currentReciter,
    isPlaying,
    volume,
    repeatMode,
    playbackSpeed,
    togglePlay,
    nextSurah,
    previousSurah,
    setVolume,
    setCurrentTime,
    setDuration,
    cycleRepeatMode,
    toggleFavorite,
    isFavorite
  } = usePlayerStore(
    useShallow((state) => ({
      currentSurah: state.currentSurah,
      currentReciter: state.currentReciter,
      isPlaying: state.isPlaying,
      volume: state.volume,
      repeatMode: state.repeatMode,
      playbackSpeed: state.playbackSpeed,
      togglePlay: state.togglePlay,
      nextSurah: state.nextSurah,
      previousSurah: state.previousSurah,
      setVolume: state.setVolume,
      setCurrentTime: state.setCurrentTime,
      setDuration: state.setDuration,
      cycleRepeatMode: state.cycleRepeatMode,
      toggleFavorite: state.toggleFavorite,
      isFavorite: state.isFavorite
    }))
  );

  // لما واحدة تفتح، التانية تقفل
  useEffect(() => {
    if (isExpanded && showTextViewer) {
      setShowTextViewer(false);
    }
  }, [isExpanded]);

  useEffect(() => {
    if (showTextViewer && isExpanded) {
      setIsExpanded(false);
    }
  }, [showTextViewer]);

  /**
   * معالج Mute/Unmute
   */
  const handleToggleMute = useCallback(() => {
    if (isMuted) {
      setVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  }, [isMuted, previousVolume, volume, setVolume]);

  /**
   * معالج تغيير الصوت
   */
  const handleVolumeChange = useCallback((newVolume) => {
    setVolume(newVolume);
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
  }, [setVolume, isMuted]);

  // تشغيل الصوت
  useEffect(() => {
    if (!currentSurah) return;

    const audioKey = `${currentReciter}-${currentSurah.number}`;

    // حارس ضد الطلبات القديمة: لو المستخدم غيّر السورة أو القارئ أو عمل Pause
    // والتحميل لسه شغال، الـ cleanup بيرفع الفلاج والنتيجة القديمة تتجاهل
    let cancelled = false;

    if (isPlaying) {
      // تحقق: هل نفس السورة والقارئ وهناك صوت محمّل؟
      if (currentAudioRef.current === audioKey && audioPlayer.howl) {
        // نفس الصوت موجود → استئناف فقط
        audioPlayer.resume();
      } else {
        // صوت جديد → تحميل
        quranService.getAudioUrl(currentReciter, currentSurah.number)
          .then(audioUrl => {
            if (cancelled || !audioUrl) return;

            // حفظ المرجع قبل التشغيل
            currentAudioRef.current = audioKey;

            audioPlayer.play(
              audioUrl,
              () => {
                nextSurah();
              },
              (time, dur) => {
                setCurrentTime(time);
                setDuration(dur);
              }
            );
            // الصوت الجديد بيبدأ بـ volume = 1 افتراضياً، فنضبطه من الـ store
            audioPlayer.setVolume(usePlayerStore.getState().volume);
          })
          .catch(error => {
            if (cancelled) return;
            console.error('Error loading audio:', error);
          });
      }
    } else {
      // إيقاف مؤقت فقط
      if (audioPlayer.isPlaying()) {
        audioPlayer.pause();
      }
    }

    return () => {
      cancelled = true;
    };
    // volume مش في الـ deps عن قصد: تغيير الصوت مالوش دعوة بإعادة تحميل
    // الملف، وفيه effect منفصل تحت بيتولاه
  }, [currentSurah, isPlaying, currentReciter, nextSurah, setCurrentTime, setDuration]);

  // تحديث الصوت
  useEffect(() => {
    audioPlayer.setVolume(volume);
  }, [volume]);

  // تحديث سرعة التشغيل
  useEffect(() => {
    if (playbackSpeed) {
      audioPlayer.setRate(playbackSpeed);
    }
  }, [playbackSpeed]);

  // إذا لم يكن هناك سورة محددة
  if (!currentSurah) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black via-spotify-gray to-transparent px-6 py-4 border-t border-gray-800/50">
        <div className="text-center text-gray-500 text-sm">
          <p>اختر سورة للبدء 🎵</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Quran Text Viewer Modal */}
      <QuranTextViewer
        isOpen={showTextViewer}
        onClose={() => setShowTextViewer(false)}
      />

      {/* Main Player Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black via-spotify-lightGray/98 to-spotify-gray/95 backdrop-blur-xl border-t border-gray-700/40 shadow-2xl">
        {/* Progress Bar */}
        <ProgressBar variant="full" />

        {/* Main Controls */}
        <div className="px-3 md:px-6 pb-3 md:pb-5 grid grid-cols-1 md:grid-cols-[2fr_auto_2fr] items-center gap-3 md:gap-8">
          {/* Right: Surah Info */}
          <SurahInfo
            currentSurah={currentSurah}
            isPlaying={isPlaying}
            isFavorite={isFavorite(currentSurah)}
            onToggleFavorite={toggleFavorite}
            onExpand={() => setIsExpanded(true)}
          />

          {/* Center: Playback Controls */}
          <PlayerControls
            isPlaying={isPlaying}
            repeatMode={repeatMode}
            onTogglePlay={togglePlay}
            onNextSurah={nextSurah}
            onPreviousSurah={previousSurah}
            onCycleRepeatMode={cycleRepeatMode}
            size="normal"
          >
            <ReciterSelector />
          </PlayerControls>

          {/* Left: Volume & Text Viewer */}
          <div className="flex items-center gap-3 justify-self-start">
            <button
              data-text-viewer-button
              onClick={() => setShowTextViewer(true)}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-all hover:scale-110 active:scale-95 group"
              title="عرض النص القرآني"
              aria-label="عرض النص القرآني"
            >
              <BookOpen size={18} className="text-gray-400 group-hover:text-spotify-green transition-colors" />
            </button>

            <VolumeControl
              volume={volume}
              isMuted={isMuted}
              onVolumeChange={handleVolumeChange}
              onToggleMute={handleToggleMute}
            />
          </div>
        </div>
      </div>

      {/* Expanded Player Popup */}
      <ExpandedPlayer
        isOpen={isExpanded}
        onClose={() => setIsExpanded(false)}
        currentSurah={currentSurah}
        isPlaying={isPlaying}
        repeatMode={repeatMode}
        onTogglePlay={togglePlay}
        onNextSurah={nextSurah}
        onPreviousSurah={previousSurah}
        onCycleRepeatMode={cycleRepeatMode}
        onToggleFavorite={toggleFavorite}
        isFavorite={isFavorite(currentSurah)}
      />
    </>
  );
}
