import { useMemo, memo, useCallback } from 'react';
import { Play } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import WaveAnimation from '../components/UI/WaveAnimation';
import surahsData from '../data/surahs.json';
import { useTranslation } from '../i18n';

// مكون الكارد خارج المكون الرئيسي ومحفوظ بـ memo
const SurahCard = memo(function SurahCard({ surah, isCurrentSurah, onPlay }) {
  const { t, tVerses } = useTranslation();
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

  const handleClick = useCallback(() => {
    onPlay(surah);
  }, [onPlay, surah]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPlay(surah);
    }
  }, [onPlay, surah]);

  return (
    <button
      className={`surah-card group relative overflow-hidden ${typeColors.bg} ${typeColors.bgHover} border ${typeColors.border} w-full text-right`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={{
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      aria-label={`${t('تشغيل السورة')} ${surah.name} - ${surah.nameEn} - ${tVerses(surah.verses)} - ${t(surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية')}`}
      role="button"
      tabIndex={0}
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
          {isCurrentSurah && (
            <div className="absolute -bottom-1 -left-1 bg-spotify-green rounded-full px-1.5 py-1 shadow-lg">
              <WaveAnimation size="sm" color="white" />
            </div>
          )}
        </div>

        {/* معلومات السورة */}
        <div className="flex-1 text-right">
          <h3 className={`text-lg font-semibold arabic-text mb-1 transition-colors duration-300 group-hover:${typeColors.text}`}>
            سورة {surah.name}
          </h3>
          <p className="text-xs text-content-secondary mt-1 transition-colors duration-300 group-hover:text-gray-300">
            {tVerses(surah.verses)} • {t(isMeccan ? 'مكية' : 'مدنية')}
          </p>
        </div>

        {/* Play Button */}
        <div className="play-button-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-12">
          <Play size={20} fill="white" />
        </div>
      </div>

      {/* Progress Bar عند التشغيل */}
      {isCurrentSurah && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-l from-spotify-green to-green-400 shadow-lg shadow-spotify-green/50" aria-hidden="true"></div>
      )}

      {/* Glow Effect on Hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${typeColors.glow} blur-xl -z-10`} aria-hidden="true"></div>
    </button>
  );
});

export default function Home() {
  const { t, tVerses } = useTranslation();
  // استخدام selectors لتجنب re-render عند تغيير أي state آخر
  const playSurah = usePlayerStore((state) => state.playSurah);
  // نراقب فقط رقم السورة الحالية وليس الـ object كله
  const currentSurahNumber = usePlayerStore((state) => state.currentSurah?.number);
  const recentlyPlayed = usePlayerStore((state) => state.recentlyPlayed);

  // الـ store بيبني مصفوفة جديدة بس لما القائمة تتغيّر فعلاً، فالمرجع
  // نفسه كافي كـ dependency - مش محتاجين JSON.stringify كل رندر
  const stableRecentlyPlayed = useMemo(() => {
    return recentlyPlayed.slice(0, 6);
  }, [recentlyPlayed]);

  const popularSurahs = useMemo(() => [
    surahsData[0],   // الفاتحة
    surahsData[35],  // يس
    surahsData[17],  // الكهف
    surahsData[54],  // الرحمن
    surahsData[67],  // الملك
    surahsData[77],  // النبأ
  ], []);

  return (
    <div className="p-8 pb-32 animate-fadeIn">
      {/* Header */}
      <div className="mb-8 animate-slideDown">
        <h1 className="text-4xl font-bold mb-2">{t('السلام عليكم')}</h1>
        <p className="text-gray-400">{t('استمتع بالاستماع للقرآن الكريم')}</p>
      </div>

      {/* Recently Played */}
      {stableRecentlyPlayed.length > 0 && (
        <section className="mb-12" key="recently-played-section">
          <h2 className="text-2xl font-bold mb-4 animate-slideUp">{t('المستمع إليها مؤخراً')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stableRecentlyPlayed.map((surah) => (
              <SurahCard 
                key={surah.number} 
                surah={surah} 
                isCurrentSurah={currentSurahNumber === surah.number}
                onPlay={playSurah}
              />
            ))}
          </div>
        </section>
      )}

      {/* Popular Surahs */}
      <section>
        <h2 className="text-2xl font-bold mb-4 animate-slideUp delay-100">{t('السور الأكثر استماعاً')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularSurahs.map((surah) => (
            <SurahCard 
              key={`popular-${surah.number}`} 
              surah={surah}
              isCurrentSurah={currentSurahNumber === surah.number}
              onPlay={playSurah}
            />
          ))}
        </div>
      </section>

      {/* Quick Access */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4 animate-slideUp delay-200">{t('سور مميزة')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { surah: surahsData[0], emoji: '🌟', desc: 'فاتحة الكتاب' },
            { surah: surahsData[1], emoji: '📖', desc: 'أطول سورة' },
            { surah: surahsData[35], emoji: '💚', desc: 'قلب القرآن' },
            { surah: surahsData[17], emoji: '⛰️', desc: 'سورة الكهف' },
          ].map((item, index) => {
            const delayClass = index === 0 ? '' : index === 1 ? 'delay-100' : index === 2 ? 'delay-200' : 'delay-300';
            return (
              <button
                key={item.surah.number}
                className={`quick-card animate-scaleIn ${delayClass}`}
                onClick={() => playSurah(item.surah)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    playSurah(item.surah);
                  }
                }}
                aria-label={`${t(item.desc)} - ${item.surah.name}`}
              >
                <div className="quick-card__icon" aria-hidden="true">
                  {item.emoji}
                </div>
                <h3 className="text-lg font-semibold arabic-text mb-1 transition-colors duration-300 hover:text-spotify-green">{item.surah.name}</h3>
                <p className="text-sm text-gray-400 transition-colors duration-300 hover:text-white">{t(item.desc)}</p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
