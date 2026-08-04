import { useCallback, useEffect } from 'react';
import { usePlayerStore } from '../store/playerStore';
import en from './en';

/**
 * ترجمة خفيفة من غير أي مكتبة
 *
 * المكتبات الجاهزة (react-i18next وأخواتها) بتضيف ~40KB على الـ bundle
 * لحاجة إحنا محتاجين منها لغتين وقاموس واحد.
 *
 * العربي هو لغة المصدر، فالنص العربي نفسه هو المفتاح: أي نص مش مترجم
 * بيظهر بالعربي بدل ما يختفي أو يبان كـ key غريب.
 */

const dictionaries = { en };

export const LANGUAGES = {
  ar: { name: 'العربية', nameEn: 'Arabic', dir: 'rtl' },
  en: { name: 'الإنجليزية', nameEn: 'English', dir: 'ltr' }
};

export function getDirection(language) {
  return LANGUAGES[language]?.dir || 'rtl';
}

/**
 * عدد الآيات مصرّفاً صح في اللغتين.
 * العربي فيه مفرد ومثنى وجمع، والإنجليزي مفرد وجمع - فـ "7 verse" غلط
 * و "آيتان" مش "2 آية".
 */
export function formatVerseCount(count, language) {
  if (language === 'en') {
    return `${count} ${count === 1 ? 'verse' : 'verses'}`;
  }
  if (count === 1) return 'آية واحدة';
  if (count === 2) return 'آيتان';
  if (count >= 3 && count <= 10) return `${count} آيات`;
  return `${count} آية`;
}

/**
 * useTranslation
 * @returns {{ t: (text: string) => string, tVerses: (n: number) => string, language: string, dir: string }}
 */
export function useTranslation() {
  const language = usePlayerStore((state) => state.language);

  const t = useCallback(
    (text) => {
      const dictionary = dictionaries[language];
      if (!dictionary) return text; // العربية: النص زي ما هو
      return dictionary[text] ?? text;
    },
    [language]
  );

  const tVerses = useCallback((count) => formatVerseCount(count, language), [language]);

  return { t, tVerses, language, dir: getDirection(language) };
}

/**
 * useLanguage
 * بيطبّق اللغة والاتجاه على <html>.
 *
 * زي الثيم بالظبط: المفتاح في الإعدادات كان بيخزّن الاختيار ومحدش
 * بيقراه، فالواجهة كانت عربي دايماً.
 */
export function useLanguage() {
  const language = usePlayerStore((state) => state.language);
  const dir = getDirection(language);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  return { language, dir };
}

export default useTranslation;
