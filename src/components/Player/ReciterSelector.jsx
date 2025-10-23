import { useState } from 'react';
import { User, ChevronDown } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { getReciters, getReciterById } from '../../services/quranAPI';

export default function ReciterSelector() {
  const { currentReciter, setCurrentReciter } = usePlayerStore();
  const [isOpen, setIsOpen] = useState(false);
  const reciters = getReciters();
  const selectedReciter = getReciterById(currentReciter);

  const handleSelect = (reciterId) => {
    setCurrentReciter(reciterId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-spotify-gray hover:bg-gray-700 rounded-lg transition-colors"
      >
        <User size={18} className="text-spotify-green" />
        <span className="text-sm font-medium hidden md:inline">
          {selectedReciter?.name || 'القارئ'}
        </span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute bottom-full left-0 mb-2 w-64 bg-spotify-lightGray rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
            {reciters.map((reciter) => (
              <button
                key={reciter.id}
                onClick={() => handleSelect(reciter.id)}
                className={`w-full p-3 text-right hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  currentReciter === reciter.id ? 'bg-gray-700' : ''
                }`}
              >
                <p className="font-semibold arabic-text text-sm">{reciter.name}</p>
                <p className="text-xs text-gray-400">{reciter.nameEn}</p>
                {currentReciter === reciter.id && (
                  <div className="mt-1">
                    <span className="inline-block px-2 py-0.5 bg-spotify-green text-white text-xs rounded-full">
                      محدد
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
