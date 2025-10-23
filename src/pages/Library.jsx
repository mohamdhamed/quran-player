import { useState, useMemo, memo } from 'react';
import { Play, Search, Heart, BookOpen, ListPlus } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import surahsData from '../data/surahs.json';
import AddToPlaylistMenu from '../components/Playlist/AddToPlaylistMenu';

const Library = memo(function Library() {
  // استخدام selectors لتجنب re-render غير ضروري
  const playSurah = usePlayerStore((state) => state.playSurah);
  const currentSurah = usePlayerStore((state) => state.currentSurah);
  const favorites = usePlayerStore((state) => state.favorites);
  const toggleFavorite = usePlayerStore((state) => state.toggleFavorite);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(null); // Track which surah's menu is open

  // أشهر 10 سور (حسب الشعبية)
  const popularSurahs = useMemo(() => [
    surahsData[0],   // الفاتحة
    surahsData[1],   // البقرة
    surahsData[17],  // الكهف
    surahsData[35],  // يس
    surahsData[54],  // الرحمن
    surahsData[66],  // الملك
    surahsData[77],  // النبأ
    surahsData[111], // الإخلاص
    surahsData[112], // الفلق
    surahsData[113], // الناس
  ], []);

  const filteredSurahs = useMemo(() => {
    if (!searchQuery.trim()) return surahsData;
    
    const query = searchQuery.toLowerCase();
    return surahsData.filter(
      (surah) =>
        surah.name.includes(searchQuery) ||
        surah.nameEn.toLowerCase().includes(query) ||
        surah.nameTranslation?.toLowerCase().includes(query) ||
        surah.number.toString() === searchQuery
    );
  }, [searchQuery]);

  return (
    <div className="p-8 pb-32 animate-fadeIn">
      {/* Header */}
      <div className="mb-8 animate-slideDown">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-spotify-green bg-clip-text text-transparent">
          المكتبة
        </h1>
        
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 transition-all" size={20} />
          <input
            type="text"
            placeholder="ابحث عن سورة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input pr-12 transition-smooth focus:scale-[1.02]"
          />
        </div>
      </div>

      {/* لو في بحث، نعرض النتائج بس */}
      {searchQuery.trim() ? (
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Search size={24} className="text-spotify-green" />
            نتائج البحث ({filteredSurahs.length})
          </h2>
          <SurahsList 
            surahs={filteredSurahs} 
            currentSurah={currentSurah} 
            playSurah={playSurah} 
            favorites={favorites} 
            toggleFavorite={toggleFavorite}
            showPlaylistMenu={showPlaylistMenu}
            setShowPlaylistMenu={setShowPlaylistMenu}
          />
        </div>
      ) : (
        <>
          {/* Popular Surahs Grid */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Heart size={24} className="text-spotify-green" />
              الأكثر استماعاً
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {popularSurahs.map((surah, index) => (
                <SurahCard 
                  key={surah.number} 
                  surah={surah} 
                  isPlaying={currentSurah?.number === surah.number}
                  playSurah={playSurah}
                  isFavorite={favorites.some(fav => fav.number === surah.number)}
                  toggleFavorite={toggleFavorite}
                  delay={index * 50}
                />
              ))}
            </div>
          </div>

          {/* All Surahs List */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <BookOpen size={24} className="text-spotify-green" />
              جميع السور
            </h2>
            <SurahsList 
              surahs={surahsData} 
              currentSurah={currentSurah} 
              playSurah={playSurah} 
              favorites={favorites} 
              toggleFavorite={toggleFavorite}
              showPlaylistMenu={showPlaylistMenu}
              setShowPlaylistMenu={setShowPlaylistMenu}
            />
          </div>
        </>
      )}

      {filteredSurahs.length === 0 && (
        <div className="text-center py-20 text-gray-400 animate-fadeIn">
          <Search size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-xl">لم يتم العثور على نتائج</p>
          <p className="text-sm mt-2">جرب البحث بكلمات مختلفة</p>
        </div>
      )}
    </div>
  );
});

// Surah Card Component (Grid)
function SurahCard({ surah, isPlaying, playSurah, isFavorite, toggleFavorite, delay = 0 }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20; // -10 to 10
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -20; // -10 to 10
    setMousePosition({ x, y });
  };

  return (
    <div 
      className="group cursor-pointer animate-slideUp relative"
      style={{ 
        animationDelay: `${delay}ms`,
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      onClick={() => playSurah(surah)}
    >
      <div
        className="bg-gradient-to-br from-spotify-lightGray to-gray-800/50 rounded-2xl p-6 hover:from-gray-700/70 hover:to-gray-800/70 transition-all duration-300 relative overflow-hidden h-72 border border-gray-700/30 hover:border-spotify-green/50"
        style={{
          transform: isHovered 
            ? `rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg) scale(1.05)` 
            : 'rotateX(0deg) rotateY(0deg) scale(1)',
          transition: 'transform 0.15s ease-out, border-color 0.3s ease',
          transformStyle: 'preserve-3d',
          boxShadow: isHovered 
            ? '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(29, 185, 84, 0.2)' 
            : '0 8px 24px rgba(0, 0, 0, 0.4)'
        }}
      >
      {/* Background Pattern - Enhanced */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(29, 185, 84, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(29, 185, 84, 0.3) 0%, transparent 50%),
            linear-gradient(135deg, rgba(29, 185, 84, 0.05) 0%, transparent 50%)
          `
        }} />
      </div>

      {/* Decorative Corner */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-spotify-green to-transparent rounded-bl-full"></div>
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col">
        {/* Header: Number + Favorite Button */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-spotify-green/10 border-2 border-spotify-green/30 flex items-center justify-center backdrop-blur-sm group-hover:bg-spotify-green/20 group-hover:border-spotify-green/50 transition-all">
              <span className="text-sm font-bold text-spotify-green">{surah.number}</span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(surah);
            }}
            className="p-2 hover:bg-red-500/20 rounded-full transition-all z-10 backdrop-blur-sm"
          >
            <Heart 
              size={20} 
              className={`transition-all ${isFavorite ? 'fill-red-500 text-red-500 animate-pulse' : 'text-gray-400 hover:text-red-500'}`}
            />
          </button>
        </div>

        {/* Surah Name - كبير ومركزي */}
        <div className="flex-1 flex flex-col justify-center items-center text-center transition-all duration-500 ease-out group-hover:-translate-y-4">
          <h3 className="text-3xl font-bold arabic-text mb-2 group-hover:text-spotify-green transition-all duration-300 group-hover:scale-110" dir="rtl" style={{ lineHeight: '1.4' }}>
            {surah.name}
          </h3>
          <p className="text-base text-gray-400 mb-1 transition-all duration-400 group-hover:opacity-70">{surah.nameEn}</p>
          <p className="text-xs text-gray-500 mb-4 transition-all duration-400 group-hover:opacity-50">{surah.nameTranslation}</p>
          
          {/* Play Button - تحت الاسم */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              playSurah(surah);
            }}
            className="w-16 h-16 rounded-full bg-spotify-green hover:bg-spotify-darkGreen hover:scale-110 transition-all duration-300 shadow-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-4 scale-75 group-hover:translate-y-0 group-hover:scale-100"
            style={{
              boxShadow: '0 8px 32px rgba(29, 185, 84, 0.6), 0 0 60px rgba(29, 185, 84, 0.3)',
              transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            <Play size={24} fill="white" className="ml-1" />
          </button>
        </div>
        
        {/* Info - أسفل الكارت - مثبتة في الأسفل */}
        <div className="mt-auto flex items-center justify-between text-sm backdrop-blur-sm bg-black/20 rounded-lg p-0 -mx-3 mb-10">
          <span className={`px-3 py-1.5 rounded-full font-semibold text-xs transition-all ${
            surah.revelationType === 'Meccan' 
              ? 'bg-gradient-to-r from-blue-500/30 to-blue-600/20 text-blue-300 border border-blue-400/40 shadow-lg shadow-blue-500/20' 
              : 'bg-gradient-to-r from-green-500/30 to-green-600/20 text-green-300 border border-green-400/40 shadow-lg shadow-green-500/20'
          }`}>
            {surah.revelationType === 'Meccan' ? '🕋 مكية' : '🕌 مدنية'}
          </span>
          <span className="text-gray-300 font-bold flex items-center gap-1.5">
            <span className="text-spotify-green text-base">📖</span>
            <span className="text-sm">
              {surah.verses} {surah.verses === 1 ? 'آية' : surah.verses === 2 ? 'آيتان' : surah.verses <= 10 ? 'آيات' : 'آية'}
            </span>
          </span>
        </div>



        {/* Playing Indicator */}
        {isPlaying && (
          <div className="absolute top-4 left-4">
            <div className="flex gap-1 items-end">
              <div className="w-1 h-3 bg-spotify-green rounded-full animate-pulse"></div>
              <div className="w-1 h-5 bg-spotify-green rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-4 bg-spotify-green rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              <div className="w-1 h-6 bg-spotify-green rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

// Surahs List Component (Table)
function SurahsList({ surahs, currentSurah, playSurah, favorites, toggleFavorite, showPlaylistMenu, setShowPlaylistMenu }) {
  return (
    <div className="bg-gradient-to-br from-spotify-lightGray to-gray-800/30 rounded-2xl overflow-hidden animate-slideUp shadow-2xl border border-gray-700/30" dir="rtl">
      {/* Scrollable Container */}
      <div className="overflow-y-auto max-h-[600px] custom-scrollbar">
        <table className="w-full" dir="rtl">
          {/* Fixed Header */}
          <thead className="sticky top-0 z-10 border-b-2 border-spotify-green/20 bg-gradient-to-r from-gray-800/95 to-gray-900/90 backdrop-blur-md">
            <tr className="text-gray-300 text-sm font-bold">
              <th className="p-4" style={{ width: '70px' }}>
                <span className="text-spotify-green">#</span>
              </th>
              <th className="p-4">
                <span className="flex items-center gap-2">
                  <span className="text-spotify-green">📖</span>
                  <span>اسم السورة</span>
                </span>
              </th>
              <th className="p-4 hidden md:table-cell" style={{ width: '200px' }} dir="ltr">
                <span className="block text-left">Name</span>
              </th>
              <th className="p-4" style={{ width: '120px' }}>الآيات</th>
              <th className="p-4" style={{ width: '140px' }}>النوع</th>
              <th className="p-4" style={{ width: '140px' }}></th>
            </tr>
          </thead>
          <tbody>
          {surahs.map((surah) => {
            const isFavorite = favorites.some(fav => fav.number === surah.number);
            const isPlaying = currentSurah?.number === surah.number;
            
            return (
              <tr
                key={surah.number}
                className={`group border-b border-gray-800/50 hover:bg-gradient-to-r hover:from-gray-700/60 hover:to-gray-800/40 transition-all duration-300 cursor-pointer ${
                  isPlaying ? 'bg-gradient-to-r from-gray-700/70 to-gray-800/50 border-spotify-green/30' : ''
                }`}
                onClick={() => playSurah(surah)}
              >
                <td className="p-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    isPlaying 
                      ? 'bg-spotify-green/20 border-2 border-spotify-green/50' 
                      : 'bg-gray-700/30 border border-gray-600/30 group-hover:bg-spotify-green/10 group-hover:border-spotify-green/30'
                  }`}>
                    <span className={`font-bold text-sm transition-colors ${
                      isPlaying ? 'text-spotify-green' : 'text-gray-400 group-hover:text-spotify-green'
                    }`}>
                      {surah.number}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {isPlaying && (
                      <div className="flex gap-1 items-end h-8">
                        <div className="w-1 bg-spotify-green rounded-full sound-wave" style={{ animationDelay: '0s' }}></div>
                        <div className="w-1 bg-spotify-green rounded-full sound-wave" style={{ animationDelay: '0.15s' }}></div>
                        <div className="w-1 bg-spotify-green rounded-full sound-wave" style={{ animationDelay: '0.3s' }}></div>
                        <div className="w-1 bg-spotify-green rounded-full sound-wave" style={{ animationDelay: '0.45s' }}></div>
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-xl arabic-text font-bold transition-colors group-hover:text-spotify-green">
                        {surah.name}
                      </span>
                      <span className="text-xs text-gray-400 md:hidden group-hover:text-gray-300">{surah.nameEn}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-gray-400 transition-colors group-hover:text-white hidden md:table-cell text-base" dir="ltr">
                  <span className="block text-left">{surah.nameEn}</span>
                </td>
                <td className="p-4 transition-colors group-hover:text-white font-bold">
                  <span className={isPlaying ? 'text-spotify-green' : 'text-gray-300'}>
                    {surah.verses} {surah.verses === 1 ? 'آية' : surah.verses === 2 ? 'آيتان' : surah.verses <= 10 ? 'آيات' : 'آية'}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-4 py-1.5 rounded-full text-xs transition-all font-bold border ${
                    surah.revelationType === 'Meccan' 
                      ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/10 text-blue-300 border-blue-400/40 group-hover:from-blue-500/30 group-hover:to-blue-600/20 group-hover:border-blue-400/60 shadow-lg shadow-blue-500/10'
                      : 'bg-gradient-to-r from-green-500/20 to-green-600/10 text-green-300 border-green-400/40 group-hover:from-green-500/30 group-hover:to-green-600/20 group-hover:border-green-400/60 shadow-lg shadow-green-500/10'
                  }`}>
                    {surah.revelationType === 'Meccan' ? '🕋 مكية' : '🕌 مدنية'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 relative">
                    <button className="w-10 h-10 rounded-full bg-spotify-green hover:bg-spotify-darkGreen hover:scale-110 transition-all duration-300 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0">
                      <Play size={18} fill="white" className="mr-0.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(surah);
                      }}
                      className="p-2.5 hover:bg-red-500/20 rounded-lg transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm border border-transparent hover:border-red-500/30"
                    >
                      <Heart 
                        size={18} 
                        className={`transition-all ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPlaylistMenu(showPlaylistMenu === surah.number ? null : surah.number);
                      }}
                      className="p-2.5 hover:bg-spotify-green/20 rounded-lg transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm border border-transparent hover:border-spotify-green/30"
                    >
                      <ListPlus 
                        size={18} 
                        className="text-gray-400 hover:text-spotify-green transition-colors"
                      />
                    </button>
                    {showPlaylistMenu === surah.number && (
                      <AddToPlaylistMenu 
                        surah={surah} 
                        onClose={() => setShowPlaylistMenu(null)} 
                      />
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Library;
