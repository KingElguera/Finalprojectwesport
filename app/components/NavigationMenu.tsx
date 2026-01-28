'use client';

import React from 'react';
import { UserIcon, MessageCircleIcon, MapPinIcon, TrophyIcon, SettingsIcon, XIcon } from './Icons';
import { ViewType } from '@/lib/types';

interface NavigationMenuProps {
  onNavigate: (view: ViewType) => void;
  onClose: () => void;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({ onNavigate, onClose }) => {
  const menuItems = [
    { id: 'profile', label: 'Mon Profil', icon: UserIcon, color: 'text-blue-400' },
    { id: 'chat', label: 'Messagerie', icon: MessageCircleIcon, color: 'text-green-400' },
    { id: 'map', label: 'Carte des spots', icon: MapPinIcon, color: 'text-red-400' },
    { id: 'challenges', label: 'Challenges', icon: TrophyIcon, color: 'text-yellow-400' },
  ];

  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col p-6 animate-in fade-in duration-200">
      
      {/* Header Close */}
      <div className="flex justify-end mb-8">
        <button 
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <XIcon className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Main Links */}
      <div className="flex flex-col gap-4 flex-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as ViewType)}
            className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-white/10 transition-all active:scale-95"
          >
            <div className={`p-3 rounded-xl bg-white/5 ${item.color} group-hover:scale-110 transition-transform`}>
              <item.icon className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-white tracking-wide">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Settings at Bottom */}
      <div className="mt-auto pt-6 border-t border-white/10">
        <button
          onClick={() => onNavigate('settings')}
          className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
        >
          <SettingsIcon className="w-5 h-5" />
          <span className="font-medium">Paramètres</span>
        </button>
      </div>

    </div>
  );
};

export default NavigationMenu;

