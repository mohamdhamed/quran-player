/**
 * WaveAnimation Component
 * 
 * مؤشر صوتي متحرك يظهر أثناء تشغيل الصوت
 * Reusable wave animation indicator for playing audio
 */

import { memo } from 'react';

// تحديد الارتفاعات حسب الحجم (outside component for performance)
const HEIGHTS = {
  sm: ['4px', '8px', '6px', '4px'],
  md: ['6px', '12px', '10px', '6px'],
  lg: ['8px', '16px', '12px', '8px']
};

const COLOR_CLASS = {
  white: 'bg-white',
  green: 'bg-spotify-green',
  current: 'bg-current'
};

function WaveAnimation({ 
  size = 'sm',  // 'sm' | 'md' | 'lg'
  color = 'white', // 'white' | 'green' | 'current'
  bars = 4 
}) {
  const barHeights = HEIGHTS[size] || HEIGHTS.sm;
  const bgColor = COLOR_CLASS[color] || COLOR_CLASS.white;
  const widthClass = size === 'lg' ? 'w-1' : 'w-0.5';

  return (
    <div className="flex items-center gap-0.5">
      {barHeights.slice(0, bars).map((height, index) => (
        <div
          key={index}
          className={`${widthClass} ${bgColor} rounded-full animate-wave`}
          style={{
            height,
            animationDelay: `${index * 150}ms`
          }}
        />
      ))}
    </div>
  );
}

export default memo(WaveAnimation);
