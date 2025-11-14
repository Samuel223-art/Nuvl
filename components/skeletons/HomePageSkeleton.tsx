
import React from 'react';
import SkeletonCard from './SkeletonCard';
import SkeletonLine from './SkeletonLine';

const SkeletonSpotlightCard: React.FC = () => (
    <div className="flex-shrink-0 w-80 h-40 bg-neutral-800 rounded-lg overflow-hidden flex animate-pulse">
        <div className="w-1/3 h-full bg-neutral-700"></div>
        <div className="w-2/3 p-4 flex flex-col justify-center space-y-2">
            <SkeletonLine className="h-5 w-3/4" />
            <SkeletonLine className="h-3 w-1/2" />
            <SkeletonLine className="h-3 w-full" />
            <SkeletonLine className="h-3 w-full" />
            <SkeletonLine className="h-3 w-5/6" />
        </div>
    </div>
);

const HomePageSkeleton: React.FC = () => {
  return (
    <div className="space-y-12 animate-pulse">
      {/* Top Picks Skeleton */}
      <section>
        <SkeletonLine className="h-6 w-1/2 mb-4" />
        <div className="grid grid-cols-3 gap-x-4 gap-y-6">
          {[...Array(6)].map((_, i) => (
             <div key={i}>
                <div className="relative rounded-lg overflow-hidden aspect-[2/3] bg-neutral-700"></div>
                <div className="mt-1.5 h-8">
                    <SkeletonLine className="h-4 w-4/5" />
                </div>
            </div>
          ))}
        </div>
      </section>

      {/* Spotlight Skeleton */}
      <section>
        <SkeletonLine className="h-6 w-1/3 mb-4" />
        <div className="flex space-x-4 overflow-x-hidden pb-4 -mx-4 px-4">
           {[...Array(3)].map((_, i) => <SkeletonSpotlightCard key={i} />)}
        </div>
      </section>

      {/* Banner Skeleton */}
      <section>
        <div className="bg-neutral-800 rounded-lg p-6 h-40"></div>
      </section>
      
      {/* Newly Released Skeleton */}
      <section>
        <SkeletonLine className="h-6 w-1/3 mb-4" />
        <div className="flex space-x-4 overflow-x-hidden pb-4 -mx-4 px-4">
           {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </section>
    </div>
  );
};

export default HomePageSkeleton;
