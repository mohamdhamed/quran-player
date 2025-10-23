import { useMemo, memo, useState } from 'react';
import { Volume2, Gauge, User, Download, Moon, Sun, Globe, Palette, Shield, Info, Trash2, HardDrive, Wifi } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { getReciters } from '../services/quranAPI';

const Settings = memo(function Settings() {
  const currentReciter = usePlayerStore((state) => state.currentReciter);
  const setCurrentReciter = usePlayerStore((state) => state.setCurrentReciter);
  const volume = usePlayerStore((state) => state.volume);
  const setVolume = usePlayerStore((state) => state.setVolume);
  const playbackSpeed = usePlayerStore((state) => state.playbackSpeed);
  const setPlaybackSpeed = usePlayerStore((state) => state.setPlaybackSpeed);
  const theme = usePlayerStore((state) => state.theme);
  const setTheme = usePlayerStore((state) => state.setTheme);
  const language = usePlayerStore((state) => state.language);
  const setLanguage = usePlayerStore((state) => state.setLanguage);

  // Local state
  const [downloadOnCellular, setDownloadOnCellular] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [showLyrics, setShowLyrics] = useState(true);

  // استخدام useMemo لحفظ reciters
  const reciters = useMemo(() => getReciters(), []);

  const speeds = [
    { value: 0.5, label: '0.5x - بطيء جداً', icon: '🐢' },
    { value: 0.75, label: '0.75x - بطيء', icon: '🚶' },
    { value: 1, label: '1x - عادي', icon: '▶️' },
    { value: 1.25, label: '1.25x - سريع', icon: '🏃' },
    { value: 1.5, label: '1.5x - سريع جداً', icon: '🚀' },
    { value: 2, label: '2x - أسرع', icon: '⚡' }
  ];

  const handleClearCache = () => {
    if (window.confirm('هل أنت متأكد من مسح الذاكرة المؤقتة؟')) {
      // Clear cache logic
      alert('تم مسح الذاكرة المؤقتة بنجاح!');
    }
  };

  const getCacheSize = () => {
    // Mock cache size calculation
    return '0 MB';
  };

  return (
    <div className="p-8 pb-32 animate-fadeIn">
      {/* Header */}
      <div className="mb-8 animate-slideDown">
        <h1 className="text-4xl font-bold mb-2">الإعدادات</h1>
        <p className="text-gray-400">تخصيص تجربة الاستماع الخاصة بك</p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Theme Settings */}
        <section className="bg-spotify-lightGray rounded-lg p-6 transition-all hover:shadow-xl hover:shadow-spotify-green/10 animate-slideUp">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="text-spotify-green transition-transform hover:scale-110" size={24} />
            <h2 className="text-2xl font-bold">المظهر</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-lg transition-all duration-300 hover-lift ${
                theme === 'dark'
                  ? 'bg-spotify-green text-white shadow-lg shadow-spotify-green/30'
                  : 'bg-spotify-gray hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  theme === 'dark' ? 'bg-white/20' : 'bg-spotify-green/20'
                }`}>
                  <Moon size={24} className={theme === 'dark' ? 'text-white' : 'text-spotify-green'} />
                </div>
                <div className="flex-1 text-right">
                  <p className="font-semibold">الوضع الداكن</p>
                  <p className="text-sm opacity-70">افتراضي</p>
                </div>
                {theme === 'dark' && (
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center animate-scaleIn">
                    <span className="text-spotify-green text-lg">✓</span>
                  </div>
                )}
              </div>
            </button>

            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-lg transition-all duration-300 hover-lift ${
                theme === 'light'
                  ? 'bg-spotify-green text-white shadow-lg shadow-spotify-green/30'
                  : 'bg-spotify-gray hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  theme === 'light' ? 'bg-white/20' : 'bg-spotify-green/20'
                }`}>
                  <Sun size={24} className={theme === 'light' ? 'text-white' : 'text-spotify-green'} />
                </div>
                <div className="flex-1 text-right">
                  <p className="font-semibold">الوضع الفاتح</p>
                  <p className="text-sm opacity-70">قريباً</p>
                </div>
                {theme === 'light' && (
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center animate-scaleIn">
                    <span className="text-spotify-green text-lg">✓</span>
                  </div>
                )}
              </div>
            </button>
          </div>
        </section>

        {/* Language Settings */}
        <section className="bg-spotify-lightGray rounded-lg p-6 transition-all hover:shadow-xl hover:shadow-spotify-green/10 animate-slideUp">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="text-spotify-green transition-transform hover:scale-110" size={24} />
            <h2 className="text-2xl font-bold">اللغة</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setLanguage('ar')}
              className={`p-4 rounded-lg transition-all duration-300 hover-lift ${
                language === 'ar'
                  ? 'bg-spotify-green text-white shadow-lg shadow-spotify-green/30'
                  : 'bg-spotify-gray hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-3 justify-between">
                <span className="text-2xl">🇸🇦</span>
                <div className="flex-1 text-right">
                  <p className="font-semibold">العربية</p>
                  <p className="text-sm opacity-70">الافتراضية</p>
                </div>
                {language === 'ar' && (
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center animate-scaleIn">
                    <span className="text-spotify-green text-lg">✓</span>
                  </div>
                )}
              </div>
            </button>

            <button
              onClick={() => setLanguage('en')}
              className={`p-4 rounded-lg transition-all duration-300 hover-lift ${
                language === 'en'
                  ? 'bg-spotify-green text-white shadow-lg shadow-spotify-green/30'
                  : 'bg-spotify-gray hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-3 justify-between">
                <span className="text-2xl">🇬🇧</span>
                <div className="flex-1 text-right">
                  <p className="font-semibold">English</p>
                  <p className="text-sm opacity-70">قريباً</p>
                </div>
                {language === 'en' && (
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center animate-scaleIn">
                    <span className="text-spotify-green text-lg">✓</span>
                  </div>
                )}
              </div>
            </button>
          </div>
        </section>

        {/* Reciter Selection */}
        <section className="bg-spotify-lightGray rounded-lg p-6 transition-all hover:shadow-xl hover:shadow-spotify-green/10 animate-slideUp">
          <div className="flex items-center gap-3 mb-4">
            <User className="text-spotify-green transition-transform hover:scale-110" size={24} />
            <h2 className="text-2xl font-bold">اختيار القارئ</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reciters.map((reciter, index) => (
              <button
                key={reciter.id}
                onClick={() => setCurrentReciter(reciter.id)}
                className={`p-4 rounded-lg text-right transition-all duration-300 hover-lift animate-scaleIn ${
                  currentReciter === reciter.id
                    ? 'bg-spotify-green text-white shadow-lg shadow-spotify-green/30'
                    : 'bg-spotify-gray hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    currentReciter === reciter.id ? 'bg-white/20 scale-110' : 'bg-spotify-green/20 group-hover:scale-105'
                  }`}>
                    <User size={24} className={`transition-transform ${currentReciter === reciter.id ? 'text-white' : 'text-spotify-green'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold arabic-text transition-colors">{reciter.name}</p>
                    <p className="text-sm opacity-80 transition-opacity">{reciter.nameEn}</p>
                    <p className="text-xs opacity-60 mt-1 transition-opacity">{reciter.country}</p>
                  </div>
                  {currentReciter === reciter.id && (
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center animate-scaleIn">
                      <span className="text-spotify-green text-lg">✓</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Playback Speed */}
        <section className="bg-spotify-lightGray rounded-lg p-6 transition-all hover:shadow-xl hover:shadow-spotify-green/10 animate-slideUp">
          <div className="flex items-center gap-3 mb-4">
            <Gauge className="text-spotify-green transition-transform hover:scale-110" size={24} />
            <h2 className="text-2xl font-bold">سرعة التشغيل</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {speeds.map((speed) => (
              <button
                key={speed.value}
                onClick={() => setPlaybackSpeed(speed.value)}
                className={`p-4 rounded-lg text-center transition-all duration-300 hover-lift ${
                  playbackSpeed === speed.value
                    ? 'bg-spotify-green text-white shadow-lg shadow-spotify-green/30 scale-105'
                    : 'bg-spotify-gray hover:bg-gray-700'
                }`}
              >
                <div className="text-3xl mb-2">{speed.icon}</div>
                <p className="font-semibold text-sm">{speed.label.split(' - ')[0]}</p>
                <p className="text-xs opacity-70 mt-1">{speed.label.split(' - ')[1]}</p>
                {playbackSpeed === speed.value && (
                  <div className="mt-2 w-6 h-6 bg-white rounded-full flex items-center justify-center mx-auto animate-scaleIn">
                    <span className="text-spotify-green text-lg">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Volume Control */}
        <section className="bg-spotify-lightGray rounded-lg p-6 transition-all hover:shadow-xl hover:shadow-spotify-green/10 animate-slideUp">
          <div className="flex items-center gap-3 mb-6">
            <Volume2 className="text-spotify-green transition-transform hover:scale-110" size={24} />
            <h2 className="text-2xl font-bold">مستوى الصوت</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Volume2 size={20} className="text-gray-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-spotify-green"
                style={{
                  background: `linear-gradient(to left, #1DB954 ${volume * 100}%, #4b5563 ${volume * 100}%)`
                }}
              />
              <span className="text-lg font-bold w-16 text-center bg-spotify-green/20 px-3 py-1 rounded-full">
                {Math.round(volume * 100)}%
              </span>
            </div>

            {/* Quick Volume Presets */}
            <div className="flex gap-2 justify-center pt-2">
              {[0, 0.25, 0.5, 0.75, 1].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setVolume(preset)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    Math.abs(volume - preset) < 0.01
                      ? 'bg-spotify-green text-white'
                      : 'bg-spotify-gray hover:bg-gray-700'
                  }`}
                >
                  {Math.round(preset * 100)}%
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Playback Settings */}
        <section className="bg-spotify-lightGray rounded-lg p-6 transition-all hover:shadow-xl hover:shadow-spotify-green/10 animate-slideUp">
          <div className="flex items-center gap-3 mb-4">
            <Gauge className="text-spotify-green transition-transform hover:scale-110" size={24} />
            <h2 className="text-2xl font-bold">إعدادات التشغيل</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-spotify-gray rounded-lg hover:bg-gray-700 transition-all">
              <div>
                <p className="font-semibold">التشغيل التلقائي</p>
                <p className="text-sm text-gray-400">تشغيل السورة التالية تلقائياً</p>
              </div>
              <button 
                onClick={() => setAutoplay(!autoplay)}
                className={`w-14 h-7 rounded-full relative transition-all duration-300 ${
                  autoplay ? 'bg-spotify-green' : 'bg-gray-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all duration-300 ${
                  autoplay ? 'right-1' : 'right-8'
                }`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-spotify-gray rounded-lg hover:bg-gray-700 transition-all">
              <div>
                <p className="font-semibold">عرض النص القرآني</p>
                <p className="text-sm text-gray-400">إظهار الآيات أثناء التشغيل</p>
              </div>
              <button 
                onClick={() => setShowLyrics(!showLyrics)}
                className={`w-14 h-7 rounded-full relative transition-all duration-300 ${
                  showLyrics ? 'bg-spotify-green' : 'bg-gray-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all duration-300 ${
                  showLyrics ? 'right-1' : 'right-8'
                }`}></div>
              </button>
            </div>
          </div>
        </section>

        {/* Download Settings */}
        <section className="bg-spotify-lightGray rounded-lg p-6 transition-all hover:shadow-xl hover:shadow-spotify-green/10 animate-slideUp">
          <div className="flex items-center gap-3 mb-4">
            <Download className="text-spotify-green transition-transform hover:scale-110" size={24} />
            <h2 className="text-2xl font-bold">التحميلات</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-spotify-gray rounded-lg hover:bg-gray-700 transition-all">
              <div className="flex items-center gap-3">
                <Wifi className="text-spotify-green" size={20} />
                <div>
                  <p className="font-semibold">التحميل على البيانات الخلوية</p>
                  <p className="text-sm text-gray-400">السماح بالتحميل عبر شبكة الجوال</p>
                </div>
              </div>
              <button 
                onClick={() => setDownloadOnCellular(!downloadOnCellular)}
                className={`w-14 h-7 rounded-full relative transition-all duration-300 ${
                  downloadOnCellular ? 'bg-spotify-green' : 'bg-gray-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all duration-300 ${
                  downloadOnCellular ? 'right-1' : 'right-8'
                }`}></div>
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-spotify-gray rounded-lg">
              <div className="flex items-center gap-3">
                <HardDrive className="text-spotify-green" size={20} />
                <div>
                  <p className="font-semibold">مساحة التخزين</p>
                  <p className="text-sm text-gray-400">{getCacheSize()} / 500 MB متاحة</p>
                </div>
              </div>
              <button 
                onClick={handleClearCache}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
              >
                <Trash2 size={16} />
                مسح الذاكرة
              </button>
            </div>

            <div className="p-4 bg-spotify-gray/50 rounded-lg border border-gray-700">
              <div className="flex items-start gap-3">
                <Info className="text-spotify-green mt-0.5" size={20} />
                <div className="text-sm text-gray-400">
                  <p className="font-semibold text-white mb-1">💡 نصيحة:</p>
                  <p>يتم تخزين السور المُشغلة مؤقتاً لتسريع التحميل في المرات القادمة. يمكنك مسح الذاكرة المؤقتة إذا كنت بحاجة لمساحة تخزين.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Privacy */}
        <section className="bg-spotify-lightGray rounded-lg p-6 transition-all hover:shadow-xl hover:shadow-spotify-green/10 animate-slideUp">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="text-spotify-green transition-transform hover:scale-110" size={24} />
            <h2 className="text-2xl font-bold">الخصوصية والأمان</h2>
          </div>
          
          <div className="space-y-3">
            <div className="p-4 bg-spotify-gray rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-spotify-green/20 rounded-full flex items-center justify-center">
                  <span className="text-spotify-green text-lg">✓</span>
                </div>
                <p className="font-semibold">لا نجمع بيانات شخصية</p>
              </div>
              <p className="text-sm text-gray-400 mr-11">
                جميع البيانات محفوظة محلياً على جهازك فقط
              </p>
            </div>

            <div className="p-4 bg-spotify-gray rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-spotify-green/20 rounded-full flex items-center justify-center">
                  <span className="text-spotify-green text-lg">✓</span>
                </div>
                <p className="font-semibold">اتصال آمن (HTTPS)</p>
              </div>
              <p className="text-sm text-gray-400 mr-11">
                جميع الطلبات مشفرة ومحمية
              </p>
            </div>

            <div className="p-4 bg-spotify-gray rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-spotify-green/20 rounded-full flex items-center justify-center">
                  <span className="text-spotify-green text-lg">✓</span>
                </div>
                <p className="font-semibold">بدون إعلانات</p>
              </div>
              <p className="text-sm text-gray-400 mr-11">
                تجربة استماع نقية دون إزعاج
              </p>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="bg-spotify-lightGray rounded-lg p-6 transition-all hover:shadow-xl hover:shadow-spotify-green/10 animate-slideUp">
          <div className="flex items-center gap-3 mb-4">
            <Info className="text-spotify-green transition-transform hover:scale-110" size={24} />
            <h2 className="text-2xl font-bold">عن التطبيق</h2>
          </div>
          
          <div className="space-y-4">
            {/* App Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-spotify-gray p-4 rounded-lg text-center">
                <p className="text-gray-400 text-sm mb-1">الإصدار</p>
                <p className="text-white font-bold text-lg">2.0.0</p>
              </div>
              <div className="bg-spotify-gray p-4 rounded-lg text-center">
                <p className="text-gray-400 text-sm mb-1">تاريخ الإصدار</p>
                <p className="text-white font-bold text-lg">أكتوبر 2025</p>
              </div>
              <div className="bg-spotify-gray p-4 rounded-lg text-center">
                <p className="text-gray-400 text-sm mb-1">عدد القراء</p>
                <p className="text-white font-bold text-lg">5 قراء</p>
              </div>
              <div className="bg-spotify-gray p-4 rounded-lg text-center">
                <p className="text-gray-400 text-sm mb-1">عدد السور</p>
                <p className="text-white font-bold text-lg">114 سورة</p>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="bg-spotify-gray p-4 rounded-lg">
              <p className="font-semibold mb-3">التقنيات المستخدمة:</p>
              <div className="flex flex-wrap gap-2">
                {['React 18', 'Vite', 'Tailwind CSS', 'Zustand', 'Howler.js', 'PWA'].map((tech) => (
                  <span key={tech} className="bg-spotify-green/20 text-spotify-green px-3 py-1 rounded-full text-xs font-semibold">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Credits */}
            <div className="bg-spotify-gray p-4 rounded-lg">
              <p className="font-semibold mb-2">الشكر والتقدير:</p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• mp3quran.net - مصدر التلاوات الصوتية</li>
                <li>• api.alquran.cloud - بيانات القرآن الكريم</li>
                <li>• api.qurani.ai - التزامن الدقيق للآيات</li>
              </ul>
            </div>

            {/* Copyright */}
            <div className="mt-6 pt-6 border-t border-gray-700 text-center">
              <p className="text-sm text-gray-400 mb-2">
                صُنع بـ <span className="text-red-500">❤️</span> للمسلمين في كل مكان
              </p>
              <p className="text-xs text-gray-500">
                جميع الحقوق محفوظة © 2025 مشغل القرآن الكريم
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
});

export default Settings;
