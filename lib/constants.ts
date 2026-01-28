import { WeSportPostData, User } from './types';

export const MOCK_POSTS: WeSportPostData[] = [
  {
    id: '1',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1887&auto=format&fit=crop',
    username: 'sarah_crossfit',
    userAvatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    sport: 'fitness',
    description: 'Nouveau PR au deadlift aujourd\'hui ! 🔥 La persévérance finit toujours par payer. #crossfit #fitness #motivation',
    likesCount: 1240,
    commentsCount: 45,
    sharesCount: 12,
    createdAt: '2023-10-25T10:00:00Z',
  },
  {
    id: '2',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1552674605-469523170d9e?q=80&w=1887&auto=format&fit=crop',
    username: 'mike_bball',
    userAvatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    sport: 'basketball',
    description: 'Training session at sunset. Nothing beats the sound of the net. 🏀🌅 Who wants to play 1v1?',
    likesCount: 8500,
    commentsCount: 320,
    sharesCount: 500,
    createdAt: '2023-10-24T18:30:00Z',
  },
  {
    id: '3',
    mediaType: 'video',
    mediaUrl: 'https://videos.pexels.com/video-files/4761426/4761426-hd_1080_1920_25fps.mp4',
    username: 'alpine_climber',
    userAvatarUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop',
    sport: 'extreme',
    description: 'La vue depuis le sommet est incroyable. L\'ascension a duré 6 heures mais ça valait le coup ! 🏔️🧗‍♂️',
    likesCount: 23400,
    commentsCount: 1200,
    sharesCount: 4500,
    createdAt: '2023-10-23T09:15:00Z',
  },
  {
    id: '4',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?q=80&w=1887&auto=format&fit=crop',
    username: 'run_with_tom',
    userAvatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    sport: 'running',
    description: 'Morning 10k in the forest. The mist was magical. 🏃‍♂️🌲 #running #morningroutine #nature',
    likesCount: 560,
    commentsCount: 22,
    sharesCount: 5,
    createdAt: '2023-10-22T07:00:00Z',
  },
  {
    id: '5',
    mediaType: 'video',
    mediaUrl: 'https://videos.pexels.com/video-files/3196058/3196058-hd_1080_1920_25fps.mp4',
    username: 'urban_skater',
    userAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
    sport: 'other',
    description: 'Just landed this trick after 50 attempts! Never give up. 🛹🤙 #skateboarding #skatelife',
    likesCount: 45000,
    commentsCount: 890,
    sharesCount: 2100,
    createdAt: '2023-10-21T16:45:00Z',
  },
];

// Mock data pour les utilisateurs (abonnés et abonnements)
export const MOCK_FOLLOWERS: User[] = [
  {
    id: 'f1',
    username: 'sarah_crossfit',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    bio: 'CrossFit enthusiast 💪',
    isFollowing: false,
  },
  {
    id: 'f2',
    username: 'mike_bball',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    bio: 'Basketball player 🏀',
    isFollowing: true,
  },
  {
    id: 'f3',
    username: 'alpine_climber',
    avatarUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop',
    bio: 'Mountain lover 🏔️',
    isFollowing: false,
  },
  {
    id: 'f4',
    username: 'run_with_tom',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    bio: 'Marathon runner 🏃‍♂️',
    isFollowing: true,
  },
  {
    id: 'f5',
    username: 'urban_skater',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
    bio: 'Skateboarder 🛹',
    isFollowing: false,
  },
];

export const MOCK_FOLLOWING: User[] = [
  {
    id: 'fl1',
    username: 'sarah_crossfit',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    bio: 'CrossFit enthusiast 💪',
    isFollowing: true,
  },
  {
    id: 'fl2',
    username: 'mike_bball',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    bio: 'Basketball player 🏀',
    isFollowing: true,
  },
];

// Types de sports disponibles pour le filtre de la carte
export interface SportType {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export const SPORT_TYPES: SportType[] = [
  { id: 'soccer', label: 'Five', icon: '⚽', color: '#22c55e' },
  { id: 'basketball', label: 'Basket', icon: '🏀', color: '#ef4444' },
  { id: 'tennis', label: 'Tennis', icon: '🎾', color: '#8b5cf6' },
  { id: 'padel', label: 'Padel', icon: '🎾', color: '#a855f7' },
  { id: 'gym', label: 'Salle de Sport', icon: '💪', color: '#f59e0b' },
  { id: 'running', label: 'Piste Athlé', icon: '🏃', color: '#06b6d4' },
  { id: 'workout', label: 'Street Workout', icon: '🏋️', color: '#10b981' },
];

