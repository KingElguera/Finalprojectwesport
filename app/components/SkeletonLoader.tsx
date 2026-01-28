'use client';

import React from 'react';

export const PostSkeleton: React.FC = () => {
  return (
    <div className="w-full h-full bg-gray-900 animate-pulse">
      <div className="w-full h-full bg-gray-800" />
    </div>
  );
};

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="w-full p-6 space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-24 h-24 bg-gray-700 rounded-full animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-6 bg-gray-700 rounded w-32 animate-pulse" />
          <div className="h-4 bg-gray-700 rounded w-48 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export const NotificationSkeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-3 p-4 border-b border-gray-800">
      <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-gray-700 rounded w-1/2 animate-pulse" />
      </div>
    </div>
  );
};

