import React from 'react';
import { Novel } from '../data/novels';
import SpotlightCard from './SpotlightCard';

interface SpotlightListProps {
  title: string;
  novels: Novel[];
  onNovelClick?: (novel: Novel) => void;
  onViewAllClick?: () => void;
}

const SpotlightList: React.FC<SpotlightListProps> = ({ title, novels, onNovelClick, onViewAllClick }) => {
  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">
          {title}
        </h2>
        {onViewAllClick && (
          <button onClick={onViewAllClick} aria-label={`View all in ${title}`}>
            <i className="fas fa-chevron-right text-neutral-500"></i>
          </button>
        )}
      </div>
      <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 no-scrollbar">
        {novels.map((novel) => (
          <SpotlightCard key={novel.id} novel={novel} onClick={onNovelClick ? () => onNovelClick(novel) : undefined} />
        ))}
      </div>
    </section>
  );
};

export default SpotlightList;