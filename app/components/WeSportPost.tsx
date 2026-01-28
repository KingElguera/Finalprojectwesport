'use client';

import React from 'react';
import { WeSportPostData } from '@/lib/types';
import PostHeader from './PostHeader';
import PostActions from './PostActions';
import PostDescription from './PostDescription';

interface WeSportPostProps {
  post: WeSportPostData;
  onCommentClick?: () => void;
  onShareClick?: () => void;
}

const WeSportPost: React.FC<WeSportPostProps> = ({ post, onCommentClick, onShareClick }) => {
  return (
    <article className="relative w-full h-full snap-start overflow-hidden bg-black select-none">
      
      {/* Media Layer */}
      <div className="absolute inset-0 z-0">
        {post.mediaType === 'video' ? (
          <video
            src={post.mediaUrl}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <img
            src={post.mediaUrl}
            alt={post.description}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
        
        {/* Dark Overlay for text readability */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      </div>

      {/* UI Layers */}
      <PostHeader 
        username={post.username} 
        avatarUrl={post.userAvatarUrl} 
        sport={post.sport} 
      />

      <PostActions 
        postId={post.id}
        likes={post.likesCount}
        comments={post.commentsCount}
        shares={post.sharesCount}
        onCommentClick={onCommentClick}
        onShareClick={onShareClick}
      />

      <PostDescription 
        username={post.username}
        description={post.description}
      />

    </article>
  );
};

export default WeSportPost;

