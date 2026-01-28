import React, { useState, useEffect } from 'react';
import { SettingsIcon, GridIcon, BellIcon, HeartIcon, MessageCircleIcon, UserIcon } from './Icons';
import { MOCK_POSTS, MOCK_FOLLOWERS, MOCK_FOLLOWING } from '../constants';
import { formatCount } from '../utils';
import UserListModal from './UserListModal';
import { UserListType, Notification } from '../types';
import { loadProfile } from '../profileStorage';
import { Profile } from '../types';
import { loadNotifications, markNotificationAsRead } from '../notificationsStorage';
import { simulateRandomNotification } from '../notificationsSimulator';

interface ProfileViewProps {
  onOpenSettings: () => void;
  onNotificationClick?: (notification: Notification) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ onOpenSettings, onNotificationClick }) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'notifications'>('posts');
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
  const [profile, setProfile] = useState<Profile>(loadProfile());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Calculer les nombres dynamiquement
  const followersCount = MOCK_FOLLOWERS.length;
  const followingCount = MOCK_FOLLOWING.length;

  // Recharger le profil et les notifications quand le composant est monté ou quand on revient sur cette vue
  useEffect(() => {
    setProfile(loadProfile());
    setNotifications(loadNotifications());
  }, []);

  // Recharger les notifications quand on change d'onglet vers notifications
  useEffect(() => {
    if (activeTab === 'notifications') {
      setNotifications(loadNotifications());
    }
  }, [activeTab]);

  // Formater le temps relatif
  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}j`;
    return new Date(timestamp).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  // Gérer le clic sur une notification
  const handleNotificationClick = (notification: Notification) => {
    // Marquer comme lue
    markNotificationAsRead(notification.id);
    setNotifications(loadNotifications());
    
    // Appeler le callback parent pour gérer la navigation
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  // Simuler une notification
  const handleSimulateNotification = () => {
    simulateRandomNotification();
    setNotifications(loadNotifications());
  };

  return (
    <div className="w-full h-full bg-black text-white flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Header sticky */}
      <div className="sticky top-0 z-10 bg-black border-b border-gray-800">
        <div className="flex justify-between items-center p-4">
          <div className="w-6"></div> {/* Spacer to center title if needed or just empty left */}
          <h2 className="font-bold text-lg">Mon Profil</h2>
          <button onClick={onOpenSettings} className="p-2 hover:bg-gray-800 rounded-full">
            <SettingsIcon className="w-6 h-6 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        
        {/* User Info */}
        <div className="flex flex-col items-center p-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-green-400 to-green-700 p-1 mb-3">
            <img 
              src={profile.avatarUrl} 
              alt="My Profile" 
              className="w-full h-full rounded-full object-cover border-2 border-black"
            />
          </div>
          <h1 className="text-xl font-bold">@{profile.username}</h1>
          <p className="text-gray-400 text-sm">{profile.bio}</p>

          {/* Stats */}
          <div className="flex w-full justify-around mt-6 border-t border-b border-gray-800 py-4">
            <div className="text-center">
              <div className="font-bold text-lg">142</div>
              <div className="text-xs text-gray-400">Posts</div>
            </div>
            <button
              onClick={() => setIsFollowersModalOpen(true)}
              className="text-center cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="font-bold text-lg">{formatCount(followersCount)}</div>
              <div className="text-xs text-gray-400">Abonnés</div>
            </button>
            <button
              onClick={() => setIsFollowingModalOpen(true)}
              className="text-center cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="font-bold text-lg">{formatCount(followingCount)}</div>
              <div className="text-xs text-gray-400">Abonnements</div>
            </button>
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
          >
            <BellIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Notifs</span>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'posts' && (
          <div className="grid grid-cols-3 gap-1 p-1">
            {/* Reuse some mock images */}
            {[...MOCK_POSTS, ...MOCK_POSTS].map((post, idx) => (
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
          <div className="flex flex-col">
            {/* Bouton pour simuler une notification */}
            <div className="p-4 border-b border-gray-800">
              <button
                onClick={handleSimulateNotification}
                className="w-full py-2 px-4 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold text-sm transition-colors"
              >
                Simuler une notification
              </button>
            </div>

            {/* Liste des notifications */}
            <div className="flex flex-col gap-0">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-gray-400">
                  <BellIcon className="w-12 h-12 mb-4 opacity-50" />
                  <p className="text-lg">Aucune notification</p>
                  <p className="text-sm mt-2">Utilisez le bouton ci-dessus pour simuler une notification</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const getNotificationText = () => {
                    switch (notif.type) {
                      case 'like':
                        return 'a aimé votre publication';
                      case 'comment':
                        return `a commenté: "${notif.commentText}"`;
                      case 'follow':
                        return 'a commencé à vous suivre';
                      default:
                        return '';
                    }
                  };

                  return (
                    <button
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`flex items-center gap-3 p-4 hover:bg-gray-900 transition-colors border-b border-gray-800/50 ${
                        !notif.read ? 'bg-gray-900/30' : ''
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={notif.actorUser.avatarUrl}
                          alt={notif.actorUser.username}
                          className="w-10 h-10 rounded-full object-cover border border-gray-700"
                        />
                        <div className="absolute -bottom-1 -right-1 p-0.5 bg-black rounded-full">
                          {notif.type === 'like' && <HeartIcon className="w-3 h-3 text-red-500 fill-red-500" />}
                          {notif.type === 'comment' && <MessageCircleIcon className="w-3 h-3 text-white fill-white" />}
                          {notif.type === 'follow' && <UserIcon className="w-3 h-3 text-green-500 fill-green-500" />}
                        </div>
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="text-sm">
                          <span className="font-bold text-white">@{notif.actorUser.username}</span>{' '}
                          <span className="text-gray-300">{getNotificationText()}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{formatTimeAgo(notif.createdAt)}</div>
                      </div>
                      {!notif.read && (
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

      </div>

      {/* Modals */}
      <UserListModal
        isOpen={isFollowersModalOpen}
        onClose={() => setIsFollowersModalOpen(false)}
        users={MOCK_FOLLOWERS}
        listType="followers"
      />
      <UserListModal
        isOpen={isFollowingModalOpen}
        onClose={() => setIsFollowingModalOpen(false)}
        users={MOCK_FOLLOWING}
        listType="following"
      />
    </div>
  );
};

export default ProfileView;