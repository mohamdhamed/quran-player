import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from '../../i18n';

/**
 * صفحة المصحف مع تظليل الآية الجارية
 *
 * الـ API بيرجّع مع كل توقيت آية بيانات إحنا كنا بنخزّنها ومش بنعرضها:
 *   page    → صفحة المصحف كـ SVG
 *   polygon → حدود الآية على الصفحة، بنفس صيغة points بتاعة SVG
 *
 * فبنرسم الصفحة، ونحط فوقها مضلّع لكل آية: اللي بتتقري متظللة،
 * والباقي شفافة بس قابلة للضغط عشان تنقل التلاوة لمكانها.
 */

// الصفحات مش كلها بنفس المقاس: 001/002 بـ 235×235 والباقي 345×550،
// فبنقرا الـ viewBox من الملف نفسه بدل ما نفترضه
const viewBoxCache = new Map();

async function loadViewBox(pageUrl) {
  if (viewBoxCache.has(pageUrl)) {
    return viewBoxCache.get(pageUrl);
  }

  try {
    const response = await fetch(pageUrl);
    const text = await response.text();
    const match = text.match(/viewBox="([^"]+)"/);
    const viewBox = match ? match[1] : null;

    if (viewBox) {
      viewBoxCache.set(pageUrl, viewBox);
    }
    return viewBox;
  } catch {
    return null;
  }
}

export default function MushafPage({ pageUrl, timings = [], currentAyah, onSeek }) {
  const { t } = useTranslation();
  const [viewBox, setViewBox] = useState(() => viewBoxCache.get(pageUrl) || null);

  useEffect(() => {
    if (!pageUrl) return;

    let cancelled = false;
    loadViewBox(pageUrl).then((box) => {
      if (!cancelled && box) setViewBox(box);
    });

    return () => {
      cancelled = true;
    };
  }, [pageUrl]);

  if (!pageUrl || !viewBox) {
    return (
      <div className="flex items-center justify-center py-20">
        <div
          className="w-10 h-10 border-4 border-gray-700 border-t-spotify-green rounded-full animate-spin"
          role="status"
          aria-label={t('جاري تحميل صفحة المصحف')}
        ></div>
      </div>
    );
  }

  const [, , width, height] = viewBox.split(/\s+/).map(Number);

  // آيات الصفحة المعروضة بس
  const pageTimings = timings.filter((item) => item.page === pageUrl && item.polygon);

  const handleActivate = (timing) => {
    if (onSeek) onSeek(timing.startTime, timing.ayah);
  };

  return (
    <div className="mushaf-page">
      <svg viewBox={viewBox} className="w-full h-auto" role="group" aria-label={t('صفحة المصحف')}>
        {/* الصفحة كصورة: بترسم من غير ما الـ SVG الخارجي يتحقن في الصفحة،
            فمفيش أي سكربت جواه يقدر يشتغل */}
        <image href={pageUrl} x="0" y="0" width={width} height={height} />

        {pageTimings.map((timing) => {
          const isActive = timing.ayah === currentAyah;

          return (
            <polygon
              key={timing.ayah}
              points={timing.polygon}
              className={isActive ? 'mushaf-highlight' : 'mushaf-ayah'}
              role="button"
              tabIndex={0}
              aria-label={`الآية ${timing.ayah}${isActive ? ' - تُتلى الآن' : ''}`}
              aria-current={isActive ? 'true' : undefined}
              onClick={() => handleActivate(timing)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleActivate(timing);
                }
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}

MushafPage.propTypes = {
  pageUrl: PropTypes.string,
  timings: PropTypes.arrayOf(
    PropTypes.shape({
      ayah: PropTypes.number,
      polygon: PropTypes.string,
      page: PropTypes.string,
      startTime: PropTypes.number
    })
  ),
  currentAyah: PropTypes.number,
  onSeek: PropTypes.func
};
