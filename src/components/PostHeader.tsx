'use client';

import React from 'react';
import { SportType } from '@/lib/types';

interface PostHeaderProps {
  username: string;
  avatarUrl: string;
  sport: SportType;
}

const getSportColor = (sport: SportType): string => {
  switch (sport) {
    case 'football': return 'bg-green-600';
    case 'basketball': return 'bg-orange-600';
    case 'fitness': return 'bg-purple-600';
    case 'running': return 'bg-blue-500';
    case 'tennis': return 'bg-yellow-500';
    case 'extreme': return 'bg-red-600';
    default: return 'bg-gray-600';
  }
};

const PostHeader: React.FC<PostHeaderProps> = ({ username, avatarUrl, sport }) => {
  return (
    <div className="absolute top-0 left-0 right-0 p-4 md:p-6 pt-8 md:pt-12 flex justify-between items-start z-20 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
      {/* Profile Bubble */}
      <div className="flex items-center gap-2 md:gap-3 bg-black/30 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-full pointer-events-auto cursor-pointer transition-transform active:scale-95">
        <img
          src={avatarUrl}
          alt={username}
          className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/50 object-cover"
        />
        <span className="text-white text-sm md:text-base font-semibold shadow-black drop-shadow-md">
          @{username}
        </span>
      </div>

      {/* Sport Badge */}
      <div className={`px-3 md:px-4 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-bold text-white uppercase tracking-wider shadow-sm pointer-events-auto ${getSportColor(sport)}`}>
        {sport}
      </div>
    </div>
  );
};

export default PostHeader;

