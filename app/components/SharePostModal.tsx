'use client';

import React, { useState } from 'react';
import { XIcon, SearchIcon, CheckIcon, SendIcon, UsersIcon } from './Icons';
import { useConversations, useSearchUsers, useCreateConversation, useSendMessage } from '@/lib/hooks/useChat';
import { useAuth } from './AuthProvider';
import type { Conversation, WeSportPostData } from '@/lib/types';
import toast from 'react-hot-toast';

interface SharePostModalProps {
  post: WeSportPostData;
  onClose: () => void;
  onShared?: () => void;
}

interface UserResult {
  id: string;
  username: string;
  avatar_url: string | null;
}

const SharePostModal: React.FC<SharePostModalProps> = ({ post, onClose, onShared }) => {
  const { user } = useAuth();
  const { data: conversations, isLoading: loadingConversations } = useConversations();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: searchResults, isLoading: isSearching } = useSearchUsers(searchQuery);
  
  const [selectedConversations, setSelectedConversations] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserResult[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');

  const createConversation = useCreateConversation();
  const sendMessage = useSendMessage();

  // Toggle conversation selection
  const toggleConversation = (conversationId: string) => {
    setSelectedConversations(prev => 
      prev.includes(conversationId)
        ? prev.filter(id => id !== conversationId)
        : [...prev, conversationId]
    );
  };

  // Toggle user selection (for new conversations)
  const toggleUser = (selectedUser: UserResult) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === selectedUser.id);
      if (isSelected) {
        return prev.filter(u => u.id !== selectedUser.id);
      }
      return [...prev, selectedUser];
    });
  };

  // Get display name for conversation
  const getConversationName = (conv: Conversation) => {
    if (conv.type === 'group') return conv.name || 'Groupe';
    return conv.other_participant_username || 'Utilisateur';
  };

  // Get avatar for conversation
  const getConversationAvatar = (conv: Conversation) => {
    if (conv.type === 'group') return conv.image_url;
    return conv.other_participant_avatar;
  };

  // Handle send
  const handleSend = async () => {
    if (selectedConversations.length === 0 && selectedUsers.length === 0) return;
    if (!user) return;

    setIsSending(true);

    try {
      const conversationIds: string[] = [...selectedConversations];

      // Create new conversations for selected users
      for (const selectedUser of selectedUsers) {
        const newConv = await createConversation.mutateAsync({
          type: 'direct',
          participant_ids: [selectedUser.id]
        });
        conversationIds.push(newConv.id);
      }

      // Send the shared post to all selected conversations
      for (const conversationId of conversationIds) {
        await sendMessage.mutateAsync({
          conversation_id: conversationId,
          content: message.trim() || undefined,
          shared_post_id: post.id
        });
      }

      toast.success(`Post partagé avec ${conversationIds.length} destinataire${conversationIds.length > 1 ? 's' : ''}`);
      onShared?.();
      onClose();
    } catch (error) {
      console.error('Error sharing post:', error);
      toast.error('Erreur lors du partage');
    } finally {
      setIsSending(false);
    }
  };

  const totalSelected = selectedConversations.length + selectedUsers.length;
  const canSend = totalSelected > 0 && !isSending;

  // Filter search results to exclude users already in selected conversations
  const filteredSearchResults = searchResults?.filter(result => {
    // Check if user is already selected
    if (selectedUsers.some(u => u.id === result.id)) return false;
    // Check if there's already a direct conversation with this user selected
    const hasConvWithUser = conversations?.some(conv => 
      conv.type === 'direct' && 
      conv.other_participant_id === result.id &&
      selectedConversations.includes(conv.id)
    );
    return !hasConvWithUser;
  }) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-gray-900 rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="font-semibold text-lg">Partager le post</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Post Preview */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-3">
            {/* Media thumbnail */}
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-700">
              {post.mediaType === 'image' ? (
                <img
                  src={post.mediaUrl}
                  alt="Post"
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={post.mediaUrl}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {/* Post info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">@{post.username}</p>
              <p className="text-xs text-gray-400 truncate">{post.description || 'Sans description'}</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                {post.sport}
              </span>
            </div>
          </div>
        </div>

        {/* Optional message */}
        <div className="px-4 pt-3">
          <input
            type="text"
            placeholder="Ajouter un message (optionnel)..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl py-2.5 px-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
          />
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-full py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
            />
          </div>
        </div>

        {/* Selection chips */}
        {totalSelected > 0 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {selectedConversations.map(convId => {
              const conv = conversations?.find(c => c.id === convId);
              if (!conv) return null;
              return (
                <div
                  key={convId}
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full"
                >
                  <span className="text-sm text-green-400">{getConversationName(conv)}</span>
                  <button
                    onClick={() => toggleConversation(convId)}
                    className="hover:text-red-400 transition-colors"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
            {selectedUsers.map(selectedUser => (
              <div
                key={selectedUser.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full"
              >
                <span className="text-sm text-green-400">{selectedUser.username}</span>
                <button
                  onClick={() => toggleUser(selectedUser)}
                  className="hover:text-red-400 transition-colors"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Search results */}
          {searchQuery.length >= 2 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-500 mb-2">Résultats de recherche</p>
              {isSearching ? (
                <div className="py-4 flex justify-center">
                  <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredSearchResults.length === 0 ? (
                <p className="text-sm text-gray-500 py-2">Aucun utilisateur trouvé</p>
              ) : (
                <div className="space-y-1">
                  {filteredSearchResults.map(result => {
                    const isSelected = selectedUsers.some(u => u.id === result.id);
                    return (
                      <button
                        key={result.id}
                        onClick={() => toggleUser(result)}
                        className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors ${
                          isSelected ? 'bg-green-500/10' : 'hover:bg-gray-800'
                        }`}
                      >
                        {result.avatar_url ? (
                          <img
                            src={result.avatar_url}
                            alt={result.username}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-900 to-black flex items-center justify-center">
                            <span className="text-sm font-semibold">
                              {result.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="flex-1 text-left text-sm">{result.username}</span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                            <CheckIcon className="w-3 h-3 text-black" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Recent conversations */}
          <div className="px-4 pb-4">
            <p className="text-xs text-gray-500 mb-2">Conversations récentes</p>
            {loadingConversations ? (
              <div className="py-4 flex justify-center">
                <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !conversations || conversations.length === 0 ? (
              <div className="py-4 text-center text-gray-500">
                <UsersIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucune conversation</p>
                <p className="text-xs">Recherchez un utilisateur pour partager</p>
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map(conv => {
                  const isSelected = selectedConversations.includes(conv.id);
                  const avatarUrl = getConversationAvatar(conv);
                  
                  return (
                    <button
                      key={conv.id}
                      onClick={() => toggleConversation(conv.id)}
                      className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors ${
                        isSelected ? 'bg-green-500/10' : 'hover:bg-gray-800'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full flex-shrink-0">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={getConversationName(conv)}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-gradient-to-br from-green-900 to-black flex items-center justify-center border border-gray-700">
                            {conv.type === 'group' ? (
                              <UsersIcon className="w-4 h-4 text-gray-400" />
                            ) : (
                              <span className="text-sm font-semibold text-gray-300">
                                {getConversationName(conv).charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Name */}
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium">{getConversationName(conv)}</p>
                        {conv.type === 'group' && (
                          <p className="text-xs text-gray-500">Groupe</p>
                        )}
                      </div>

                      {/* Check */}
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                          <CheckIcon className="w-3 h-3 text-black" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 safe-area-pb">
          <button
            onClick={handleSend}
            disabled={!canSend}
            className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              canSend
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Envoi...</span>
              </>
            ) : (
              <>
                <SendIcon className="w-5 h-5" />
                <span>
                  {totalSelected === 0
                    ? 'Sélectionnez un destinataire'
                    : `Envoyer${totalSelected > 1 ? ` à ${totalSelected} destinataires` : ''}`}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SharePostModal;

