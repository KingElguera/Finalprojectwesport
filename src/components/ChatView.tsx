'use client';

import React, { useState } from 'react';
import { ChevronRightIcon, PlusIcon, SearchIcon, UsersIcon } from './Icons';
import { useConversations, useTotalUnreadCount } from '@/lib/hooks/useChat';
import { useAuth } from './AuthProvider';
import ConversationView from './ConversationView';
import NewConversationModal from './NewConversationModal';
import type { Conversation } from '@/lib/types';

interface ChatViewProps {
  // onClose removed as we use bottom nav
}

const ChatView: React.FC<ChatViewProps> = () => {
  const { user } = useAuth();
  const { data: conversations, isLoading, error } = useConversations();
  const { data: totalUnread } = useTotalUnreadCount();
  
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrer les conversations par recherche
  const filteredConversations = conversations?.filter((conv) => {
    if (!searchQuery.trim()) return true;
    const searchLower = searchQuery.toLowerCase();
    
    // Chercher dans le nom du groupe ou le nom de l'autre participant
    if (conv.type === 'group' && conv.name) {
      return conv.name.toLowerCase().includes(searchLower);
    }
    if (conv.type === 'direct' && conv.other_participant_username) {
      return conv.other_participant_username.toLowerCase().includes(searchLower);
    }
    return false;
  }) || [];

  // Formater le timestamp
  const formatTime = (timestamp: string | null | undefined) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  };

  // Obtenir le nom d'affichage de la conversation
  const getDisplayName = (conv: Conversation) => {
    if (conv.type === 'group') {
      return conv.name || 'Groupe';
    }
    return conv.other_participant_username || 'Utilisateur';
  };

  // Obtenir l'avatar de la conversation
  const getAvatar = (conv: Conversation) => {
    if (conv.type === 'group') {
      return conv.image_url;
    }
    return conv.other_participant_avatar;
  };

  // Si une conversation est sélectionnée, afficher la vue de conversation
  if (selectedConversation) {
    return (
      <ConversationView
        conversation={selectedConversation}
        onBack={() => setSelectedConversation(null)}
      />
    );
  }

  return (
    <div className="w-full h-full bg-black text-white flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-800">
        <h2 className="font-bold text-lg">Messages</h2>
        <button
          onClick={() => setShowNewConversation(true)}
          className="p-2 rounded-full hover:bg-gray-800 transition-colors"
          aria-label="Nouvelle conversation"
        >
          <PlusIcon className="w-5 h-5 text-green-500" />
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="px-4 py-3">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher une conversation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
          />
        </div>
      </div>

      {/* Liste des conversations */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          // Skeleton loader
          <div className="space-y-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-gray-800" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-800 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-800 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
            <p className="text-center mb-4">Erreur lors du chargement des conversations</p>
            <button 
              onClick={() => window.location.reload()}
              className="text-green-500 hover:underline"
            >
              Réessayer
            </button>
          </div>
        ) : !user ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
            <UsersIcon className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-center mb-2">Connectez-vous pour accéder à vos messages</p>
            <a href="/login" className="text-green-500 hover:underline">
              Se connecter
            </a>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
            <UsersIcon className="w-16 h-16 mb-4 opacity-50" />
            {searchQuery ? (
              <p className="text-center">Aucune conversation trouvée</p>
            ) : (
              <>
                <p className="text-center mb-4">Pas encore de conversation</p>
                <button
                  onClick={() => setShowNewConversation(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-full text-white transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Nouvelle conversation</span>
                </button>
              </>
            )}
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const avatarUrl = getAvatar(conv);
            const hasUnread = (conv.unread_count || 0) > 0;

            return (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className="w-full flex items-center gap-4 p-4 hover:bg-gray-900 cursor-pointer border-b border-gray-800/50 transition-colors text-left"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full flex-shrink-0 relative">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={getDisplayName(conv)}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-green-900 to-black opacity-80 border border-gray-700 flex items-center justify-center">
                      {conv.type === 'group' ? (
                        <UsersIcon className="w-5 h-5 text-gray-400" />
                      ) : (
                        <span className="text-lg font-semibold text-gray-300">
                          {getDisplayName(conv).charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  )}
                  {hasUnread && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                  )}
                </div>
                
                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`font-semibold truncate ${hasUnread ? 'text-white' : 'text-gray-300'}`}>
                      {getDisplayName(conv)}
                    </h3>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {formatTime(conv.last_message_created_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${hasUnread ? 'text-gray-200 font-medium' : 'text-gray-500'}`}>
                      {conv.last_message_content || 'Aucun message'}
                    </p>
                    {hasUnread && (
                      <span className="ml-2 flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-green-500 rounded-full text-xs font-medium flex items-center justify-center text-black">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
                
                <ChevronRightIcon className="w-5 h-5 text-gray-600 flex-shrink-0" />
              </button>
            );
          })
        )}
      </div>

      {/* Modal nouvelle conversation */}
      {showNewConversation && (
        <NewConversationModal
          onClose={() => setShowNewConversation(false)}
          onConversationCreated={(conversation) => {
            setShowNewConversation(false);
            setSelectedConversation(conversation);
          }}
        />
      )}
    </div>
  );
};

export default ChatView;
