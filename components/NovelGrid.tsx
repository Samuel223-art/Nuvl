import React from 'react';
import { Novel } from '../data/novels';
import NovelCard from './NovelCard';

interface NovelGridProps {
  novels: Novel[];
  onNovelClick?: (novel: Novel) => void;
}

const NovelGrid: React.FC<NovelGridProps> = ({ novels, onNovelClick }) => {
  return (
    <div className="grid grid-cols-3 gap-x-4 gap-y-6">
      {novels.map((novel) => (
        <NovelCard key={novel.id} novel={novel} onClick={onNovelClick ? () => onNovelClick(novel) : undefined} />
      ))}
    </div>
  );
};

export default NovelGrid;
