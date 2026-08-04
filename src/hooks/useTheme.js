import { useEffect } from 'react';
import { usePlayerStore } from '../store/playerStore';

/**
 * useTheme
 *
 * بيطبّق الثيم المختار على عنصر <html>.
 *
 * قبل كده كان مفتاح الثيم في الإعدادات بيخزّن القيمة ويبيّن المختار
 * بس، ومفيش أي حاجة بتقرأها - فالتطبيق كان داكن دايماً مهما اخترت.
 *
 * الألوان كلها متغيرات CSS، والثيم الفاتح بيعيد تعريفها تحت
 * [data-theme="light"]، فالسطر ده كفاية يقلب الواجهة كلها.
 */
export function useTheme() {
  const theme = usePlayerStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme === 'light' ? 'light' : 'dark';
  }, [theme]);

  return theme;
}

export default useTheme;
