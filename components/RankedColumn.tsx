
import React from 'react';
import { Novel } from '../data/novels';
import WeeklyHotCard from './WeeklyHotCard';

type RankedNovel = Novel & { rank: number };

interface RankedColumnProps {
  title: string;
  novels: RankedNovel[];
}

const RankedColumn: React.FC<RankedColumnProps> = ({ title, novels }) => {
  return (
    <div className="flex-shrink-0 w-64 sm:w-72 space-y-1">
      <button className="w-full flex justify-between items-center px-2 pb-2 group" aria-label={`View all in ${title}`}>
        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-primary transition-colors">{title}</h3>
        <i className="fas fa-chevron-right text-neutral-600 group-hover:text-primary transition-colors text-sm"></i>
      </button>
      <div>
        {novels.map((novel) => (
          <WeeklyHotCard key={novel.id} novel={novel} />
        ))}
      </div>
    </div>
  );
};

export default RankedColumn;
