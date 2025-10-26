import { Home, Library, Heart, Settings } from 'lucide-react';

const BottomNav = ({ currentPage, setCurrentPage }) => {
  const menuItems = [
    { id: 'home', icon: Home, label: 'الرئيسية' },
    { id: 'library', icon: Library, label: 'المكتبة' },
    { id: 'favorites', icon: Heart, label: 'المفضلة' },
    { id: 'settings', icon: Settings, label: 'الإعدادات' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-spotify-lightGray border-t border-spotify-gray z-50">
      <div className="flex justify-around py-3">
        {menuItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setCurrentPage(id)}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              currentPage === id
                ? 'text-spotify-green'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Icon size={24} />
            <span className="text-xs mt-1">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;