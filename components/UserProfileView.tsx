import React, { useState } from 'react';
import { ChevronLeftIcon, SettingsIcon, GridIcon, BellIcon } from './Icons';
import { User } from '../types';
import { MOCK_POSTS } from '../constants';
import { formatCount } from '../utils';

interface UserProfileViewProps {
  user: User;
  onBack: () => void;
}

const UserProfileView: React.FC<UserProfileViewProps> = ({ user, onBack }) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'notifications'>('posts');
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);

  // Mock stats
  const postsCount = 42;
  const followersCount = 1250;
  const followingCount = 89;

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
  };

  return (
    <div className="w-full h-full bg-black text-white flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Header sticky */}
      <div className="sticky top-0 z-10 bg-black border-b border-gray-800">
        <div className="flex items-center p-4">
          <button onClick={onBack} className="p-2 mr-2 hover:bg-gray-800 rounded-full">
            <ChevronLeftIcon className="w-6 h-6 text-gray-300" />
          </button>
          <h2 className="font-bold text-lg flex-1">@{user.username}</h2>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        
        {/* User Info */}
        <div className="flex flex-col items-center p-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-green-400 to-green-700 p-1 mb-3">
            <img 
              src={user.avatarUrl} 
              alt={user.username}
              className="w-full h-full rounded-full object-cover border-2 border-black"
            />
          </div>
          <h1 className="text-xl font-bold">@{user.username}</h1>
          {user.bio && <p className="text-gray-400 text-sm mt-1">{user.bio}</p>}

          {/* Follow Button */}
          <button
            onClick={handleFollowToggle}
            className={`mt-4 px-6 py-2 rounded-full font-semibold transition-colors ${
              isFollowing
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-green-600 hover:bg-green-500 text-white'
            }`}
          >
            {isFollowing ? 'Se désabonner' : 'Suivre'}
          </button>

          {/* Stats */}
          <div className="flex w-full justify-around mt-6 border-t border-b border-gray-800 py-4">
            <div className="text-center">
              <div className="font-bold text-lg">{postsCount}</div>
              <div className="text-xs text-gray-400">Posts</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">{formatCount(followersCount)}</div>
              <div className="text-xs text-gray-400">Abonnés</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">{formatCount(followingCount)}</div>
              <div className="text-xs text-gray-400">Abonnements</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex w-full border-b border-gray-800 sticky top-0 bg-black z-10">
          <button 
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 flex justify-center items-center gap-2 ${activeTab === 'posts' ? 'border-b-2 border-green-500 text-green-500' : 'text-gray-500'}`}
          >
            <GridIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Posts</span>
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-3 flex justify-center items-center gap-2 ${activeTab === 'notifications' ? 'border-b-2 border-green-500 text-green-500' : 'text-gray-500'}`}
            disabled
          >
            <BellIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Notifs</span>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'posts' && (
          <div className="grid grid-cols-3 gap-1 p-1">
            {MOCK_POSTS.slice(0, 6).map((post, idx) => (
              <div key={idx} className="aspect-square bg-gray-800 relative group cursor-pointer">
                {post.mediaType === 'video' ? (
                   <video src={post.mediaUrl} className="w-full h-full object-cover" />
                ) : (
                   <img src={post.mediaUrl} className="w-full h-full object-cover" alt="" />
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="flex flex-col items-center justify-center p-8 text-gray-400">
            <p>Les notifications de cet utilisateur ne sont pas disponibles</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default UserProfileView;




