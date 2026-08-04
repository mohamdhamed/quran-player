/** @type {import('tailwindcss').Config} */

// الألوان معرّفة كمتغيرات CSS في src/styles/globals.css.
// الدالة دي بتربطها بـ Tailwind بشكل يسمح بالشفافية (bg-accent/20).
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // الأسماء الدلالية - يفضّل استخدامها في أي كود جديد
        surface: {
          DEFAULT: token('surface-base'),
          raised: token('surface-raised'),
          overlay: token('surface-overlay')
        },
        content: {
          DEFAULT: token('content-primary'),
          secondary: token('content-secondary'),
          muted: token('content-muted')
        },
        accent: {
          DEFAULT: token('accent'),
          hover: token('accent-hover')
        },
        meccan: token('meccan'),
        medinan: token('medinan'),

        // الأسماء القديمة - متروكة عشان 291 استخدام في المكوّنات،
        // وبتشاور على نفس المتغيرات فمفيش مصدرين للحقيقة
        spotify: {
          black: token('surface-base'),
          gray: token('surface-raised'),
          lightGray: token('surface-overlay'),
          green: token('accent'),
          darkGreen: token('accent-hover')
        }
      },
      fontFamily: {
        arabic: ['Amiri', 'serif'],
        sans: ['Cairo', 'system-ui', 'sans-serif']
      },
      fontSize: {
        // مقاسات نص المصحف - أكبر وبتباعد أوسع من نص الواجهة
        ayah: ['1.5rem', { lineHeight: '2.75rem' }],
        'ayah-lg': ['1.875rem', { lineHeight: '3.25rem' }]
      },
      boxShadow: {
        // التوهج الأخضر المتكرر في الواجهة
        glow: '0 0 20px rgb(var(--accent) / 0.25)',
        'glow-lg': '0 0 40px rgb(var(--accent) / 0.35)'
      }
    }
  },
  plugins: []
};
