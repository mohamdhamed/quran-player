import { useState } from 'react';
import { Search, Sparkles, Loader } from 'lucide-react';
import { semanticSearchQuran } from '../services/quranaiAPI';
import { usePlayerStore } from '../store/playerStore';

export default function SemanticSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // استخدام selector لتجنب re-render غير ضروري
  const playSurah = usePlayerStore((state) => state.playSurah);

  const exampleQueries = [
    'الصبر والشكر',
    'الرحمة والمغفرة',
    'الجنة والنار',
    'التوحيد',
    'الصلاة',
    'الزكاة',
    'الصيام',
    'الحج'
  ];

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const searchResults = await semanticSearchQuran(searchQuery, 20);
      setResults(searchResults);
      
      if (searchResults.length === 0) {
        setError('لم يتم العثور على نتائج');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (example) => {
    setQuery(example);
    handleSearch(example);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="p-8 pb-32 animate-fadeIn">
      {/* Header */}
      <div className="mb-8 animate-slideDown">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="text-spotify-green" size={32} />
          <h1 className="text-4xl font-bold">البحث الذكي</h1>
        </div>
        <p className="text-gray-400">ابحث في القرآن الكريم بالمعنى وليس بالكلمات</p>
      </div>

      {/* Search Box */}
      <div className="max-w-3xl mx-auto mb-12">
        <div className="relative mb-6 animate-scaleIn">
          <div className="relative">
            <Search 
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" 
              size={24} 
            />
            <input
              type="text"
              placeholder="مثال: ابحث عن الآيات التي تتحدث عن الصبر والشكر..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full bg-spotify-lightGray text-white px-16 py-4 rounded-full focus:outline-none focus:ring-2 focus:ring-spotify-green placeholder-gray-500 text-lg transition-all focus:scale-[1.02]"
              dir="rtl"
            />
            <button
              onClick={() => handleSearch()}
              disabled={isLoading || !query.trim()}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-spotify-green hover:bg-spotify-darkGreen disabled:bg-gray-600 text-white px-6 py-2 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                'بحث'
              )}
            </button>
          </div>
        </div>

        {/* Example Queries */}
        <div className="mb-8">
          <p className="text-sm text-gray-400 mb-3">أمثلة للبحث:</p>
          <div className="flex flex-wrap gap-2">
            {exampleQueries.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="px-4 py-2 bg-spotify-gray hover:bg-spotify-green/20 rounded-full text-sm transition-all duration-300 hover:scale-105 border border-spotify-green/30 hover:border-spotify-green"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-r from-spotify-green/10 to-blue-900/10 rounded-lg p-4 border border-spotify-green/20">
          <div className="flex items-start gap-3">
            <Sparkles className="text-spotify-green flex-shrink-0 mt-1" size={20} />
            <div>
              <h3 className="font-semibold mb-1 text-spotify-green">ما هو البحث الذكي؟</h3>
              <p className="text-sm text-gray-300">
                البحث الذكي يستخدم الذكاء الاصطناعي للبحث بالمعنى وليس بالكلمات الدقيقة. 
                يمكنك البحث عن مواضيع أو مفاهيم وسيجد لك الآيات المتعلقة بها حتى لو لم تحتوي على نفس الكلمات.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-3xl mx-auto mb-6 animate-slideUp">
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-200">
            {error}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
          <Loader className="animate-spin text-spotify-green mb-4" size={48} />
          <p className="text-gray-400">جاري البحث...</p>
        </div>
      )}

      {/* Search Results */}
      {!isLoading && results.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between animate-slideUp">
            <h2 className="text-2xl font-bold">
              النتائج ({results.length})
            </h2>
          </div>

          <div className="space-y-4">
            {results.map((result, index) => {
              const delayClass = index % 3 === 0 ? '' : index % 3 === 1 ? 'delay-100' : 'delay-200';
              
              return (
                <div
                  key={`${result.surah}-${result.ayah}-${index}`}
                  className={`bg-spotify-lightGray rounded-lg p-6 transition-all hover:shadow-xl hover-lift animate-slideUp ${delayClass}`}
                  style={{
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {/* Ayah Header */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-spotify-green/20 rounded-full flex items-center justify-center border border-spotify-green/30">
                        <span className="text-spotify-green font-bold text-sm">
                          {result.ayah || result.ayahNumber}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {result.surahNameAr || `سورة ${result.surah}`}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {result.surahNameEn || `Surah ${result.surah}`} • آية {result.ayah || result.ayahNumber}
                        </p>
                      </div>
                    </div>
                    
                    {result.score && (
                      <div className="text-xs text-gray-400">
                        دقة: {Math.round(result.score * 100)}%
                      </div>
                    )}
                  </div>

                  {/* Ayah Text */}
                  <div className="mb-4">
                    <p className="quran-verse text-right leading-loose mb-3">
                      {result.text || result.ayahText}
                    </p>
                    
                    {result.translation && (
                      <p className="text-gray-400 text-sm leading-relaxed border-r-2 border-spotify-green/30 pr-4">
                        {result.translation}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3">
                    <button
                      onClick={() => {
                        const surahNumber = result.surah || result.surahNumber;
                        const surahData = { number: surahNumber };
                        playSurah(surahData);
                      }}
                      className="px-4 py-2 bg-spotify-green hover:bg-spotify-darkGreen rounded-full text-sm transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      تشغيل السورة
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Results State */}
      {!isLoading && !error && results.length === 0 && query && (
        <div className="text-center py-20 animate-fadeIn">
          <Search size={64} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">ابدأ البحث للعثور على الآيات</p>
        </div>
      )}
    </div>
  );
}
