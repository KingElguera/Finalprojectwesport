import React, { useRef, useEffect } from 'react';
import { WeSportPostData } from '../types';
import WeSportPost from './WeSportPost';

interface WeSportFeedProps {
  posts: WeSportPostData[];
  focusPostId?: string;
  onFocusComplete?: () => void;
}

const WeSportFeed: React.FC<WeSportFeedProps> = ({ posts, focusPostId, onFocusComplete }) => {
  const postRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);

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
          <WeSportPost post={post} />
        </div>
      ))}
    </div>
  );
};

export default WeSportFeed;