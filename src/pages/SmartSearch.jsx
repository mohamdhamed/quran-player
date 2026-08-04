import { useState, useCallback } from 'react';
import { Search, Loader, BookOpen } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import quranService from '../services/QuranService';
import surahsData from '../data/surahs.json';
import { useTranslation } from '../i18n';

/**
 * البحث في القرآن الكريم
 *
 * الصفحة دي كانت مجرد لافتة "قريباً"، وكانت فيه صفحة تانية
 * (SemanticSearch) بتنادي https://api.qurani.ai/semantic/quran - وده
 * endpoint بيرجّع 404، يعني البحث ما كانش شغال في أي مكان في التطبيق.
 *
 * البحث النصي في SearchProvider كان موجود وشغال ومحدش بيستخدمه:
 * بيحمّل المصحف كامل مرة واحدة، وبيشيل التشكيل من الطرفين قبل المقارنة،
 * فالبحث بـ "الرحمن" بيلاقي "ٱلرَّحْمَٰنِ".
 */

const EXAMPLES = ['الرحمن الرحيم', 'الصبر', 'المغفرة', 'الجنة', 'الصلاة', 'التقوى'];

export default function SmartSearch() {
  const { t } = useTranslation();
  const playSurah = usePlayerStore((state) => state.playSurah);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const runSearch = useCallback(async (searchQuery) => {
    const term = searchQuery.trim();
    if (!term) return;

    setIsLoading(true);
    try {
      const found = await quranService.search(term);
      setResults(Array.isArray(found) ? found : []);
    } catch {
      // الخدمة بتبلّغ المستخدم بالخطأ كـ toast، فهنا بنوقف التحميل بس
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleExample = (example) => {
    setQuery(example);
    runSearch(example);
  };

  const playFromResult = (surahNumber) => {
    const surah = surahsData.find((s) => s.number === surahNumber);
    if (surah) playSurah(surah);
  };

  return (
    <div className="p-8 pb-32 animate-fadeIn">
      <div className="mb-8 animate-slideDown">
        <div className="flex items-center gap-3 mb-2">
          <Search className="text-spotify-green" size={32} />
          <h1 className="text-4xl font-bold">{t('البحث في القرآن')}</h1>
        </div>
        <p className="text-gray-400">{t('ابحث عن أي كلمة أو آية - التشكيل غير مهم')}</p>
      </div>

      {/* صندوق البحث */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="relative mb-6 animate-scaleIn">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runSearch(query)}
            placeholder={t('اكتب كلمة أو جزءاً من آية...')}
            className="w-full ps-5 pe-14 py-4 bg-spotify-lightGray rounded-full text-lg border border-gray-700/50 focus:outline-none focus:border-spotify-green transition-colors"
            aria-label={t('البحث في القرآن')}
          />
          <button
            onClick={() => runSearch(query)}
            disabled={!query.trim() || isLoading}
            className="absolute end-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-spotify-green hover:bg-spotify-darkGreen disabled:opacity-40 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-on-accent transition-all"
            aria-label={t('بحث')}
          >
            <Search size={20} />
          </button>
        </div>

        <div>
          <p className="text-sm text-gray-400 mb-3">{t('أمثلة للبحث:')}</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                onClick={() => handleExample(example)}
                className="px-4 py-2 bg-spotify-gray hover:bg-spotify-green/20 rounded-full text-sm transition-all hover:scale-105 border border-spotify-green/30 hover:border-spotify-green font-arabic"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
          <Loader className="animate-spin text-spotify-green mb-4" size={48} />
          <p className="text-gray-400">{t('جاري البحث...')}</p>
        </div>
      )}

      {!isLoading && results !== null && (
        <div className="max-w-4xl mx-auto">
          {results.length === 0 ? (
            <div className="text-center py-20 animate-fadeIn">
              <BookOpen size={56} className="mx-auto mb-4 text-gray-600" />
              <p className="text-xl mb-2">{t('لم يتم العثور على نتائج')}</p>
              <p className="text-content-secondary">{t('جرب البحث بكلمات مختلفة')}</p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-6 animate-slideUp">
                {t('النتائج')} ({results.length})
              </h2>
              <div className="space-y-4">
                {results.map((result) => (
                  <button
                    key={result.fullAyahNumber}
                    onClick={() => playFromResult(result.surahNumber)}
                    className="w-full text-start bg-spotify-lightGray hover:bg-gray-700 rounded-lg p-6 transition-all animate-slideUp"
                  >
                    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-700">
                      <span className="w-10 h-10 bg-spotify-green/20 rounded-full flex items-center justify-center border border-spotify-green/30 text-spotify-green font-bold text-sm flex-shrink-0">
                        {result.ayahNumber}
                      </span>
                      <div>
                        <h3 className="font-semibold arabic-text">{result.surahName}</h3>
                        <p className="text-xs text-content-secondary">{result.surahNameEn}</p>
                      </div>
                    </div>
                    <p className="text-ayah font-arabic text-gray-100">{result.ayahText}</p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
