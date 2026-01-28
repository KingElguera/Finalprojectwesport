'use client';

import React, { useState } from 'react';
import { XIcon, ChevronRightIcon } from './Icons';
import EditProfileModal from './EditProfileModal';

interface SettingsViewProps {
  onClose: () => void;
  onProfileUpdated?: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onClose, onProfileUpdated }) => {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const sections = [
    { title: "Compte", items: ["Modifier le profil", "Mot de passe", "Confidentialité"] },
    { title: "Préférences", items: ["Notifications", "Langue", "Thème sombre"] },
    { title: "Aide & Support", items: ["Signaler un problème", "FAQ", "Conditions d'utilisation"] },
  ];

  const handleItemClick = (item: string) => {
    if (item === "Modifier le profil") {
      setIsEditProfileOpen(true);
    }
    // Autres items peuvent être gérés ici plus tard
  };

  const handleProfileUpdated = () => {
    setIsEditProfileOpen(false);
    if (onProfileUpdated) {
      onProfileUpdated();
    }
  };

  return (
    <div className="w-full h-full bg-gray-950 text-white flex flex-col animate-in slide-in-from-right duration-300">
      
      <div className="flex items-center p-4 border-b border-gray-800 bg-black">
        <button onClick={onClose} className="p-2 mr-2 hover:bg-gray-800 rounded-full">
          <XIcon className="w-6 h-6" />
        </button>
        <h2 className="font-bold text-lg">Paramètres</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {sections.map((section, idx) => (
          <div key={idx}>
            <h3 className="text-green-500 text-xs font-bold uppercase tracking-wider mb-2 ml-2">{section.title}</h3>
            <div className="bg-gray-900 rounded-xl overflow-hidden">
                {section.items.map((item, i) => (
                    <div 
                      key={i} 
                      onClick={() => handleItemClick(item)}
                      className={`flex justify-between items-center p-4 hover:bg-gray-800 cursor-pointer transition-colors ${i !== section.items.length - 1 ? 'border-b border-gray-800' : ''}`}
                    >
                        <span className="text-sm font-medium">{item}</span>
                        <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                    </div>
                ))}
            </div>
          </div>
        ))}

        <button className="w-full py-4 text-red-500 font-semibold text-center bg-gray-900 rounded-xl mt-8 hover:bg-gray-800">
            Déconnexion
        </button>

        <div className="text-center text-xs text-gray-600 mt-4 pb-8">
            WeSport v1.0.0
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onProfileUpdated={handleProfileUpdated}
      />
    </div>
  );
};

export default SettingsView;

