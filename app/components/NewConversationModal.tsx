'use client';

import React, { useState, useEffect } from 'react';
import { XIcon, SearchIcon, UsersIcon, CheckIcon, ArrowLeftIcon } from './Icons';
import { useSearchUsers, useCreateConversation } from '@/lib/hooks/useChat';
import { useAuth } from './AuthProvider';
import type { Conversation } from '@/lib/types';

interface NewConversationModalProps {
  onClose: () => void;
  onConversationCreated: (conversation: Conversation) => void;
}

interface UserResult {
  id: string;
  username: string;
  avatar_url: string | null;
}

const NewConversationModal: React.FC<NewConversationModalProps> = ({
  onClose,
  onConversationCreated
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState<'type' | 'users' | 'group-details'>('type');
  const [conversationType, setConversationType] = useState<'direct' | 'group'>('direct');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<UserResult[]>([]);
  const [groupName, setGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { data: searchResults, isLoading: isSearching } = useSearchUsers(searchQuery);
  const createConversation = useCreateConversation();

  // Filter out already selected users from search results
  const filteredResults = searchResults?.filter(
    (u) => !selectedUsers.some((selected) => selected.id === u.id)
  ) || [];

  // Handle user selection
  const toggleUserSelection = (selectedUser: UserResult) => {
    if (conversationType === 'direct') {
      // Pour les conversations directes, sélectionner un seul utilisateur
      setSelectedUsers([selectedUser]);
    } else {
      // Pour les groupes, permettre plusieurs sélections
      setSelectedUsers((prev) => {
        const isSelected = prev.some((u) => u.id === selectedUser.id);
        if (isSelected) {
          return prev.filter((u) => u.id !== selectedUser.id);
        }
        return [...prev, selectedUser];
      });
    }
  };

  // Remove a selected user
  const removeUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // Handle create conversation
  const handleCreate = async () => {
    if (selectedUsers.length === 0) return;

    try {
      setIsCreating(true);

      const conversation = await createConversation.mutateAsync({
        type: conversationType,
        name: conversationType === 'group' ? groupName.trim() || undefined : undefined,
        participant_ids: selectedUsers.map((u) => u.id)
      });

      onConversationCreated(conversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Erreur lors de la création de la conversation');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle next step
  const handleNext = () => {
    if (step === 'type') {
      setStep('users');
    } else if (step === 'users') {
      if (conversationType === 'group' && selectedUsers.length > 0) {
        setStep('group-details');
      } else if (conversationType === 'direct' && selectedUsers.length === 1) {
        handleCreate();
      }
    } else if (step === 'group-details') {
      handleCreate();
    }
  };

  // Handle back
  const handleBack = () => {
    if (step === 'users') {
      setStep('type');
      setSelectedUsers([]);
    } else if (step === 'group-details') {
      setStep('users');
    }
  };

  // Can proceed to next step
  const canProceed = () => {
    if (step === 'type') return true;
    if (step === 'users') {
      if (conversationType === 'direct') return selectedUsers.length === 1;
      return selectedUsers.length >= 1;
    }
    if (step === 'group-details') return selectedUsers.length >= 1;
    return false;
  };

  // Get button text
  const getButtonText = () => {
    if (isCreating) return 'Création...';
    if (step === 'type') return 'Continuer';
    if (step === 'users') {
      if (conversationType === 'direct') return 'Démarrer la conversation';
      return 'Continuer';
    }
    return 'Créer le groupe';
  };

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
          {step !== 'type' ? (
            <button
              onClick={handleBack}
              className="p-2 -ml-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-9" />
          )}
          <h2 className="font-semibold text-lg">
            {step === 'type' && 'Nouvelle conversation'}
            {step === 'users' && (conversationType === 'direct' ? 'Choisir un contact' : 'Ajouter des membres')}
            {step === 'group-details' && 'Détails du groupe'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Step 1: Choose type */}
          {step === 'type' && (
            <div className="p-4 space-y-3">
              <button
                onClick={() => setConversationType('direct')}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                  conversationType === 'direct'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-gray-800 hover:bg-gray-800'
                }`}
              >
                <div className={`p-3 rounded-full ${
                  conversationType === 'direct' ? 'bg-green-500' : 'bg-gray-800'
                }`}>
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
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold">Message privé</h3>
                  <p className="text-sm text-gray-500">Conversation avec une personne</p>
                </div>
                {conversationType === 'direct' && (
                  <CheckIcon className="w-5 h-5 text-green-500" />
                )}
              </button>

              <button
                onClick={() => setConversationType('group')}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                  conversationType === 'group'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-gray-800 hover:bg-gray-800'
                }`}
              >
                <div className={`p-3 rounded-full ${
                  conversationType === 'group' ? 'bg-green-500' : 'bg-gray-800'
                }`}>
                  <UsersIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold">Groupe</h3>
                  <p className="text-sm text-gray-500">Conversation avec plusieurs personnes</p>
                </div>
                {conversationType === 'group' && (
                  <CheckIcon className="w-5 h-5 text-green-500" />
                )}
              </button>
            </div>
          )}

          {/* Step 2: Select users */}
          {step === 'users' && (
            <div className="flex flex-col h-full">
              {/* Selected users */}
              {selectedUsers.length > 0 && (
                <div className="p-4 pb-2 flex flex-wrap gap-2 border-b border-gray-800">
                  {selectedUsers.map((selectedUser) => (
                    <div
                      key={selectedUser.id}
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full"
                    >
                      <span className="text-sm text-green-400">{selectedUser.username}</span>
                      <button
                        onClick={() => removeUser(selectedUser.id)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Search */}
              <div className="p-4 pb-2">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Rechercher un utilisateur..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-full py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
                    autoFocus
                  />
                </div>
              </div>

              {/* Results */}
              <div className="flex-1 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 animate-pulse">
                        <div className="w-10 h-10 rounded-full bg-gray-800" />
                        <div className="flex-1">
                          <div className="h-4 bg-gray-800 rounded w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchQuery.length < 2 ? (
                  <div className="p-8 text-center text-gray-500">
                    <SearchIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Tapez au moins 2 caractères pour rechercher</p>
                  </div>
                ) : filteredResults.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>Aucun utilisateur trouvé</p>
                  </div>
                ) : (
                  <div className="p-4 pt-2 space-y-1">
                    {filteredResults.map((result) => {
                      const isSelected = selectedUsers.some((u) => u.id === result.id);
                      
                      return (
                        <button
                          key={result.id}
                          onClick={() => toggleUserSelection(result)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                            isSelected
                              ? 'bg-green-500/10 border border-green-500/50'
                              : 'hover:bg-gray-800 border border-transparent'
                          }`}
                        >
                          {/* Avatar */}
                          <div className="w-10 h-10 rounded-full flex-shrink-0">
                            {result.avatar_url ? (
                              <img
                                src={result.avatar_url}
                                alt={result.username}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full rounded-full bg-gradient-to-br from-green-900 to-black border border-gray-700 flex items-center justify-center">
                                <span className="text-lg font-semibold text-gray-300">
                                  {result.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Name */}
                          <span className="flex-1 text-left font-medium">{result.username}</span>

                          {/* Check */}
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                              <CheckIcon className="w-4 h-4 text-black" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Group details */}
          {step === 'group-details' && (
            <div className="p-4 space-y-6">
              {/* Group name */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Nom du groupe (optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Team Running Paris"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
                  autoFocus
                />
              </div>

              {/* Members preview */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Membres ({selectedUsers.length})
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((selectedUser) => (
                    <div
                      key={selectedUser.id}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-full"
                    >
                      {selectedUser.avatar_url ? (
                        <img
                          src={selectedUser.avatar_url}
                          alt={selectedUser.username}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-green-900 flex items-center justify-center">
                          <span className="text-xs font-semibold">
                            {selectedUser.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-sm">{selectedUser.username}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 safe-area-pb">
          <button
            onClick={handleNext}
            disabled={!canProceed() || isCreating}
            className={`w-full py-3 rounded-xl font-semibold transition-all ${
              canProceed() && !isCreating
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isCreating ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Création...</span>
              </div>
            ) : (
              getButtonText()
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewConversationModal;

