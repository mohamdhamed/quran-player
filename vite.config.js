import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // فصل المكتبات عن كود التطبيق: لما تعدّل في الكود، المستخدم
        // بينزّل جزء التطبيق بس والمكتبات تفضل في الكاش بتاعه
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo.svg'],
      manifest: {
        name: 'مشغل القرآن الكريم',
        short_name: 'القرآن',
        description: 'مشغل قرآن حديث مستوحى من Spotify',
        theme_color: '#1DB954',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait',
        dir: 'rtl',
        lang: 'ar',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
      // ملحوظة: كان فيه هنا runtimeCaching بـ CacheFirst على ملفات
      // mp3quran، واتشال عن قصد.
      //
      // السورة الواحدة بين 5 و 50 ميجا، والإعداد كان بيخزّن لحد 50
      // منهم - يعني جيجات في مساحة المتصفح. وأهم من كده إن عنصر
      // الصوت بيطلب الملف بـ Range requests، و CacheFirst من غير
      // معالجة للـ Range بيرجّع رد كامل على طلب جزئي، والمتصفح
      // بيرفضه فالتلاوة ماتشتغلش أصلاً. و CacheFirst معناها إن أي
      // رد باظ بيتخزّن ويتقدّم تاني وتالت من غير ما يتراجع - وده
      // بيخلي الجهاز اللي وقع فيه يفضل واقع.
      //
      // التحميل للاستماع بدون نت هيتعمل صح في مرحلة 1: تحميل
      // بطلب من المستخدم، مش تخزين تلقائي لكل حاجة بيسمعها.
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
    // تطبيق الـ React Native في QuranPlayerNative/ له تستاته الخاصة
    // اللي بتشتغل بـ Jest. من غير الحصر ده، vitest بياخدها وبتفشل.
    include: ['src/**/*.{test,spec}.{js,jsx}']
  }
});
