'use client';

import React, { useRef, useEffect } from 'react';
import { useInfinitePosts } from '@/lib/hooks/usePosts';
import WeSportPost from './WeSportPost';
import LoadingSpinner from './LoadingSpinner';
import { useIntersectionObserver } from '@/lib/hooks/useIntersectionObserver';

interface WeSportFeedProps {
  focusPostId?: string;
  onFocusComplete?: () => void;
  onCommentClick?: (postId: string) => void;
  onShareClick?: (postId: string) => void;
}

const WeSportFeed: React.FC<WeSportFeedProps> = ({ focusPostId, onFocusComplete, onCommentClick, onShareClick }) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfinitePosts(20);

  const posts = data?.pages.flat() || [];
  const postRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Observer pour charger plus de posts au scroll
  useIntersectionObserver({
    target: loadMoreRef,
    onIntersect: () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    enabled: hasNextPage && !isFetchingNextPage,
  });

  useEffect(() => {
    if (focusPostId && postRefs.current[focusPostId] && containerRef.current) {
      const postElement = postRefs.current[focusPostId];
      if (postElement) {
        // Désactiver temporairement le snap pour permettre le scroll libre
        containerRef.current.style.scrollSnapType = 'none';
        
        postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Réactiver le snap après le scroll
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.style.scrollSnapType = 'y mandatory';
          }
          if (onFocusComplete) {
            onFocusComplete();
          }
        }, 1000);
      }
    }
  }, [focusPostId, onFocusComplete]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    console.error('Error loading posts:', error);
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        <div className="text-center px-4">
          <p className="text-red-500 mb-2">Erreur lors du chargement des posts</p>
          <p className="text-gray-400 text-sm mb-4">Veuillez réessayer plus tard</p>
          {process.env.NODE_ENV === 'development' && (
            <details className="text-xs text-gray-500 mt-4 text-left max-w-md">
              <summary className="cursor-pointer mb-2">Détails de l'erreur (dev)</summary>
              <pre className="bg-gray-900 p-2 rounded overflow-auto">
                {error instanceof Error ? error.message : JSON.stringify(error, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-lg mb-2">Aucun post disponible</p>
          <p className="text-gray-400 text-sm">Soyez le premier à publier !</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth"
    >
      {posts.map((post) => (
        <div 
          key={post.id} 
          ref={(el) => {
            postRefs.current[post.id] = el;
          }}
          className="w-full h-full snap-start"
        >
          <WeSportPost 
            post={post} 
            onCommentClick={() => {
              if (onCommentClick) {
                onCommentClick(post.id);
              }
            }}
            onShareClick={() => {
              if (onShareClick) {
                onShareClick(post.id);
              }
            }}
          />
        </div>
      ))}
      
      {/* Load more trigger */}
      <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
        {isFetchingNextPage && <LoadingSpinner />}
      </div>
    </div>
  );
};

export default WeSportFeed;

