import { useMemo } from 'react';
import { Play } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import surahsData from '../data/surahs.json';

export default function Home() {
  // استخدام selectors لتجنب re-render عند تغيير أي state آخر (مثل currentReciter)
  const playSurah = usePlayerStore((state) => state.playSurah);
  const currentSurah = usePlayerStore((state) => state.currentSurah);
  const recentlyPlayed = usePlayerStore((state) => state.recentlyPlayed);

  // استقرار recentlyPlayed: نحدث فقط عند تغيير محتوى حقيقي
  const stableRecentlyPlayed = useMemo(() => {
    // نحفظ الـ6 الأوائل فقط ونرجع array جديد فقط عند تغيير حقيقي
    return recentlyPlayed.slice(0, 6);
  }, [JSON.stringify(recentlyPlayed.slice(0, 6).map(s => s.number))]);

  const popularSurahs = useMemo(() => [
    surahsData[0],   // الفاتحة
    surahsData[35],  // يس
    surahsData[17],  // الكهف
    surahsData[54],  // الرحمن
    surahsData[67],  // الملك
    surahsData[77],  // النبأ
  ], []);

  // مكون للبطاقات - محسّن مع Wave animation وألوان
  const SurahCard = ({ surah, index = 0 }) => {
    const isPlaying = currentSurah?.number === surah.number;
    const isMeccan = surah.revelationType === 'Meccan';
    
    // ألوان حسب نوع السورة
    const typeColors = isMeccan 
      ? {
          bg: 'bg-blue-500/10',
          bgHover: 'group-hover:bg-blue-500/20',
          border: 'border-blue-500/30',
          text: 'text-blue-400',
          glow: 'group-hover:shadow-blue-500/20'
        }
      : {
          bg: 'bg-green-500/10',
          bgHover: 'group-hover:bg-green-500/20',
          border: 'border-green-500/30',
          text: 'text-green-400',
          glow: 'group-hover:shadow-green-500/20'
        };
    
    return (
      <div
        className={`surah-card group relative overflow-hidden ${typeColors.bg} ${typeColors.bgHover} border ${typeColors.border}`}
        onClick={() => playSurah(surah)}
        style={{
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="flex items-center gap-4 relative z-10">
          {/* Thumbnail مع Wave Animation */}
          <div className="relative w-20 h-20 bg-spotify-gray rounded-xl flex flex-col items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 p-2">
            <span className={`text-base font-arabic ${typeColors.text} font-bold transition-all duration-300 group-hover:scale-110 text-center leading-tight`}>
              {surah.name}
            </span>
            <span className="text-xs text-gray-400 mt-0.5 transition-colors duration-300 group-hover:text-white">
              {surah.nameEn}
            </span>
            
            {/* Wave Animation عند التشغيل */}
            {isPlaying && (
              <div className="absolute -bottom-1 -left-1 flex items-end gap-0.5 bg-spotify-green rounded-full px-1.5 py-1 shadow-lg animate-fadeIn">
                <div className="w-0.5 bg-white rounded-full animate-wave" style={{ height: '4px', animationDelay: '0ms' }}></div>
                <div className="w-0.5 bg-white rounded-full animate-wave" style={{ height: '8px', animationDelay: '150ms' }}></div>
                <div className="w-0.5 bg-white rounded-full animate-wave" style={{ height: '6px', animationDelay: '300ms' }}></div>
                <div className="w-0.5 bg-white rounded-full animate-wave" style={{ height: '4px', animationDelay: '450ms' }}></div>
              </div>
            )}
          </div>
          
          {/* معلومات السورة */}
          <div className="flex-1 text-right">
            <h3 className={`text-lg font-semibold arabic-text mb-1 transition-colors duration-300 group-hover:${typeColors.text}`}>
              سورة {surah.name}
            </h3>
            <p className="text-xs text-gray-500 mt-1 transition-colors duration-300 group-hover:text-gray-300">
              {surah.verses} آية • {isMeccan ? 'مكية' : 'مدنية'}
            </p>
          </div>
          
          {/* Play Button */}
          <button className="play-button-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-12">
            <Play size={20} fill="white" />
          </button>
        </div>
        
        {/* Progress Bar عند التشغيل */}
        {isPlaying && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-l from-spotify-green to-green-400 shadow-lg shadow-spotify-green/50"></div>
        )}
        
        {/* Glow Effect on Hover */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${typeColors.glow} blur-xl -z-10`}></div>
      </div>
    );
  };

  return (
    <div className="p-8 pb-32 animate-fadeIn">
      {/* Header */}
      <div className="mb-8 animate-slideDown">
        <h1 className="text-4xl font-bold mb-2">السلام عليكم</h1>
        <p className="text-gray-400">استمتع بالاستماع للقرآن الكريم</p>
      </div>

      {/* Recently Played */}
      {stableRecentlyPlayed.length > 0 && (
        <section className="mb-12" key="recently-played-section">
          <h2 className="text-2xl font-bold mb-4 animate-slideUp">المستمع إليها مؤخراً</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stableRecentlyPlayed.map((surah, index) => (
              <SurahCard key={surah.number} surah={surah} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* Popular Surahs */}
      <section>
        <h2 className="text-2xl font-bold mb-4 animate-slideUp delay-100">السور الأكثر استماعاً</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularSurahs.map((surah, index) => (
            <SurahCard key={`popular-${surah.number}`} surah={surah} index={index} />
          ))}
        </div>
      </section>

      {/* Quick Access */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4 animate-slideUp delay-200">سور مميزة</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { surah: surahsData[0], emoji: '🌟', desc: 'فاتحة الكتاب' },
            { surah: surahsData[1], emoji: '📖', desc: 'أطول سورة' },
            { surah: surahsData[35], emoji: '💚', desc: 'قلب القرآن' },
            { surah: surahsData[17], emoji: '⛰️', desc: 'سورة الكهف' },
          ].map((item, index) => {
            const delayClass = index === 0 ? '' : index === 1 ? 'delay-100' : index === 2 ? 'delay-200' : 'delay-300';
            return (
              <div
                key={item.surah.number}
                className={`bg-spotify-lightGray hover:bg-gray-700 rounded-lg p-6 cursor-pointer text-center animate-scaleIn ${delayClass}`}
                onClick={() => playSurah(item.surah)}
                style={{
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div 
                  className="text-5xl mb-3 transition-transform duration-300"
                  style={{ display: 'inline-block' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.25) rotate(10deg)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
                >
                  {item.emoji}
                </div>
                <h3 className="text-lg font-semibold arabic-text mb-1 transition-colors duration-300 hover:text-spotify-green">{item.surah.name}</h3>
                <p className="text-sm text-gray-400 transition-colors duration-300 hover:text-white">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
