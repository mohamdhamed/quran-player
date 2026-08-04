import { useEffect, useRef } from 'react';

/** العناصر اللي ممكن تاخد فوكس جوه المودال */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * useModal
 *
 * بيدّي لأي مودال السلوك المتوقع منه في المتصفح:
 *   - Escape بيقفله
 *   - الفوكس بيدخل جواه أول ما يفتح
 *   - Tab بيلف جوه المودال وما يهربش للصفحة اللي وراه (focus trap)
 *   - الفوكس بيرجع للعنصر اللي فتح المودال بعد ما يتقفل
 *
 * من غير ده، مستخدم الكيبورد بيفضل يـ Tab في عناصر مخفية وراه ومش
 * لاقي طريقة يقفل بيها غير الماوس.
 *
 * @param {boolean} isOpen
 * @param {Function} onClose
 * @returns {React.RefObject} ref يتحط على حاوية المودال
 */
export function useModal(isOpen, onClose) {
  const containerRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement;

    const container = containerRef.current;
    if (container) {
      // ندي الفوكس لأول عنصر جواه، وإلا للحاوية نفسها
      const first = container.querySelector(FOCUSABLE);
      (first || container).focus();
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !containerRef.current) return;

      // ملاحظة: مفيش فلترة بـ offsetParent هنا عن قصد - بيرجع null لأي
      // عنصر جوه حاوية position:fixed (وده حال المودالات دي)، فكان
      // بيفضّي القايمة ويعطّل الـ trap تماماً. الـ selector فوق أصلاً
      // بيستبعد العناصر المعطّلة و tabindex="-1".
      const items = Array.from(containerRef.current.querySelectorAll(FOCUSABLE));
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];

      // لفّ الفوكس عند الطرفين بدل ما يخرج بره المودال
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      // رجّع الفوكس لمكانه لو العنصر لسه موجود في الصفحة
      const previous = previouslyFocused.current;
      if (previous && document.contains(previous)) {
        previous.focus();
      }
    };
  }, [isOpen, onClose]);

  return containerRef;
}

export default useModal;
