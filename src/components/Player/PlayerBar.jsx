import { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Repeat, Repeat1, Heart, BookOpen, X, ChevronDown } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import audioPlayer from '../../services/audioPlayer';
import { getAudioUrl } from '../../services/mp3quranAPI';
import ReciterSelector from './ReciterSelector';
import QuranTextViewer from './QuranTextViewerUnified';

export default function PlayerBar() {
  const [showVolume, setShowVolume] = useState(false);
  const [showTextViewer, setShowTextViewer] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const expandedRef = useRef(null);

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

  // قفل المربع لما تضغط برة
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isExpanded && expandedRef.current && !expandedRef.current.contains(event.target)) {
        // تأكد إنه مش ضاغط على زرار الفتح نفسه
        const surahNameButton = event.target.closest('[data-surah-name-button]');
        if (!surahNameButton) {
          setIsExpanded(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  const {
    currentSurah,
    currentReciter,
    isPlaying,
    volume,
    currentTime,
    duration,
    repeatMode,
    playbackSpeed,
    togglePlay,
    nextSurah,
    previousSurah,
    setVolume,
    setCurrentTime,
    setDuration,
    setIsPlaying,
    cycleRepeatMode,
    toggleFavorite,
    isFavorite
  } = usePlayerStore();

  const progressRef = useRef(null);
  const modalProgressRef = useRef(null);
  const currentAudioRef = useRef(null); // لتتبع الصوت الحالي
  const [hoveredTime, setHoveredTime] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(0);

  // Handle mute/unmute
  const toggleMute = () => {
    if (isMuted) {
      setVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  useEffect(() => {
    if (!currentSurah) return;

    const audioKey = `${currentReciter}-${currentSurah.number}`;
    
    console.log('🔍 PlayerBar Effect:', {
      isPlaying,
      audioKey,
      currentAudioRef: currentAudioRef.current,
      hasHowl: !!audioPlayer.howl,
      howlPlaying: audioPlayer.isPlaying()
    });
    
    if (isPlaying) {
      // تحقق: هل نفس السورة والقارئ وهناك صوت محمّل؟
      if (currentAudioRef.current === audioKey && audioPlayer.howl) {
        // نفس الصوت موجود → استئناف فقط
        console.log('✅ Same audio → Resuming from', audioPlayer.getCurrentTime().toFixed(2), 's');
        audioPlayer.resume();
      } else {
        // صوت جديد → تحميل
        console.log('🆕 Different audio → Loading:', audioKey, '(was:', currentAudioRef.current, ')');
        
        getAudioUrl(currentReciter, currentSurah.number)
          .then(audioUrl => {
            if (audioUrl) {
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
              audioPlayer.setVolume(volume);
              console.log('✅ Audio loaded and playing');
            }
          })
          .catch(error => {
            console.error('❌ Error loading audio:', error);
          });
      }
    } else {
      // إيقاف مؤقت فقط
      if (audioPlayer.isPlaying()) {
        console.log('⏸️ Pausing audio at', audioPlayer.getCurrentTime().toFixed(2), 's');
        audioPlayer.pause();
      }
    }
  }, [currentSurah, isPlaying, currentReciter]);

  useEffect(() => {
    audioPlayer.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    if (playbackSpeed) {
      audioPlayer.setRate(playbackSpeed);
    }
  }, [playbackSpeed]);

  const handleSeek = (e) => {
    if (!duration || !progressRef.current) return;
    
    const progressBar = progressRef.current;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    
    // RTL: نعكس الحساب - من اليمين لليسار
    const seekTime = ((width - clickX) / width) * duration;
    
    console.log('🎯 Seeking:', {
      clickX,
      width,
      seekTime: seekTime.toFixed(2),
      duration: duration.toFixed(2)
    });
    
    audioPlayer.seek(seekTime);
    setCurrentTime(seekTime);
  };

  const handleProgressHover = (e) => {
    const progressBar = progressRef.current;
    if (!progressBar || !duration) return;
    
    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    // RTL: الوقت من اليمين لليسار (معكوس)
    const time = ((width - x) / width) * duration;
    // RTL: الموضع أيضاً معكوس (من اليمين)
    const percentage = ((width - x) / width) * 100;
    
    setHoveredTime(time);
    setHoverPosition(percentage);
  };

  const handleProgressLeave = () => {
    setHoveredTime(null);
  };

  // Handler للـ modal progress bar
  const handleModalSeek = (e) => {
    if (!duration || !modalProgressRef.current) return;
    
    const progressBar = modalProgressRef.current;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    
    // RTL: نعكس الحساب - من اليمين لليسار
    const seekTime = ((width - clickX) / width) * duration;
    
    console.log('🎯 Modal Seeking:', {
      clickX,
      width,
      seekTime: seekTime.toFixed(2),
      duration: duration.toFixed(2)
    });
    
    audioPlayer.seek(seekTime);
    setCurrentTime(seekTime);
  };

  const handleModalProgressHover = (e) => {
    const progressBar = modalProgressRef.current;
    if (!progressBar || !duration) return;
    
    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    // RTL: الوقت من اليمين لليسار (معكوس)
    const time = ((width - x) / width) * duration;
    // RTL: الموضع أيضاً معكوس (من اليمين)
    const percentage = ((width - x) / width) * 100;
    
    setHoveredTime(time);
    setHoverPosition(percentage);
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRepeatIcon = () => {
    if (repeatMode === 'one') return <Repeat1 size={18} className="text-spotify-green" />;
    if (repeatMode === 'all') return <Repeat size={18} className="text-spotify-green" />;
    return <Repeat size={18} className="text-gray-400" />;
  };

  if (!currentSurah) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-spotify-gray to-transparent px-6 py-4 border-t border-gray-800/50">
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

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-spotify-lightGray/98 to-spotify-gray/95 backdrop-blur-xl border-t border-gray-700/40 shadow-2xl">
        {/* Progress Bar - Enhanced */}
        <div className="px-6 pt-3 pb-2">
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400 font-mono w-11 text-right transition-all duration-200 hover:text-spotify-green hover:scale-105">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1 relative">
              <div
                ref={progressRef}
                className="h-1.5 bg-gray-700/60 rounded-full cursor-pointer relative group transition-all duration-200 hover:h-2.5"
                onClick={handleSeek}
                onMouseMove={handleProgressHover}
                onMouseLeave={handleProgressLeave}
              >
                {/* Background Glow */}
                <div className="absolute inset-0 bg-spotify-green/5 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                {/* Progress Fill with Gradient */}
                <div
                  className="absolute h-full bg-gradient-to-l from-spotify-green via-green-400 to-green-300 rounded-full transition-all duration-150 shadow-lg shadow-spotify-green/20"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%`, right: 0 }}
                >
                  {/* Playhead - في نهاية الـ progress */}
                  <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-xl shadow-spotify-green/40 transition-all duration-200 scale-0 group-hover:scale-100 ring-2 ring-spotify-green/30"></div>
                  
                  {/* Wave Animation - في نهاية الـ progress */}
                  {isPlaying && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-full bg-white/40 blur-sm animate-pulse"></div>
                  )}
                </div>

                {/* Hover Tooltip */}
                {hoveredTime !== null && (
                  <div 
                    className="absolute -top-10 transition-all duration-100 pointer-events-none"
                    style={{ 
                      right: `${hoverPosition}%`,
                      transform: 'translateX(50%)'
                    }}
                  >
                    <div className="bg-white text-black px-2.5 py-1.5 rounded-lg shadow-xl text-xs font-semibold whitespace-nowrap">
                      {formatTime(hoveredTime)}
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-4 border-transparent border-t-white"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <span className="text-xs text-gray-400 font-mono w-11 transition-all duration-200 hover:text-spotify-green hover:scale-105">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="px-3 md:px-6 pb-3 md:pb-5 grid grid-cols-1 md:grid-cols-[2fr_auto_2fr] items-center gap-3 md:gap-8">
          {/* Right: Enhanced Surah Info */}
          <div className="flex items-center gap-2 md:gap-4 justify-end order-1 md:order-1">
            {/* Thumbnail with Playing Animation */}
            <div className="relative flex-shrink-0 group">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-spotify-green/30 via-green-600/20 to-green-900/30 rounded-xl flex flex-col items-center justify-center border border-spotify-green/30 transition-all duration-300 group-hover:scale-110 group-hover:border-spotify-green/50 group-hover:shadow-lg group-hover:shadow-spotify-green/20 backdrop-blur-sm p-1">
                <span className="text-xs md:text-sm font-arabic text-spotify-green font-bold drop-shadow-lg text-center leading-tight">
                  {currentSurah.name}
                </span>
                <span className="text-[8px] md:text-[10px] text-gray-400 mt-0.5 hidden md:block">
                  {currentSurah.nameEn}
                </span>
              </div>
              {/* Playing Wave Indicator */}
              {isPlaying && (
                <div className="absolute -bottom-1 -right-1 flex items-end gap-0.5 bg-spotify-green rounded-full px-1.5 py-1 shadow-lg animate-fadeIn">
                  <div className="w-0.5 bg-white rounded-full animate-wave" style={{ height: '4px', animationDelay: '0ms' }}></div>
                  <div className="w-0.5 bg-white rounded-full animate-wave" style={{ height: '8px', animationDelay: '150ms' }}></div>
                  <div className="w-0.5 bg-white rounded-full animate-wave" style={{ height: '6px', animationDelay: '300ms' }}></div>
                  <div className="w-0.5 bg-white rounded-full animate-wave" style={{ height: '4px', animationDelay: '450ms' }}></div>
                </div>
              )}
            </div>
            
            {/* Surah Details - Clickable to Expand */}
            <button 
              data-surah-name-button
              onClick={() => setIsExpanded(true)}
              className="min-w-0 flex-1 text-right group/expand hidden md:block"
            >
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-white font-bold arabic-text text-lg truncate transition-all duration-200 group-hover/expand:text-spotify-green cursor-pointer">
                  {currentSurah.name}
                </p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  currentSurah.revelationType === 'Meccan' 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                    : 'bg-green-500/20 text-green-400 border border-green-500/30'
                }`}>
                  {currentSurah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="transition-colors group-hover/expand:text-white cursor-pointer">{currentSurah.nameEn}</span>
                <span className="text-gray-600">•</span>
                <span className="transition-colors group-hover/expand:text-spotify-green cursor-pointer">{currentSurah.verses} آية</span>
              </div>
            </button>

            {/* Favorite Button */}
            <button
              onClick={() => toggleFavorite(currentSurah)}
              className="p-2.5 hover:bg-gray-700/60 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 flex-shrink-0"
              title={isFavorite(currentSurah) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
            >
              <Heart
                size={20}
                fill={isFavorite(currentSurah) ? '#1DB954' : 'none'}
                className={`transition-all duration-300 ${
                  isFavorite(currentSurah) 
                    ? 'text-spotify-green drop-shadow-[0_0_8px_rgba(29,185,84,0.6)]' 
                    : 'text-gray-400 hover:text-spotify-green'
                }`}
              />
            </button>
          </div>

          {/* Center: Playback Controls */}
          <div className="flex items-center gap-4 justify-self-center">
            <button
              onClick={cycleRepeatMode}
              className="p-2.5 hover:bg-gray-700/60 rounded-xl transition-all hover:scale-110 active:scale-95"
              title={repeatMode === 'one' ? 'تكرار واحد' : repeatMode === 'all' ? 'تكرار الكل' : 'بدون تكرار'}
            >
              {getRepeatIcon()}
            </button>
            
            <button
              onClick={previousSurah}
              className="p-3 hover:bg-gray-700/60 rounded-xl transition-all group hover:scale-110 active:scale-95"
              title="السابق"
            >
              <SkipBack size={22} className="text-gray-300 group-hover:text-white transition-colors" />
            </button>
            
            <button
              onClick={togglePlay}
              className="w-14 h-14 bg-white hover:scale-105 active:scale-95 rounded-full flex items-center justify-center transition-all duration-200 shadow-2xl hover:shadow-spotify-green/30"
              title={isPlaying ? 'إيقاف' : 'تشغيل'}
            >
              {isPlaying ? (
                <Pause size={24} className="text-black" fill="black" />
              ) : (
                <Play size={24} className="text-black mr-0.5" fill="black" />
              )}
            </button>
            
            <button
              onClick={nextSurah}
              className="p-3 hover:bg-gray-700/60 rounded-xl transition-all group hover:scale-110 active:scale-95"
              title="التالي"
            >
              <SkipForward size={22} className="text-gray-300 group-hover:text-white transition-colors" />
            </button>

            <ReciterSelector />
          </div>

          {/* Left: Volume & Text Viewer */}
          <div className="flex items-center gap-3 justify-self-start">
            <button
              data-text-viewer-button
              onClick={() => setShowTextViewer(true)}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-all hover:scale-110 active:scale-95 group"
              title="عرض النص القرآني"
            >
              <BookOpen size={18} className="text-gray-400 group-hover:text-spotify-green transition-colors" />
            </button>

            <div className="relative group/volume">
              <button
                onClick={toggleMute}
                onMouseEnter={() => setShowVolume(true)}
                onMouseLeave={() => setShowVolume(false)}
                className="p-2 hover:bg-gray-700/60 rounded-xl transition-all hover:scale-110 active:scale-95"
                title={isMuted ? 'إلغاء الكتم' : `الصوت: ${Math.round(volume * 100)}%`}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX size={18} className="text-red-400 group-hover/volume:text-red-300 transition-colors duration-200" />
                ) : (
                  <Volume2 size={18} className="text-gray-400 group-hover/volume:text-spotify-green transition-colors duration-200" />
                )}
              </button>
              
              {showVolume && (
                <div 
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-spotify-lightGray rounded-xl p-2.5 shadow-2xl border border-gray-700/50 backdrop-blur-sm animate-fadeIn"
                  onMouseEnter={() => setShowVolume(true)}
                  onMouseLeave={() => setShowVolume(false)}
                  style={{ zIndex: 100 }}
                >
                  {/* Arrow */}
                  <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-spotify-lightGray border-b border-r border-gray-700/50 rotate-45"></div>
                  
                  <div className="flex flex-col items-center gap-2 w-8">
                    {/* Volume Percentage */}
                    <div className="flex items-center justify-center w-7 h-7 bg-spotify-green/10 rounded-lg border border-spotify-green/30">
                      <span className="text-xs font-bold text-spotify-green">{Math.round(volume * 100)}</span>
                    </div>
                    
                    {/* Volume Slider */}
                    <div 
                      className="relative h-20 w-1.5 bg-gray-700/50 rounded-full overflow-hidden cursor-pointer group/slider hover:w-2 transition-all duration-200"
                      onMouseDown={(e) => {
                        const slider = e.currentTarget;
                        
                        const handleMove = (moveEvent) => {
                          const rect = slider.getBoundingClientRect();
                          const y = rect.bottom - moveEvent.clientY;
                          const newVolume = Math.max(0, Math.min(1, y / rect.height));
                          setVolume(newVolume);
                          if (isMuted && newVolume > 0) {
                            setIsMuted(false);
                          }
                        };
                        
                        handleMove(e);
                        
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        
                        document.addEventListener('mousemove', handleMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    >
                      {/* Fill */}
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-spotify-green via-spotify-green to-green-400 rounded-full pointer-events-none"
                        style={{ height: `${volume * 100}%`, transition: 'height 0.05s ease-out' }}
                      ></div>
                      
                      {/* Thumb */}
                      <div 
                        className="absolute left-1/2 transform -translate-x-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-lg pointer-events-none opacity-0 group-hover/slider:opacity-100 scale-0 group-hover/slider:scale-100"
                        style={{ bottom: `calc(${volume * 100}% - 5px)`, transition: 'bottom 0.05s ease-out, opacity 0.15s, transform 0.15s' }}
                      ></div>
                    </div>
                    
                    {/* Volume Icons */}
                    <div className="flex flex-col gap-0.5 text-gray-600 opacity-50">
                      <div className="w-0.5 h-2 bg-current rounded-full"></div>
                      <div className="w-0.5 h-1.5 bg-current rounded-full"></div>
                      <div className="w-0.5 h-1 bg-current rounded-full"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay خفيف جداً - تقدر تختار سورة من وراه */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 animate-fadeIn pointer-events-none"
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        />
      )}

      {/* Expanded Popup - فوق اسم السورة */}
      {isExpanded && currentSurah && (
        <div 
          ref={expandedRef}
          className="fixed bottom-24 right-6 w-96 bg-spotify-gray/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 z-50 animate-slideUp pointer-events-auto" 
          style={{ 
            animation: 'slideUpScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.5), 0 0 100px rgba(29, 185, 84, 0.1)'
          }}
        >
          <div className="p-6">
            {/* Close Button */}
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-3 left-3 p-1.5 hover:bg-gray-700/60 rounded-lg transition-all hover:scale-110 active:scale-95 group"
            >
              <ChevronDown size={20} className="text-gray-400 group-hover:text-white transition-colors" />
            </button>

            {/* Content */}
            <div className="flex flex-col items-center gap-5">
              {/* Compact Thumbnail */}
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-spotify-green/30 via-green-600/20 to-green-900/30 rounded-xl flex items-center justify-center border-2 border-spotify-green/30 shadow-xl shadow-spotify-green/20 backdrop-blur-sm p-4">
                  <span className="text-3xl font-arabic text-spotify-green font-bold drop-shadow-xl text-center leading-tight">
                    {currentSurah.name}
                  </span>
                </div>
                {/* Playing Wave Indicator */}
                {isPlaying && (
                  <div className="absolute -bottom-1.5 -right-1.5 flex items-end gap-0.5 bg-spotify-green rounded-lg px-2 py-1.5 shadow-lg animate-fadeIn">
                    <div className="w-0.5 bg-white rounded-full animate-wave" style={{ height: '4px', animationDelay: '0ms' }}></div>
                    <div className="w-0.5 bg-white rounded-full animate-wave" style={{ height: '10px', animationDelay: '150ms' }}></div>
                    <div className="w-0.5 bg-white rounded-full animate-wave" style={{ height: '7px', animationDelay: '300ms' }}></div>
                    <div className="w-0.5 bg-white rounded-full animate-wave" style={{ height: '4px', animationDelay: '450ms' }}></div>
                  </div>
                )}
              </div>

              {/* Surah Info */}
              <div className="text-center -mt-1">
                <div className="flex items-center justify-center gap-2 mb-1.5">
                  <h1 className="text-2xl font-bold arabic-text text-white">{currentSurah.name}</h1>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                    currentSurah.revelationType === 'Meccan' 
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                      : 'bg-green-500/20 text-green-400 border border-green-500/30'
                  }`}>
                    {currentSurah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-1">{currentSurah.nameEn}</p>
                <p className="text-spotify-green text-xs">{currentSurah.verses} آية</p>
              </div>

              {/* Compact Progress Bar */}
              <div className="w-full -mt-1">
                <div
                  ref={modalProgressRef}
                  className="relative h-1.5 bg-gray-700/50 rounded-full cursor-pointer overflow-hidden group"
                  onClick={handleModalSeek}
                  onMouseMove={handleModalProgressHover}
                  onMouseLeave={() => setHoveredTime(null)}
                >
                  <div
                    className="absolute top-0 h-full bg-gradient-to-l from-spotify-green via-green-500 to-green-400 rounded-full transition-all duration-200"
                    style={{ width: `${(currentTime / duration) * 100}%`, right: 0 }}
                  >
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>

                  {hoveredTime !== null && (
                    <div
                      className="absolute -top-10 transform -translate-x-1/2 bg-spotify-lightGray px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xl border border-gray-700 whitespace-nowrap pointer-events-none"
                      style={{ right: `${hoverPosition}%`, transform: 'translateX(50%)' }}
                    >
                      {formatTime(hoveredTime)}
                    </div>
                  )}
                </div>

                {/* Time Display */}
                <div className="flex justify-between mt-3 text-sm text-gray-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Compact Controls */}
              <div className="flex items-center justify-center gap-3 -mt-1">
                <button
                  onClick={cycleRepeatMode}
                  className="p-1.5 hover:bg-gray-700/60 rounded-lg transition-all hover:scale-110 active:scale-95"
                  title={repeatMode === 'one' ? 'تكرار واحد' : repeatMode === 'all' ? 'تكرار الكل' : 'بدون تكرار'}
                >
                  {getRepeatIcon()}
                </button>

                <button
                  onClick={previousSurah}
                  className="p-1.5 hover:bg-gray-700/60 rounded-lg transition-all group hover:scale-110 active:scale-95"
                  title="السابق"
                >
                  <SkipBack size={20} className="text-gray-300 group-hover:text-white transition-colors" />
                </button>

                <button
                  onClick={togglePlay}
                  className="w-12 h-12 bg-white hover:scale-105 active:scale-95 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-spotify-green/50"
                  title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                >
                  {isPlaying ? (
                    <Pause size={20} className="text-black" />
                  ) : (
                    <Play size={20} className="text-black mr-0.5" />
                  )}
                </button>

                <button
                  onClick={nextSurah}
                  className="p-1.5 hover:bg-gray-700/60 rounded-lg transition-all group hover:scale-110 active:scale-95"
                  title="التالي"
                >
                  <SkipForward size={20} className="text-gray-300 group-hover:text-white transition-colors" />
                </button>

                <button
                  onClick={() => toggleFavorite(currentSurah)}
                  className="p-1.5 hover:bg-gray-700/60 rounded-lg transition-all hover:scale-110 active:scale-95 group"
                  title={isFavorite(currentSurah) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                >
                  <Heart
                    size={18}
                    className={`transition-all duration-200 ${
                      isFavorite(currentSurah)
                        ? 'fill-red-500 text-red-500 scale-110'
                        : 'text-gray-400 group-hover:text-red-400 group-hover:scale-110'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
