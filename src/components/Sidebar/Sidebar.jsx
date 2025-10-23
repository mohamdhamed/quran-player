import { Home as HomeIcon, Library, Heart, Search, Settings, PlayCircle, Sparkles, ListMusic } from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage }) {
  const menuItems = [
    { id: 'home', name: 'الرئيسية', icon: HomeIcon },
    { id: 'library', name: 'المكتبة', icon: Library },
    { id: 'favorites', name: 'المفضلة', icon: Heart },
    { id: 'playlists', name: 'قوائم التشغيل', icon: ListMusic },
    { id: 'smartsearch', name: 'بحث ذكي', icon: Sparkles },
    { id: 'settings', name: 'الإعدادات', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-black p-6 flex flex-col gap-6 border-l border-gray-800/50">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-4 animate-slideDown">
        <div className="w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center transition-all hover:scale-110 hover:rotate-12 animate-pulse">
          <span className="text-2xl">🕌</span>
        </div>
        <h1 className="text-xl font-bold transition-colors hover:text-spotify-green">مشغل القرآن</h1>
      </div>

      {/* Menu */}
      <nav className="flex flex-col gap-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`sidebar-item transition-all duration-300 hover:scale-105 hover:pr-2 animate-slideUp delay-${index * 100} ${
                currentPage === item.id 
                  ? 'active shadow-lg shadow-spotify-green/20' 
                  : 'hover:shadow-md'
              }`}
            >
              <Icon 
                size={24} 
                className={`transition-all duration-300 ${
                  currentPage === item.id 
                    ? 'text-spotify-green scale-110' 
                    : 'group-hover:scale-110'
                }`}
              />
              <span className="text-sm font-semibold transition-all">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* Footer */}
      <div className="text-xs text-gray-500 text-center animate-fadeIn transition-colors hover:text-gray-400">
        <p>مشغل القرآن الكريم</p>
        <p className="mt-1">الإصدار 1.0</p>
      </div>
    </aside>
  );
}
