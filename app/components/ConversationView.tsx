'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  ArrowLeftIcon, 
  MoreVerticalIcon, 
  UsersIcon,
  CheckIcon,
  CheckCheckIcon
} from './Icons';
import { 
  useMessages, 
  useMarkAsRead,
  useTypingIndicators,
  useReadReceipts
} from '@/lib/hooks/useChat';
import { useAuth } from './AuthProvider';
import MessageInput from './MessageInput';
import type { Conversation, Message } from '@/lib/types';

interface ConversationViewProps {
  conversation: Conversation;
  onBack: () => void;
}

const ConversationView: React.FC<ConversationViewProps> = ({ conversation, onBack }) => {
  const { user } = useAuth();
  const { messages, isLoading, hasMore, loadMore, isFetchingNextPage } = useMessages(conversation.id);
  const markAsRead = useMarkAsRead();
  const typingUsers = useTypingIndicators(conversation.id);
  useReadReceipts(conversation.id);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [initialScrollDone, setInitialScrollDone] = useState(false);

  // Obtenir le nom d'affichage
  const getDisplayName = () => {
    if (conversation.type === 'group') {
      return conversation.name || 'Groupe';
    }
    return conversation.other_participant_username || 'Utilisateur';
  };

  // Obtenir l'avatar
  const getAvatar = () => {
    if (conversation.type === 'group') {
      return conversation.image_url;
    }
    return conversation.other_participant_avatar;
  };

  // Marquer comme lu à l'ouverture
  useEffect(() => {
    if (user && conversation.id) {
      markAsRead.mutate(conversation.id);
    }
  }, [conversation.id, user]);

  // Scroll to bottom on new messages
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: smooth ? 'smooth' : 'auto' 
    });
  }, []);

  // Initial scroll to bottom
  useEffect(() => {
    if (messages.length > 0 && !initialScrollDone) {
      scrollToBottom(false);
      setInitialScrollDone(true);
    }
  }, [messages.length, initialScrollDone, scrollToBottom]);

  // Scroll to bottom when sending a message
  useEffect(() => {
    if (messages.length > 0 && initialScrollDone) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.sender_id === user?.id) {
        scrollToBottom();
      }
    }
  }, [messages.length, user?.id, initialScrollDone, scrollToBottom]);

  // Handle scroll for show/hide scroll button and load more
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);

    // Load more when scrolling to top
    if (scrollTop < 50 && hasMore && !isFetchingNextPage) {
      loadMore();
    }
  };

  // Formater le timestamp du message
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  // Formater la date pour les séparateurs
  const formatDateSeparator = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  // Grouper les messages par date
  const groupedMessages = messages.reduce<{ date: string; messages: Message[] }[]>((groups, message) => {
    const date = new Date(message.created_at).toDateString();
    const lastGroup = groups[groups.length - 1];

    if (lastGroup && new Date(lastGroup.messages[0].created_at).toDateString() === date) {
      lastGroup.messages.push(message);
    } else {
      groups.push({ date, messages: [message] });
    }

    return groups;
  }, []);

  // Vérifier si un message est le dernier lu par les autres participants
  const isLastReadByOthers = (messageIndex: number, allMessages: Message[]) => {
    // Simplified: just check if it's the last message sent by current user
    const message = allMessages[messageIndex];
    if (message.sender_id !== user?.id) return false;
    
    // Check if there are no messages after this one from the current user
    for (let i = messageIndex + 1; i < allMessages.length; i++) {
      if (allMessages[i].sender_id === user?.id) return false;
    }
    return true;
  };

  return (
    <div className="w-full h-full bg-black text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-800 bg-black/95 backdrop-blur-sm">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-gray-800 transition-colors"
          aria-label="Retour"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>

        {/* Avatar */}
        <div className="w-10 h-10 rounded-full flex-shrink-0">
          {getAvatar() ? (
            <img
              src={getAvatar()!}
              alt={getDisplayName()}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-green-900 to-black border border-gray-700 flex items-center justify-center">
              {conversation.type === 'group' ? (
                <UsersIcon className="w-5 h-5 text-gray-400" />
              ) : (
                <span className="text-lg font-semibold text-gray-300">
                  {getDisplayName().charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{getDisplayName()}</h3>
          {typingUsers.length > 0 ? (
            <p className="text-xs text-green-500 animate-pulse">
              {typingUsers.length === 1 
                ? `${typingUsers[0].profile?.username || 'Quelqu\'un'} écrit...`
                : 'Plusieurs personnes écrivent...'}
            </p>
          ) : (
            conversation.type === 'group' && (
              <p className="text-xs text-gray-500">
                {conversation.participants?.length || 0} participants
              </p>
            )
          )}
        </div>

        {/* Menu */}
        <button
          className="p-2 rounded-full hover:bg-gray-800 transition-colors"
          aria-label="Options"
        >
          <MoreVerticalIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {/* Loading more indicator */}
        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {isLoading ? (
          // Skeleton loader
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl p-3 animate-pulse ${
                    i % 2 === 0 ? 'bg-green-900/50' : 'bg-gray-800'
                  }`}
                >
                  <div className="h-4 bg-gray-700 rounded w-32 mb-1" />
                  <div className="h-3 bg-gray-700 rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-center">Aucun message</p>
            <p className="text-sm mt-1">Envoyez le premier message !</p>
          </div>
        ) : (
          groupedMessages.map((group, groupIndex) => (
            <div key={group.date}>
              {/* Date separator */}
              <div className="flex items-center justify-center my-4">
                <span className="px-3 py-1 bg-gray-800/50 rounded-full text-xs text-gray-400">
                  {formatDateSeparator(group.messages[0].created_at)}
                </span>
              </div>

              {/* Messages of the day */}
              <div className="space-y-2">
                {group.messages.map((message, messageIndex) => {
                  const isOwn = message.sender_id === user?.id;
                  const showAvatar = !isOwn && (
                    messageIndex === 0 || 
                    group.messages[messageIndex - 1].sender_id !== message.sender_id
                  );
                  const globalIndex = messages.indexOf(message);

                  return (
                    <div
                      key={message.id}
                      className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      {/* Avatar (for others in group) */}
                      {!isOwn && conversation.type === 'group' && (
                        <div className="w-8 h-8 flex-shrink-0">
                          {showAvatar && message.sender?.avatar_url ? (
                            <img
                              src={message.sender.avatar_url}
                              alt={message.sender?.username || ''}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : showAvatar ? (
                            <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                              <span className="text-xs text-gray-400">
                                {message.sender?.username?.charAt(0).toUpperCase() || '?'}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      )}

                      {/* Message bubble */}
                      <div
                        className={`max-w-[75%] ${
                          isOwn
                            ? 'bg-green-600 rounded-2xl rounded-br-md'
                            : 'bg-gray-800 rounded-2xl rounded-bl-md'
                        }`}
                      >
                        {/* Sender name in group */}
                        {!isOwn && conversation.type === 'group' && showAvatar && (
                          <p className="px-3 pt-2 text-xs text-green-400 font-medium">
                            {message.sender?.username || 'Inconnu'}
                          </p>
                        )}

                        {/* Shared Post */}
                        {message.shared_post && (
                          <div className="p-2">
                            <div className={`rounded-xl overflow-hidden border ${
                              isOwn ? 'border-green-500/30 bg-green-700/20' : 'border-gray-700 bg-gray-900/50'
                            }`}>
                              {/* Post media thumbnail */}
                              <div className="relative aspect-video bg-gray-800">
                                {message.shared_post.media_type === 'video' ? (
                                  <video
                                    src={message.shared_post.media_url}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <img
                                    src={message.shared_post.media_url}
                                    alt="Post partagé"
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                )}
                                {/* Play button overlay for videos */}
                                {message.shared_post.media_type === 'video' && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                      <svg className="w-6 h-6 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M8 5v14l11-7z" />
                                      </svg>
                                    </div>
                                  </div>
                                )}
                              </div>
                              {/* Post info */}
                              <div className="p-2.5">
                                <div className="flex items-center gap-2 mb-1">
                                  {message.shared_post.user?.avatar_url ? (
                                    <img
                                      src={message.shared_post.user.avatar_url}
                                      alt={message.shared_post.user.username}
                                      className="w-5 h-5 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center">
                                      <span className="text-[10px] text-gray-400">
                                        {message.shared_post.user?.username?.charAt(0).toUpperCase() || '?'}
                                      </span>
                                    </div>
                                  )}
                                  <span className={`text-xs font-medium ${isOwn ? 'text-green-200' : 'text-gray-300'}`}>
                                    @{message.shared_post.user?.username || 'inconnu'}
                                  </span>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                    isOwn ? 'bg-green-500/20 text-green-300' : 'bg-gray-700 text-gray-400'
                                  }`}>
                                    {message.shared_post.sport_type}
                                  </span>
                                </div>
                                {message.shared_post.description && (
                                  <p className={`text-xs line-clamp-2 ${isOwn ? 'text-green-100/80' : 'text-gray-400'}`}>
                                    {message.shared_post.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Media */}
                        {message.media_url && !message.shared_post && (
                          <div className="p-1">
                            <img
                              src={message.media_url}
                              alt="Media"
                              className="max-w-full rounded-xl"
                              loading="lazy"
                            />
                          </div>
                        )}

                        {/* Content */}
                        {message.content && (
                          <p className="px-3 py-2 text-sm whitespace-pre-wrap break-words">
                            {message.is_deleted ? (
                              <span className="italic text-gray-400">Message supprimé</span>
                            ) : (
                              message.content
                            )}
                          </p>
                        )}

                        {/* Time and read status */}
                        <div className={`flex items-center gap-1 px-3 pb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-[10px] text-gray-400">
                            {formatMessageTime(message.created_at)}
                          </span>
                          {isOwn && (
                            <span className="text-green-300">
                              {isLastReadByOthers(globalIndex, messages) ? (
                                <CheckCheckIcon className="w-3.5 h-3.5" />
                              ) : (
                                <CheckIcon className="w-3.5 h-3.5" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-end gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
              <span className="text-xs text-gray-400">
                {typingUsers[0].profile?.username?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
            <div className="bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={() => scrollToBottom()}
          className="absolute bottom-24 right-4 p-2 bg-gray-800 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
          aria-label="Aller en bas"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      )}

      {/* Message Input */}
      <MessageInput conversationId={conversation.id} />
    </div>
  );
};

export default ConversationView;

