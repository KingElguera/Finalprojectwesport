'use client';

import React, { useState } from 'react';
import { ChevronLeftIcon, GridIcon, BellIcon } from './Icons';
import { User } from '@/lib/types';
import { formatCount } from '@/lib/utils';
import { useProfile, useFollowers, useFollowing, useFollowUser, useUnfollowUser } from '@/lib/hooks/useProfile';
import { useUserPosts } from '@/lib/hooks/usePosts';
import { useAuth } from './AuthProvider';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

interface UserProfileViewProps {
  user: User;
  onBack: () => void;
}

const UserProfileView: React.FC<UserProfileViewProps> = ({ user, onBack }) => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'notifications'>('posts');
  
  // Charger le profil de l'utilisateur
  const { data: profileData, isLoading: profileLoading } = useProfile(user.id);
  const { data: userPostsData = [], isLoading: postsLoading } = useUserPosts(user.id, 50, 0);
  const { data: followersData = [] } = useFollowers(user.id);
  const { data: followingData = [] } = useFollowing(user.id);
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  // Vérifier si l'utilisateur actuel suit cet utilisateur
  const isFollowing = currentUser?.id ? followersData.some(f => f.id === currentUser.id) : false;
  const isOwnProfile = currentUser?.id === user.id;

  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast.error('Vous devez être connecté pour suivre un utilisateur');
      return;
    }

    try {
      if (isFollowing) {
        await unfollowUser.mutateAsync(user.id);
        toast.success('Vous ne suivez plus cet utilisateur');
      } else {
        await followUser.mutateAsync(user.id);
        toast.success('Vous suivez maintenant cet utilisateur');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du follow/unfollow');
    }
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
        {profileLoading ? (
          <div className="flex flex-col items-center p-6">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="flex flex-col items-center p-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-green-400 to-green-700 p-1 mb-3">
              <img 
                src={profileData?.avatar_url || user.avatarUrl} 
                alt={profileData?.username || user.username}
                className="w-full h-full rounded-full object-cover border-2 border-black"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/96';
                }}
              />
            </div>
            <h1 className="text-xl font-bold">@{profileData?.username || user.username}</h1>
            {(profileData?.bio || user.bio) && (
              <p className="text-gray-400 text-sm mt-1">{profileData?.bio || user.bio}</p>
            )}

            {/* Follow Button */}
            {!isOwnProfile && (
              <button
                onClick={handleFollowToggle}
                disabled={followUser.isPending || unfollowUser.isPending}
                className={`mt-4 px-6 py-2 rounded-full font-semibold transition-colors ${
                  isFollowing
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-green-600 hover:bg-green-500 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {followUser.isPending || unfollowUser.isPending ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  isFollowing ? 'Se désabonner' : 'Suivre'
                )}
              </button>
            )}

            {/* Stats */}
            <div className="flex w-full justify-around mt-6 border-t border-b border-gray-800 py-4">
              <div className="text-center">
                <div className="font-bold text-lg">{userPostsData.length}</div>
                <div className="text-xs text-gray-400">Posts</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{formatCount(followersData.length)}</div>
                <div className="text-xs text-gray-400">Abonnés</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{formatCount(followingData.length)}</div>
                <div className="text-xs text-gray-400">Abonnements</div>
              </div>
            </div>
          </div>
        )}

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
            {postsLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="aspect-square bg-gray-800 animate-pulse" />
              ))
            ) : userPostsData.length === 0 ? (
              <div className="col-span-3 flex flex-col items-center justify-center p-8 text-gray-400">
                <GridIcon className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-lg">Aucun post</p>
              </div>
            ) : (
              userPostsData.map((post) => (
                <div key={post.id} className="aspect-square bg-gray-800 relative group cursor-pointer">
                  {post.mediaType === 'video' ? (
                     <video src={post.mediaUrl} className="w-full h-full object-cover" />
                  ) : (
                     <img src={post.mediaUrl} className="w-full h-full object-cover" alt={post.description} />
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                </div>
              ))
            )}
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

