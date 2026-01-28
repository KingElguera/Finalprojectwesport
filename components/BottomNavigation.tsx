import React from 'react';
import { HomeIcon, MapPinIcon, PlusIcon, UsersIcon, UserIcon } from './Icons';
import { ViewType } from '../types';

interface BottomNavigationProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentView, onNavigate }) => {
  const getIconColor = (view: ViewType) => {
    // Si on est dans settings, on considère que l'onglet actif est 'profile'
    const active = currentView === view || (view === 'profile' && currentView === 'settings');
    return active ? 'text-green-500' : 'text-gray-500 hover:text-gray-300';
  };

  return (
    <div className="w-full bg-black/95 backdrop-blur-md border-t border-white/10 flex justify-between items-center px-3 md:px-6 py-2 md:py-2.5 z-50">
      
      {/* Home / Feed */}
      <button 
        onClick={() => onNavigate('feed')}
        className={`flex flex-col items-center gap-0.5 md:gap-1 ${getIconColor('feed')} transition-colors`}
      >
        <HomeIcon className="w-5 h-5 md:w-6 md:h-6" />
        <span className="text-[9px] md:text-[10px] font-medium">Accueil</span>
      </button>

      {/* Maps */}
      <button 
        onClick={() => onNavigate('map')}
        className={`flex flex-col items-center gap-0.5 md:gap-1 ${getIconColor('map')} transition-colors`}
      >
        <MapPinIcon className="w-5 h-5 md:w-6 md:h-6" />
        <span className="text-[9px] md:text-[10px] font-medium">Cartes</span>
      </button>

      {/* POST (Center Button) */}
      <div className="relative -top-2 md:-top-2.5">
        <button 
          onClick={() => console.log('Open Post Modal')} // Placeholder functionality
          className="bg-green-600 hover:bg-green-500 text-white p-2.5 md:p-3 rounded-full shadow-lg shadow-green-900/50 transition-transform active:scale-95 border-2 border-black"
        >
          <PlusIcon className="w-6 h-6 md:w-7 md:h-7" />
        </button>
      </div>

      {/* Groups / Chat */}
      <button 
        onClick={() => onNavigate('chat')}
        className={`flex flex-col items-center gap-0.5 md:gap-1 ${getIconColor('chat')} transition-colors`}
      >
        <UsersIcon className="w-5 h-5 md:w-6 md:h-6" />
        <span className="text-[9px] md:text-[10px] font-medium">Groupes</span>
      </button>

      {/* Profile */}
      <button 
        onClick={() => onNavigate('profile')}
        className={`flex flex-col items-center gap-0.5 md:gap-1 ${getIconColor('profile')} transition-colors`}
      >
        <UserIcon className="w-5 h-5 md:w-6 md:h-6" />
        <span className="text-[9px] md:text-[10px] font-medium">Vous</span>
      </button>

    </div>
  );
};

export default BottomNavigation;