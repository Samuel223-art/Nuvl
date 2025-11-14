
import React from 'react';

interface SkeletonLineProps {
  className?: string;
}

const SkeletonLine: React.FC<SkeletonLineProps> = ({ className = 'h-4 w-full' }) => {
  return (
    <div className={`bg-neutral-700 rounded animate-pulse ${className}`}></div>
  );
};

export default SkeletonLine;
