'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import L from 'leaflet';
import { Location, Coordinates } from '@/lib/types';
import { locationsService, LocationWithPopularity } from '@/lib/services/locations.service';
import { useQuery } from '@tanstack/react-query';
import LocationDrawer from './LocationDrawer';
import SportFilter, { SortOrder } from './SportFilter';
import { useAuth } from './AuthProvider';

// Les styles Leaflet sont importés dans globals.css

// Créer une icône personnalisée pour "Moi"
const createUserIcon = () => {
  return L.divIcon({
    className: 'user-marker',
    html: `<div style="
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: #3b82f6;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// Créer une icône pour les lieux sportifs avec emoji selon le type
const createLocationIcon = (type: string) => {
  const colors: Record<string, string> = {
    'five-a-side': '#22c55e',
    'futsal': '#22c55e',
    'basketball': '#ef4444',
    'soccer': '#22c55e',
    'gym': '#f59e0b',
    'tennis': '#8b5cf6',
    'running': '#06b6d4',
    'default': '#6b7280',
  };
  
  const icons: Record<string, string> = {
    'five-a-side': '⚽',
    'futsal': '⚽',
    'soccer': '⚽',
    'basketball': '🏀',
    'tennis': '🎾',
    'running': '🏃',
    'gym': '💪',
  };
  
  const color = colors[type.toLowerCase()] || colors.default;
  const icon = icons[type.toLowerCase()];
  
  // Afficher emoji ou point blanc selon le type de sport
  const innerContent = icon 
    ? `<span style="
        font-size: 14px;
        transform: rotate(45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      ">${icon}</span>`
    : `<div style="
        width: 8px;
        height: 8px;
        background-color: white;
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(45deg);
      "></div>`;
  
  return L.divIcon({
    className: 'location-marker',
    html: `<div style="
      width: 28px;
      height: 28px;
      border-radius: 50% 50% 50% 0;
      background-color: ${color};
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
    ">${innerContent}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
};

interface MapViewProps {
  onLocationSelect?: (location: Location) => void;
}

const MapView: React.FC<MapViewProps> = ({ onLocationSelect }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const [userPosition, setUserPosition] = useState<Coordinates | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([48.8566, 2.3522]); // Paris par défaut
  const [selectedSports, setSelectedSports] = useState<string[]>([]); // [] = tous les sports
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { user } = useAuth();

  // Récupérer les lieux depuis Supabase avec leur popularité
  const { data: locations = [], isLoading, error: locationsError } = useQuery({
    queryKey: ['locationsWithPopularity'],
    queryFn: () => locationsService.getLocationsWithPopularity(),
  });

  // Filtrer et trier les lieux
  const filteredLocations = useMemo(() => {
    // D'abord filtrer par sport
    let result = selectedSports.length === 0
      ? locations
      : locations.filter(loc => selectedSports.includes(loc.type));
    
    // Ensuite trier selon l'ordre sélectionné
    if (sortOrder === 'most_popular') {
      result = [...result].sort((a, b) => (b.checkins_count || 0) - (a.checkins_count || 0));
    } else if (sortOrder === 'least_popular') {
      result = [...result].sort((a, b) => (a.checkins_count || 0) - (b.checkins_count || 0));
    }
    
    return result;
  }, [locations, selectedSports, sortOrder]);

  // Résultats de recherche
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return locations.filter(loc => 
      loc.name.toLowerCase().includes(query) ||
      (loc.address && loc.address.toLowerCase().includes(query))
    ).slice(0, 5); // Limiter à 5 résultats
  }, [locations, searchQuery]);

  // Initialiser la carte Leaflet
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Créer la carte
    const map = L.map(mapContainerRef.current, {
      center: mapCenter,
      zoom: 13,
      zoomControl: true,
    });

    // Ajouter les tuiles Dark Matter de CartoDB
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // Nettoyer lors du démontage
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Seulement au montage

  // Mettre à jour le centre de la carte
  useEffect(() => {
    if (mapRef.current && mapCenter) {
      mapRef.current.setView(mapCenter, mapRef.current.getZoom());
    }
  }, [mapCenter]);

  // Demander la géolocalisation au chargement
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: Coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserPosition(coords);
          setMapCenter([coords.lat, coords.lng]);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Garder la vue par défaut (Paris)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }
  }, []);

  const handleMarkerClick = (location: Location) => {
    setSelectedLocation(location);
    setIsDrawerOpen(true);
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedLocation(null);
  };

  // Gérer le clic sur un résultat de recherche
  const handleSearchResultClick = (location: Location) => {
    setMapCenter([location.coordinates.lat, location.coordinates.lng]);
    if (mapRef.current) {
      mapRef.current.setZoom(16);
    }
    setSearchQuery('');
    setIsSearchFocused(false);
    handleMarkerClick(location);
  };

  // Fermer la recherche quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mettre à jour les marqueurs quand les lieux filtrés changent
  useEffect(() => {
    if (!mapRef.current) return;

    // Supprimer les anciens marqueurs
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Ajouter le marqueur utilisateur
    if (userPosition && mapRef.current) {
      const userMarker = L.marker([userPosition.lat, userPosition.lng], {
        icon: createUserIcon(),
      }).addTo(mapRef.current);
      userMarker.bindPopup('Vous êtes ici');
      markersRef.current.push(userMarker);
    }

    // Ajouter les marqueurs des lieux filtrés
    filteredLocations.forEach((location) => {
      if (mapRef.current) {
        const marker = L.marker([location.coordinates.lat, location.coordinates.lng], {
          icon: createLocationIcon(location.type),
        }).addTo(mapRef.current);
        
        const activeCount = (location as LocationWithPopularity).active_count || 0;
        const activeIndicator = activeCount > 0 
          ? `<div style="display: flex; align-items: center; gap: 4px; justify-content: center; margin-top: 4px;">
               <span style="width: 6px; height: 6px; background: #22c55e; border-radius: 50%; display: inline-block;"></span>
               <span style="color: #22c55e; font-size: 12px;">${activeCount} ici</span>
             </div>`
          : '';
        
        marker.bindPopup(`
          <div style="text-align: center;">
            <strong>${location.name}</strong><br/>
            <span style="color: #6b7280;">${location.type}</span>
            ${activeIndicator}
          </div>
        `);
        
        marker.on('click', () => handleMarkerClick(location));
        markersRef.current.push(marker);
      }
    });
  }, [filteredLocations, userPosition]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} style={{ height: '100%', width: '100%', zIndex: 0 }} />

      {/* Barre de recherche */}
      <div ref={searchRef} className="absolute top-4 left-4 z-[1000] w-72">
        <div className="relative">
          {/* Input de recherche */}
          <div className="flex items-center bg-black/80 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden shadow-lg">
            <div className="pl-4 pr-2 text-gray-400">
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
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Rechercher un lieu..."
              className="flex-1 py-2.5 pr-4 bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchFocused(false);
                }}
                className="pr-3 text-gray-400 hover:text-white transition-colors"
              >
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
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {/* Dropdown des résultats */}
          {isSearchFocused && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {searchResults.map((location) => (
                <button
                  key={location.id}
                  onClick={() => handleSearchResultClick(location)}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0"
                >
                  <div className="mt-0.5 text-emerald-400">
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
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">
                      {location.name}
                    </p>
                    {location.address && (
                      <p className="text-gray-400 text-xs truncate mt-0.5">
                        {location.address}
                      </p>
                    )}
                    <p className="text-emerald-500/70 text-xs capitalize mt-0.5">
                      {location.type}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Message "aucun résultat" */}
          {isSearchFocused && searchQuery.trim() && searchResults.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl overflow-hidden p-4">
              <p className="text-gray-400 text-sm text-center">
                Aucun lieu trouvé pour "{searchQuery}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Filtre de sports et tri */}
      <div className="absolute top-4 right-4 z-[1000]">
        <SportFilter
          selectedSports={selectedSports}
          onSelectionChange={setSelectedSports}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
        />
      </div>

      {/* Drawer pour les détails du lieu */}
      {selectedLocation && (
        <LocationDrawer
          location={selectedLocation}
          isOpen={isDrawerOpen}
          onClose={handleCloseDrawer}
          userId={user?.id}
        />
      )}

      {/* Indicateur de chargement */}
      {isLoading && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-sm z-[1000]">
          Chargement des lieux...
        </div>
      )}

      {/* Message si pas de lieux */}
      {!isLoading && locations.length === 0 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-sm z-[1000]">
          Aucun lieu sportif disponible. La table locations est vide.
        </div>
      )}

      {/* Message si aucun lieu après filtrage */}
      {!isLoading && locations.length > 0 && filteredLocations.length === 0 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-sm z-[1000]">
          Aucun lieu pour ce filtre. Essayez d&apos;autres sports.
        </div>
      )}

      {/* Message d'erreur */}
      {locationsError && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600/90 text-white px-4 py-2 rounded-lg text-sm z-[1000]">
          Erreur lors du chargement des lieux: {(locationsError as Error)?.message || 'Erreur inconnue'}
        </div>
      )}
    </div>
  );
};

export default MapView;
