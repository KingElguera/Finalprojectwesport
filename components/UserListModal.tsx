import React, { useState } from 'react';
import { User, UserListType } from '../types';
import { XIcon } from './Icons';

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  listType: UserListType;
  onFollowToggle?: (userId: string, isFollowing: boolean) => void;
}

const UserListModal: React.FC<UserListModalProps> = ({
  isOpen,
  onClose,
  users,
  listType,
  onFollowToggle,
}) => {
  const [localUsers, setLocalUsers] = useState<User[]>(users);

  // Mettre à jour la liste locale quand les users changent
  React.useEffect(() => {
    setLocalUsers(users);
  }, [users]);

  if (!isOpen) return null;

  const title = listType === 'followers' ? 'Abonnés' : 'Abonnements';

  const handleFollowToggle = (userId: string, currentFollowing: boolean) => {
    setLocalUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId
          ? { ...user, isFollowing: !currentFollowing }
          : user
      )
    );
    
    if (onFollowToggle) {
      onFollowToggle(userId, !currentFollowing);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full h-full md:w-[600px] md:h-[80vh] bg-black border border-gray-800 flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-800">
          <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Fermer"
          >
            <XIcon className="w-6 h-6 text-gray-300" />
          </button>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {localUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-gray-400">
              <p className="text-lg">Aucun {listType === 'followers' ? 'abonné' : 'abonnement'}</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {localUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-4 p-4 md:p-6 border-b border-gray-800/50 hover:bg-gray-900/50 transition-colors"
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border border-gray-700"
                    />
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-base md:text-lg truncate">
                      @{user.username}
                    </h3>
                    {user.bio && (
                      <p className="text-gray-400 text-sm md:text-base truncate mt-1">
                        {user.bio}
                      </p>
                    )}
                  </div>

                  {/* Follow/Unfollow Button */}
                  {listType === 'followers' && (
                    <button
                      onClick={() => handleFollowToggle(user.id, user.isFollowing || false)}
                      className={`px-4 md:px-6 py-2 rounded-full font-semibold text-sm md:text-base transition-colors ${
                        user.isFollowing
                          ? 'bg-gray-700 hover:bg-gray-600 text-white'
                          : 'bg-green-600 hover:bg-green-500 text-white'
                      }`}
                    >
                      {user.isFollowing ? 'Se désabonner' : 'Suivre'}
                    </button>
                  )}
                  
                  {listType === 'following' && (
                    <button
                      onClick={() => handleFollowToggle(user.id, user.isFollowing || false)}
                      className="px-4 md:px-6 py-2 rounded-full font-semibold text-sm md:text-base bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                    >
                      Se désabonner
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserListModal;




