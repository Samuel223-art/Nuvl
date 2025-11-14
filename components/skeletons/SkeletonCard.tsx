
import React from 'react';
import SkeletonLine from './SkeletonLine';

const SkeletonCard: React.FC = () => {
  return (
    <div className="w-32 flex-shrink-0">
      <div className="relative">
        <div className="w-full h-48 bg-neutral-700 rounded-lg animate-pulse"></div>
      </div>
      <div className="mt-3 space-y-2">
        <SkeletonLine className="h-4 w-full" />
        <SkeletonLine className="h-3 w-3/4" />
      </div>
    </div>
  );
};

export default SkeletonCard;
