'use client';

import React from 'react';
import { HeartIcon, MessageCircleIcon, ShareIcon, BookmarkIcon } from './Icons';
import { useIsLiked, useLikePost, useUnlikePost, useIsSaved, useSavePost, useUnsavePost } from '@/lib/hooks/usePosts';
import { formatCount } from '@/lib/utils';
import toast from 'react-hot-toast';

interface PostActionsProps {
  postId: string;
  likes: number;
  comments: number;
  shares: number;
  onCommentClick?: () => void;
  onShareClick?: () => void;
}

const PostActions: React.FC<PostActionsProps> = ({ postId, likes, comments, shares, onCommentClick, onShareClick }) => {
  const { data: isLiked = false } = useIsLiked(postId);
  const { data: isSaved = false } = useIsSaved(postId);
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();
  const savePost = useSavePost();
  const unsavePost = useUnsavePost();

  const handleLike = async () => {
    try {
      if (isLiked) {
        await unlikePost.mutateAsync(postId);
        toast.success('Like retiré');
      } else {
        await likePost.mutateAsync(postId);
        toast.success('Post liké');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du like');
    }
  };

  const handleSave = async () => {
    try {
      if (isSaved) {
        await unsavePost.mutateAsync(postId);
        toast.success('Post retiré des sauvegardes');
      } else {
        await savePost.mutateAsync(postId);
        toast.success('Post sauvegardé');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    }
  };

  return (
    <div className="absolute right-2 md:right-6 bottom-20 md:bottom-24 z-20 flex flex-col items-center gap-6 md:gap-8 pb-4">
      
      {/* User Avatar + Plus button could go here in a fuller implementation */}

      {/* Like Button */}
      <div className="flex flex-col items-center gap-1 md:gap-2 group">
        <button 
          onClick={handleLike}
          className="p-3 md:p-4 bg-black/20 backdrop-blur-[2px] rounded-full transition-transform active:scale-90 hover:bg-black/30"
        >
          <HeartIcon 
            className={`w-8 h-8 md:w-10 md:h-10 transition-colors duration-300 ${isLiked ? 'text-red-500' : 'text-white'}`} 
            fill={isLiked ? "currentColor" : "none"} 
          />
        </button>
        <span className="text-white text-xs md:text-sm font-medium drop-shadow-md">{formatCount(likes)}</span>
      </div>

      {/* Comment Button */}
      <div className="flex flex-col items-center gap-1 md:gap-2">
        <button 
          onClick={onCommentClick}
          className="p-3 md:p-4 bg-black/20 backdrop-blur-[2px] rounded-full transition-transform active:scale-90 hover:bg-black/30"
        >
          <MessageCircleIcon className="w-7 h-7 md:w-9 md:h-9 text-white" />
        </button>
        <span className="text-white text-xs md:text-sm font-medium drop-shadow-md">{formatCount(comments)}</span>
      </div>

      {/* Save Button */}
      <div className="flex flex-col items-center gap-1 md:gap-2">
        <button 
          onClick={handleSave}
          className="p-3 md:p-4 bg-black/20 backdrop-blur-[2px] rounded-full transition-transform active:scale-90 hover:bg-black/30"
        >
          <BookmarkIcon 
            className={`w-7 h-7 md:w-9 md:h-9 transition-colors duration-300 ${isSaved ? 'text-yellow-400' : 'text-white'}`} 
            fill={isSaved ? "currentColor" : "none"} 
          />
        </button>
        <span className="text-white text-xs md:text-sm font-medium drop-shadow-md">Save</span>
      </div>

      {/* Share Button */}
      <div className="flex flex-col items-center gap-1 md:gap-2">
        <button 
          onClick={onShareClick}
          className="p-3 md:p-4 bg-black/20 backdrop-blur-[2px] rounded-full transition-transform active:scale-90 hover:bg-black/30"
        >
          <ShareIcon className="w-7 h-7 md:w-9 md:h-9 text-white" />
        </button>
        <span className="text-white text-xs md:text-sm font-medium drop-shadow-md">{formatCount(shares)}</span>
      </div>

    </div>
  );
};

export default PostActions;

