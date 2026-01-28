'use client';

import React, { useState } from 'react';
import { Location } from '@/lib/types';
import { checkinsService, FriendAtLocation } from '@/lib/services/checkins.service';
import { ratingsService } from '@/lib/services/ratings.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import StarRating from './StarRating';

type TabType = 'checkin' | 'posts';

interface LocationDrawerProps {
  location: Location;
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onUserClick?: (userId: string) => void;
}

const LocationDrawer: React.FC<LocationDrawerProps> = ({
  location,
  isOpen,
  onClose,
  userId,
  onUserClick,
}) => {
  const [isPublic, setIsPublic] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('checkin');
  const queryClient = useQueryClient();

  // Récupérer le nombre de personnes actuellement présentes
  const { data: activeCount = 0 } = useQuery({
    queryKey: ['activeCheckins', location.id],
    queryFn: () => checkinsService.getActiveCheckinsCount(location.id),
    enabled: isOpen,
    staleTime: 30000, // 30 secondes
  });

  // Récupérer les amis actuellement présents
  const { data: friendsHere = [] } = useQuery({
    queryKey: ['friendsAtLocation', location.id, userId],
    queryFn: () => checkinsService.getFriendsAtLocation(userId!, location.id),
    enabled: isOpen && !!userId,
    staleTime: 30000,
  });

  // Récupérer les amis ayant visité récemment (30 derniers jours)
  const { data: friendsRecent = [] } = useQuery({
    queryKey: ['friendsRecentlyAtLocation', location.id, userId],
    queryFn: () => checkinsService.getFriendsRecentlyAtLocation(userId!, location.id, 30),
    enabled: isOpen && !!userId,
    staleTime: 60000, // 1 minute
  });

  // Récupérer les statistiques de notation du lieu
  const { data: ratingStats } = useQuery({
    queryKey: ['locationRatingStats', location.id],
    queryFn: () => ratingsService.getLocationRatingStats(location.id),
    enabled: isOpen,
    staleTime: 30000,
  });

  // Récupérer la note de l'utilisateur pour ce lieu
  const { data: userRating } = useQuery({
    queryKey: ['userRating', location.id, userId],
    queryFn: () => ratingsService.getUserRating(userId!, location.id),
    enabled: isOpen && !!userId,
    staleTime: 30000,
  });

  const handleFriendClick = (friendId: string) => {
    if (onUserClick) {
      onUserClick(friendId);
    }
  };

  // Formater le temps relatif
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `il y a ${diffMins} min`;
    } else if (diffHours < 24) {
      return `il y a ${diffHours}h`;
    } else {
      return `il y a ${diffDays}j`;
    }
  };

  // Mutation pour noter le lieu
  const ratingMutation = useMutation({
    mutationFn: async (rating: number) => {
      if (!userId) {
        throw new Error('Vous devez être connecté pour noter');
      }
      return ratingsService.rateLocation(userId, location.id, rating);
    },
    onSuccess: () => {
      toast.success('Note enregistrée !');
      queryClient.invalidateQueries({ queryKey: ['locationRatingStats', location.id] });
      queryClient.invalidateQueries({ queryKey: ['userRating', location.id, userId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la notation');
    },
  });

  const checkinMutation = useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error('Vous devez être connecté pour faire un check-in');
      }
      return checkinsService.createCheckin(
        userId,
        location.id,
        isPublic,
        undefined
      );
    },
    onSuccess: () => {
      toast.success('Check-in effectué avec succès !');
      
      // Invalider toutes les queries liées aux check-ins pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['checkins'] });
      queryClient.invalidateQueries({ queryKey: ['activeCheckins'] });
      queryClient.invalidateQueries({ queryKey: ['friendsAtLocation'] });
      queryClient.invalidateQueries({ queryKey: ['friendsRecentlyAtLocation'] });
      queryClient.invalidateQueries({ queryKey: ['locationsWithPopularity'] });
      
      // Fermer le drawer après un court délai
      setTimeout(() => {
        onClose();
        setIsPublic(true);
      }, 1000);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors du check-in');
    },
  });

  const handleCheckin = () => {
    if (!userId) {
      toast.error('Vous devez être connecté pour faire un check-in');
      return;
    }
    checkinMutation.mutate();
  };

  const handleRatingChange = (rating: number) => {
    if (!userId) {
      toast.error('Connectez-vous pour noter ce lieu');
      return;
    }
    if (rating > 0) {
      ratingMutation.mutate(rating);
    }
  };

  // Partager l'adresse du lieu
  const handleShare = async () => {
    const shareText = location.address 
      ? `${location.name} - ${location.address}`
      : location.name;
    
    const shareData = {
      title: location.name,
      text: shareText,
      url: window.location.href,
    };

    try {
      // Utiliser l'API Web Share si disponible (mobile)
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copier l'adresse dans le presse-papier
        const textToCopy = location.address || location.name;
        await navigator.clipboard.writeText(textToCopy);
        toast.success('Adresse copiée !');
      }
    } catch (error) {
      // L'utilisateur a annulé le partage ou erreur
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
        toast.error('Impossible de partager');
      }
    }
  };

  return (
    <>
      {/* Overlay sombre */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 z-[1001] transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          maxHeight: '80vh',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
        }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-white/30 rounded-full" />
        </div>

        {/* Content */}
        <div className="px-6 pb-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 20px)' }}>
          {/* Header avec compteur de personnes */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {/* Nom et badge */}
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-bold text-white">{location.name}</h2>
                {/* Badge compteur de personnes */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-emerald-400 text-sm font-semibold">
                    {activeCount} {activeCount <= 1 ? 'personne' : 'personnes'}
                  </span>
                </div>
              </div>
              
              {/* Adresse avec bouton partage - toujours visible */}
              <div className="flex items-center gap-2 mb-2">
                <svg
                  className="w-4 h-4 text-gray-500 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <p className={`text-sm flex-1 ${location.address ? 'text-gray-300' : 'text-gray-500 italic'}`}>
                  {location.address || 'Adresse non disponible'}
                </p>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-xs font-medium transition-colors"
                  aria-label="Partager l'adresse"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  Partager
                </button>
              </div>
              
              {/* Type de sport */}
              <p className="text-green-500 font-medium capitalize">{location.type}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors ml-4"
              aria-label="Fermer"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Onglets */}
          <div className="flex mb-4 bg-white/5 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('checkin')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'checkin'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Check-in
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'posts'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Posts
            </button>
          </div>

          {/* Contenu de l'onglet Check-in */}
          {activeTab === 'checkin' && (
            <>
              {/* Section Amis */}
              {userId && (friendsHere.length > 0 || friendsRecent.length > 0) && (
                <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  {/* Amis actuellement ici */}
                  {friendsHere.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                        <span className="text-sm font-medium text-emerald-400">
                          Amis ici maintenant
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {friendsHere.map((friend) => (
                          <button
                            key={friend.id}
                            onClick={() => handleFriendClick(friend.id)}
                            className="flex items-center gap-2 px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-full transition-colors"
                          >
                            <img
                              src={friend.avatar_url || '/default-avatar.png'}
                              alt={friend.username}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="text-sm text-white font-medium">
                              {friend.username}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Amis ayant visité récemment */}
                  {friendsRecent.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-sm font-medium text-gray-400">
                          Amis passés récemment
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {friendsRecent.slice(0, 5).map((friend) => (
                          <button
                            key={friend.id}
                            onClick={() => handleFriendClick(friend.id)}
                            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors"
                          >
                            <img
                              src={friend.avatar_url || '/default-avatar.png'}
                              alt={friend.username}
                              className="w-6 h-6 rounded-full object-cover opacity-80"
                            />
                            <span className="text-sm text-gray-300">
                              {friend.username}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatRelativeTime(friend.checkin_time)}
                            </span>
                          </button>
                        ))}
                        {friendsRecent.length > 5 && (
                          <span className="flex items-center px-3 py-2 text-sm text-gray-500">
                            +{friendsRecent.length - 5} autres
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Image du lieu (si disponible) */}
              {location.image_url && (
                <div className="mb-4 rounded-lg overflow-hidden">
                  <img
                    src={location.image_url}
                    alt={location.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              {/* Section Notation */}
              <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
                {/* Note moyenne */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-300 text-sm">Note moyenne</span>
                    {ratingStats?.average_rating ? (
                      <>
                        <StarRating rating={ratingStats.average_rating} readonly size="sm" />
                        <span className="text-amber-400 font-bold">
                          {ratingStats.average_rating.toFixed(1)}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-500 text-sm italic">Pas encore noté</span>
                    )}
                  </div>
                  {ratingStats && ratingStats.ratings_count > 0 && (
                    <span className="text-gray-500 text-xs">
                      ({ratingStats.ratings_count} avis)
                    </span>
                  )}
                </div>

                {/* Note de l'utilisateur */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Votre note</span>
                  {userId ? (
                    <div className="flex items-center gap-2">
                      <StarRating
                        rating={userRating || 0}
                        onRatingChange={handleRatingChange}
                        size="md"
                      />
                      {ratingMutation.isPending && (
                        <svg
                          className="animate-spin w-4 h-4 text-amber-400"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-500 text-xs italic">Connectez-vous pour noter</span>
                  )}
                </div>
              </div>

              {/* Toggle Public/Privé */}
              <div className="mb-6 flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">Check-in public</p>
                  <p className="text-sm text-gray-400">
                    {isPublic
                      ? 'Visible par tous les utilisateurs'
                      : 'Visible uniquement par vous'}
                  </p>
                </div>
                <button
                  onClick={() => setIsPublic(!isPublic)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isPublic ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                  role="switch"
                  aria-checked={isPublic}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isPublic ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Bouton Check-in */}
              <button
                onClick={handleCheckin}
                disabled={checkinMutation.isPending || !userId}
                className={`w-full py-4 rounded-lg font-semibold text-white transition-all ${
                  checkinMutation.isPending || !userId
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-500 active:scale-95'
                }`}
              >
                {checkinMutation.isPending ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Enregistrement...
                  </span>
                ) : (
                  'Je suis ici / Check-in'
                )}
              </button>

              {!userId && (
                <p className="text-center text-sm text-gray-400 mt-3">
                  Connectez-vous pour faire un check-in
                </p>
              )}
            </>
          )}

          {/* Contenu de l'onglet Posts */}
          {activeTab === 'posts' && (
            <div className="py-8">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 mb-4 bg-white/5 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h3 className="text-white font-semibold mb-2">Aucun post pour le moment</h3>
                <p className="text-gray-400 text-sm max-w-xs">
                  Les publications mentionnant ce lieu apparaîtront ici.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LocationDrawer;
