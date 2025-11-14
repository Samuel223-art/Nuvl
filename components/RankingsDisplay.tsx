
import React, { useState, useEffect, useRef } from 'react';
import { Novel } from '../data/novels';
import WeeklyHotCard from './WeeklyHotCard';

export type RankedNovel = Novel & { rank: number };

export interface RankedList {
  title: string;
  novels: RankedNovel[];
}

interface RankingsDisplayProps {
  lists: RankedList[];
  onNovelClick?: (novel: Novel) => void;
}

const RankingsDisplay: React.FC<RankingsDisplayProps> = ({ lists, onNovelClick }) => {
  const [currentTitle, setCurrentTitle] = useState(lists[0]?.title || '');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionStartRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    const root = scrollContainerRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const title = entry.target.getAttribute('data-title');
            if (title) {
              setCurrentTitle(title);
            }
          }
        });
      },
      {
        root: root,
        threshold: 0.5,
      }
    );

    const refsToObserve = Array.from(sectionStartRefs.current.values());
    // FIX: Add type guard to ensure 'ref' is an Element before observing.
    // This resolves a TypeScript error where 'ref' is inferred as 'unknown'.
    refsToObserve.forEach(ref => ref instanceof Element && observer.observe(ref));

    return () => {
      // FIX: Add type guard to ensure 'ref' is an Element before unobserving.
      // This resolves a TypeScript error where 'ref' is inferred as 'unknown'.
      refsToObserve.forEach(ref => ref instanceof Element && observer.unobserve(ref));
    };
  }, [lists]);

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">
          {currentTitle}
        </h2>
        <button aria-label={`View all in ${currentTitle}`}>
            <i className="fas fa-chevron-right text-neutral-500"></i>
        </button>
      </div>

      <div 
        ref={scrollContainerRef}
        className="flex space-x-6 overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 no-scrollbar"
      >
        {lists.map((list, listIndex) => {
          const firstHalf = list.novels.slice(0, 5);
          const secondHalf = list.novels.slice(5, 10);

          return (
            <React.Fragment key={list.title}>
              {/* Column 1 (ranks 1-5) */}
              <div
                ref={el => {
                  if (el) sectionStartRefs.current.set(listIndex, el);
                  else sectionStartRefs.current.delete(listIndex);
                }}
                data-title={list.title}
                className="flex-shrink-0 w-72 space-y-1"
              >
                {firstHalf.map((novel) => (
                  <WeeklyHotCard key={novel.id} novel={novel} onClick={onNovelClick ? () => onNovelClick(novel) : undefined} />
                ))}
              </div>
              {/* Column 2 (ranks 6-10) */}
              {secondHalf.length > 0 && (
                <div className="flex-shrink-0 w-72 space-y-1">
                  {secondHalf.map((novel) => (
                    <WeeklyHotCard key={novel.id} novel={novel} onClick={onNovelClick ? () => onNovelClick(novel) : undefined} />
                  ))}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
};

export default RankingsDisplay;
