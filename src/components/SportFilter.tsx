'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SPORT_TYPES, SportType } from '@/lib/constants';

export type SortOrder = 'default' | 'most_popular' | 'least_popular';

interface SportFilterProps {
  selectedSports: string[];
  onSelectionChange: (sports: string[]) => void;
  sortOrder?: SortOrder;
  onSortChange?: (sort: SortOrder) => void;
}

const SORT_OPTIONS: { id: SortOrder; label: string; icon: string }[] = [
  { id: 'default', label: 'Par défaut', icon: '⚡' },
  { id: 'most_popular', label: 'Plus fréquentés', icon: '🔥' },
  { id: 'least_popular', label: 'Moins fréquentés', icon: '🌱' },
];

const SportFilter: React.FC<SportFilterProps> = ({
  selectedSports,
  onSelectionChange,
  sortOrder = 'default',
  onSortChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAllSelected = selectedSports.length === 0;

  const handleToggleAll = () => {
    onSelectionChange([]);
  };

  const handleToggleSport = (sportId: string) => {
    if (isAllSelected) {
      // Si "Tous" était sélectionné, on passe à une sélection unique
      onSelectionChange([sportId]);
    } else if (selectedSports.includes(sportId)) {
      // Désélectionner ce sport
      const newSelection = selectedSports.filter(id => id !== sportId);
      // Si plus rien n'est sélectionné, revenir à "Tous"
      onSelectionChange(newSelection.length === 0 ? [] : newSelection);
    } else {
      // Ajouter ce sport à la sélection
      const newSelection = [...selectedSports, sportId];
      // Si tous les sports sont sélectionnés, revenir à "Tous"
      if (newSelection.length === SPORT_TYPES.length) {
        onSelectionChange([]);
      } else {
        onSelectionChange(newSelection);
      }
    }
  };

  const getButtonLabel = () => {
    if (isAllSelected) {
      return 'Tous les sports';
    }
    if (selectedSports.length === 1) {
      const sport = SPORT_TYPES.find(s => s.id === selectedSports[0]);
      return sport ? `${sport.icon} ${sport.label}` : 'Filtre';
    }
    return `${selectedSports.length} sports`;
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bouton toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-black/80 backdrop-blur-md border border-white/20 rounded-xl text-white text-sm font-medium shadow-lg hover:bg-black/90 transition-all duration-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-80"
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        <span>{getButtonLabel()}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-black/90 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Section Tri */}
          {onSortChange && (
            <>
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Trier par
              </div>
              <div className="py-1">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => onSortChange(option.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/10 transition-colors ${
                      sortOrder === option.id ? 'bg-amber-500/10' : ''
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        sortOrder === option.id
                          ? 'bg-amber-500 border-amber-500'
                          : 'border-white/40'
                      }`}
                    >
                      {sortOrder === option.id && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-lg">{option.icon}</span>
                    <span className={`${sortOrder === option.id ? 'text-amber-400' : 'text-white/90'}`}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
              {/* Séparateur */}
              <div className="h-px bg-white/10 mx-3 my-1" />
            </>
          )}

          {/* Section Sports */}
          <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Filtrer par sport
          </div>

          {/* Option "Tous les sports" */}
          <button
            onClick={handleToggleAll}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/10 transition-colors ${
              isAllSelected ? 'bg-white/15' : ''
            }`}
          >
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                isAllSelected
                  ? 'bg-emerald-500 border-emerald-500'
                  : 'border-white/40'
              }`}
            >
              {isAllSelected && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span className="text-white font-medium">Tous les sports</span>
          </button>

          {/* Séparateur */}
          <div className="h-px bg-white/10 mx-3" />

          {/* Liste des sports */}
          <div className="py-1 max-h-48 overflow-y-auto">
            {SPORT_TYPES.map((sport) => {
              const isSelected = isAllSelected || selectedSports.includes(sport.id);
              return (
                <button
                  key={sport.id}
                  onClick={() => handleToggleSport(sport.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/10 transition-colors ${
                    !isAllSelected && isSelected ? 'bg-white/5' : ''
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors`}
                    style={{
                      backgroundColor: !isAllSelected && isSelected ? sport.color : 'transparent',
                      borderColor: !isAllSelected && isSelected ? sport.color : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {!isAllSelected && isSelected && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span className="text-lg">{sport.icon}</span>
                  <span className="text-white/90">{sport.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SportFilter;



