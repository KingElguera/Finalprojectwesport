'use client';

import React, { useState } from 'react';

interface StarRatingProps {
  rating: number; // Note actuelle (0-5)
  onRatingChange?: (rating: number) => void; // Callback quand l'utilisateur change la note
  readonly?: boolean; // Si true, l'utilisateur ne peut pas modifier la note
  size?: 'sm' | 'md' | 'lg'; // Taille des étoiles
  showValue?: boolean; // Afficher la valeur numérique à côté
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  readonly = false,
  size = 'md',
  showValue = false,
}) => {
  const [hoverRating, setHoverRating] = useState<number>(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const gapClasses = {
    sm: 'gap-0.5',
    md: 'gap-1',
    lg: 'gap-1.5',
  };

  const handleClick = (starIndex: number) => {
    if (!readonly && onRatingChange) {
      // Si l'utilisateur clique sur la même note, on la supprime (met à 0)
      if (starIndex === rating) {
        onRatingChange(0);
      } else {
        onRatingChange(starIndex);
      }
    }
  };

  const handleMouseEnter = (starIndex: number) => {
    if (!readonly) {
      setHoverRating(starIndex);
    }
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const displayRating = hoverRating || rating;

  return (
    <div className={`flex items-center ${gapClasses[size]}`}>
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const isFilled = starIndex <= displayRating;
        const isHovered = hoverRating > 0 && starIndex <= hoverRating;

        return (
          <button
            key={starIndex}
            type="button"
            onClick={() => handleClick(starIndex)}
            onMouseEnter={() => handleMouseEnter(starIndex)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={`
              ${readonly ? 'cursor-default' : 'cursor-pointer'}
              transition-all duration-150
              ${!readonly && 'hover:scale-110 active:scale-95'}
              focus:outline-none
            `}
            aria-label={`${starIndex} étoile${starIndex > 1 ? 's' : ''}`}
          >
            <svg
              className={`${sizeClasses[size]} transition-colors duration-150`}
              viewBox="0 0 24 24"
              fill={isFilled ? (isHovered ? '#fbbf24' : '#f59e0b') : 'none'}
              stroke={isFilled ? (isHovered ? '#fbbf24' : '#f59e0b') : '#6b7280'}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        );
      })}
      
      {showValue && rating > 0 && (
        <span className="ml-2 text-amber-400 font-semibold text-sm">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;

