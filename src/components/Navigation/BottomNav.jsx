import { Home, Library, Heart, ListMusic, Settings } from 'lucide-react';
import { useTranslation } from '../../i18n';

export default function BottomNav({ currentPage, setCurrentPage }) {
  const { t } = useTranslation();

  const navItems = [
    { id: 'home', name: 'الرئيسية', icon: Home },
    { id: 'library', name: 'المكتبة', icon: Library },
    { id: 'favorites', name: 'المفضلة', icon: Heart },
    { id: 'playlists', name: 'القوائم', icon: ListMusic },
    { id: 'settings', name: 'الإعدادات', icon: Settings },
  ];

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 bg-spotify-gray/98 backdrop-blur-xl border-t border-gray-700/50 z-30 pb-safe"
      style={{ 
        paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5)'
      }}
      role="navigation"
      aria-label={t('التنقل الرئيسي')}
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-300 min-w-[60px] ${
                isActive 
                  ? 'text-spotify-green scale-105' 
                  : 'text-gray-400 hover:text-white active:scale-95'
              }`}
              aria-label={t(item.name)}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon 
                  size={22} 
                  className={`transition-all duration-300 ${
                    isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(29,185,84,0.6)]' : ''
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {/* Active Indicator Dot */}
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-spotify-green rounded-full animate-pulse" />
                )}
              </div>
              <span 
                className={`text-[10px] font-semibold transition-all duration-300 ${
                  isActive ? 'text-spotify-green' : 'text-gray-400'
                }`}
              >
                {t(item.name)}
              </span>
              {/* Active Underline */}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-spotify-green rounded-full animate-scaleIn" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
