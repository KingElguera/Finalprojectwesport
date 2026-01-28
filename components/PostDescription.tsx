import React, { useState } from 'react';
import { MusicIcon } from './Icons';

interface PostDescriptionProps {
  username: string;
  description: string;
}

const PostDescription: React.FC<PostDescriptionProps> = ({ username, description }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  // On considère le texte "long" assez tôt pour forcer l'apparition du bouton sur mobile
  // si le texte dépasse ~40 caractères (une ligne moyenne sur mobile).
  const isLongText = description.length > 40;

  return (
    <div className="absolute bottom-0 left-0 right-16 md:right-24 z-20 p-4 md:p-6 pb-6 md:pb-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
      
      {/* Username Repeater (Clickable) */}
      <div className="text-white font-bold text-base md:text-lg mb-1 md:mb-2 drop-shadow-md cursor-pointer hover:underline">
        @{username}
      </div>

      {/* Description Text */}
      <div className="text-white/90 text-xs md:text-base drop-shadow-sm leading-relaxed relative transition-all duration-300">
        {/* line-clamp-1 pour un aperçu très court (une seule ligne) */}
        <div className={isExpanded ? '' : 'line-clamp-1 md:line-clamp-2'}>
          {description}
        </div>
        
        {isLongText && (
          <button 
            onClick={toggleExpand}
            className="text-green-500 font-semibold text-[10px] md:text-sm mt-1 md:mt-2 hover:text-green-400 transition-colors uppercase tracking-wide cursor-pointer"
          >
            {isExpanded ? 'Voir moins' : 'Voir plus'}
          </button>
        )}
      </div>

      {/* Sound ticker dummy UI */}
      <div className="flex items-center gap-2 md:gap-3 mt-2 md:mt-3 text-white/80">
        <div className="animate-spin-slow">
            <MusicIcon className="w-3 h-3 md:w-4 md:h-4" />
        </div>
        <div className="text-[10px] md:text-xs overflow-hidden whitespace-nowrap w-40 md:w-64">
           <p className="animate-marquee inline-block">Original Sound - WeSport Official • Trending Sports Music</p>
        </div>
      </div>
    </div>
  );
};

export default PostDescription;