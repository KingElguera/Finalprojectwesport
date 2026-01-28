import React, { useState } from 'react';
import WeSportFeed from './components/WeSportFeed';
import { MOCK_POSTS } from './constants';
import { ViewType, Notification, User } from './types';
import { MapPinIcon, TrophyIcon } from './components/Icons';
import ProfileView from './components/ProfileView';
import ChatView from './components/ChatView';
import SettingsView from './components/SettingsView';
import PlaceholderView from './components/PlaceholderView';
import BottomNavigation from './components/BottomNavigation';
import UserProfileView from './components/UserProfileView';
import CommentsModal from './components/CommentsModal';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('feed');
  const [profileUpdateKey, setProfileUpdateKey] = useState(0);
  const [focusPostId, setFocusPostId] = useState<string | undefined>();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [commentsModalPost, setCommentsModalPost] = useState<{ postId: string; commentText?: string } | null>(null);

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
  const getPostForComments = () => {
    if (!commentsModalPost) return null;
    return MOCK_POSTS.find(p => p.id === commentsModalPost.postId) || null;
  };

  return (
    <main className="w-full h-screen bg-black font-sans">
      {/* Container pleine largeur et hauteur */}
      <div className="w-full h-full bg-black relative flex flex-col">
        
        {/* === MAIN CONTENT AREA === */}
        <div className="flex-1 relative overflow-hidden bg-black">
          
          {/* 1. FEED (Default) */}
          {currentView === 'feed' && (
             <WeSportFeed 
               posts={MOCK_POSTS} 
               focusPostId={focusPostId}
               onFocusComplete={() => setFocusPostId(undefined)}
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
            <PlaceholderView 
                title="Carte des Spots" 
                icon={<MapPinIcon />} 
            />
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
      {commentsModalPost && getPostForComments() && (
        <CommentsModal
          isOpen={!!commentsModalPost}
          onClose={() => setCommentsModalPost(null)}
          post={getPostForComments()!}
          focusCommentText={commentsModalPost.commentText}
        />
      )}
    </main>
  );
}

export default App;