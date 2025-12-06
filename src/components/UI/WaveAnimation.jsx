/**
 * WaveAnimation Component
 * 
 * مؤشر صوتي متحرك يظهر أثناء تشغيل الصوت
 * Reusable wave animation indicator for playing audio
 */

export default function WaveAnimation({ 
  size = 'sm',  // 'sm' | 'md' | 'lg'
  color = 'white', // 'white' | 'green' | 'current'
  bars = 4 
}) {
  // تحديد الارتفاعات حسب الحجم
  const heights = {
    sm: ['4px', '8px', '6px', '4px'],
    md: ['6px', '12px', '10px', '6px'],
    lg: ['8px', '16px', '12px', '8px']
  };

  // تحديد اللون
  const colorClass = {
    white: 'bg-white',
    green: 'bg-spotify-green',
    current: 'bg-current'
  };

  // تحديد العرض حسب الحجم
  const widthClass = size === 'lg' ? 'w-1' : 'w-0.5';

  const barHeights = heights[size] || heights.sm;
  const bgColor = colorClass[color] || colorClass.white;

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
