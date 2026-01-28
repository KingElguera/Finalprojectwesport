'use client';

import { useState } from 'react';
import WeSportFeed from '@/app/components/WeSportFeed';
import { ViewType, Notification, User, WeSportPostData } from '@/lib/types';
import { MapPinIcon, TrophyIcon } from '@/app/components/Icons';
import ProfileView from '@/app/components/ProfileView';
import ChatView from '@/app/components/ChatView';
import SettingsView from '@/app/components/SettingsView';
import PlaceholderView from '@/app/components/PlaceholderView';
import BottomNavigation from '@/app/components/BottomNavigation';
import UserProfileView from '@/app/components/UserProfileView';
import CommentsModal from '@/app/components/CommentsModal';
import SharePostModal from '@/app/components/SharePostModal';
import dynamic from 'next/dynamic';

// Charger MapView dynamiquement car Leaflet nécessite le DOM
const MapView = dynamic(() => import('@/app/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <div className="text-white">Chargement de la carte...</div>
    </div>
  ),
});
import { usePost } from '@/lib/hooks/usePosts';

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>('feed');
  const [profileUpdateKey, setProfileUpdateKey] = useState(0);
  const [focusPostId, setFocusPostId] = useState<string | undefined>();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [commentsModalPost, setCommentsModalPost] = useState<{ postId: string; commentText?: string } | null>(null);
  const [sharePostId, setSharePostId] = useState<string | null>(null);

  // Helper to handle navigation from BottomBar
  const handleNavigate = (view: ViewType) => {
    setCurrentView(view);
    // Réinitialiser les états de navigation quand on change de vue
    if (view !== 'feed') {
      setFocusPostId(undefined);
    }
    if (view !== 'userProfile') {
      setSelectedUser(null);
    }
  };

  // Callback pour rafraîchir le profil après modification
  const handleProfileUpdated = () => {
    setProfileUpdateKey(prev => prev + 1);
  };

  // Gérer le clic sur une notification
  const handleNotificationClick = (notification: Notification) => {
    if (notification.type === 'like' && notification.postId) {
      // Naviguer vers le feed et focuser le post
      setFocusPostId(notification.postId);
      setCurrentView('feed');
    } else if (notification.type === 'comment' && notification.postId) {
      // Ouvrir le modal de commentaires avec le post et le commentaire focusé
      setCommentsModalPost({ postId: notification.postId, commentText: notification.commentText });
    } else if (notification.type === 'follow') {
      // Naviguer vers le profil de l'utilisateur
      setSelectedUser(notification.actorUser);
      setCurrentView('userProfile');
    }
  };

  // Trouver le post pour le modal de commentaires
  const { data: postForComments } = usePost(commentsModalPost?.postId || '');
  
  // Trouver le post pour le modal de partage
  const { data: postForShare } = usePost(sharePostId || '');

  return (
    <main className="w-full h-screen bg-black font-sans">
      {/* Container pleine largeur et hauteur */}
      <div className="w-full h-full bg-black relative flex flex-col">
        
        {/* === MAIN CONTENT AREA === */}
        <div className="flex-1 relative overflow-hidden bg-black">
          
          {/* 1. FEED (Default) */}
          {currentView === 'feed' && (
             <WeSportFeed 
               focusPostId={focusPostId}
               onFocusComplete={() => setFocusPostId(undefined)}
               onCommentClick={(postId) => {
                 setCommentsModalPost({ postId });
               }}
               onShareClick={(postId) => {
                 setSharePostId(postId);
               }}
             />
          )}

          {/* 2. VIEWS (Replacing content) */}
          {currentView === 'profile' && (
            <ProfileView 
              key={profileUpdateKey}
              onOpenSettings={() => setCurrentView('settings')}
              onNotificationClick={handleNotificationClick}
            />
          )}

          {currentView === 'userProfile' && selectedUser && (
            <UserProfileView 
              user={selectedUser}
              onBack={() => {
                setCurrentView('profile');
                setSelectedUser(null);
              }}
            />
          )}

          {currentView === 'settings' && (
             <SettingsView 
               onClose={() => setCurrentView('profile')}
               onProfileUpdated={handleProfileUpdated}
             />
          )}

          {currentView === 'chat' && (
            <ChatView />
          )}

          {currentView === 'map' && (
            <MapView />
          )}

          {currentView === 'challenges' && (
            <PlaceholderView 
                title="Challenges & Progress" 
                icon={<TrophyIcon />} 
            />
          )}
        </div>

        {/* === BOTTOM NAVIGATION === */}
        <BottomNavigation 
          currentView={currentView}
          onNavigate={handleNavigate}
        />
      </div>

      {/* Comments Modal */}
      {commentsModalPost && postForComments && (
        <CommentsModal
          isOpen={!!commentsModalPost}
          onClose={() => setCommentsModalPost(null)}
          post={postForComments}
          focusCommentText={commentsModalPost.commentText}
        />
      )}

      {/* Share Post Modal */}
      {sharePostId && postForShare && (
        <SharePostModal
          post={postForShare}
          onClose={() => setSharePostId(null)}
          onShared={() => setSharePostId(null)}
        />
      )}
    </main>
  );
}

