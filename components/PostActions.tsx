import React, { useState } from 'react';
import { HeartIcon, MessageCircleIcon, ShareIcon, BookmarkIcon } from './Icons';

interface PostActionsProps {
  likes: number;
  comments: number;
  shares: number;
}

const formatCount = (count: number): string => {
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k';
  }
  return count.toString();
};

const PostActions: React.FC<PostActionsProps> = ({ likes, comments, shares }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  return (
    <div className="absolute right-2 md:right-6 bottom-[100px] md:bottom-24 z-20 flex flex-col items-center gap-6 md:gap-8 pb-4">
      
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
        <span className="text-white text-xs md:text-sm font-medium drop-shadow-md">{formatCount(likeCount)}</span>
      </div>

      {/* Comment Button */}
      <div className="flex flex-col items-center gap-1 md:gap-2">
        <button className="p-3 md:p-4 bg-black/20 backdrop-blur-[2px] rounded-full transition-transform active:scale-90 hover:bg-black/30">
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
        <button className="p-3 md:p-4 bg-black/20 backdrop-blur-[2px] rounded-full transition-transform active:scale-90 hover:bg-black/30">
          <ShareIcon className="w-7 h-7 md:w-9 md:h-9 text-white" />
        </button>
        <span className="text-white text-xs md:text-sm font-medium drop-shadow-md">{formatCount(shares)}</span>
      </div>

    </div>
  );
};

export default PostActions;