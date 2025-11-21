
import React from 'react';
import { Novel } from '../data/novels';

type RankedNovel = Novel & { rank: number };

interface WeeklyHotCardProps {
  novel: RankedNovel;
  onClick?: () => void;
}

const WeeklyHotCard: React.FC<WeeklyHotCardProps> = ({ novel, onClick }) => {
  const RankIndicator: React.FC<{ rank: number }> = ({ rank }) => {
    if (rank === 1) {
      return (
        <div className="relative w-8 h-8 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="absolute w-full h-full text-primary">
            <polygon points="50,0 93,25 93,75 50,100 7,75 7,25" fill="currentColor" />
          </svg>
          <span className="relative text-black font-bold text-base sm:text-lg">{rank}</span>
        </div>
      );
    }
    return (
      <div className="w-8 h-8 flex items-center justify-center">
        <span className="text-neutral-400 font-bold text-base sm:text-lg">{rank}</span>
      </div>
    );
  };


  return (
    <div onClick={onClick} className="flex items-center space-x-3 sm:space-x-4 py-2 w-full cursor-pointer group">
      <RankIndicator rank={novel.rank} />
      <img
        src={novel.coverUrl}
        alt={`Cover of ${novel.title}`}
        className="w-12 h-12 object-cover rounded-md flex-shrink-0"
      />
      <div className="flex-grow overflow-hidden">
        <h3 className="text-white text-sm sm:text-md font-bold truncate group-hover:text-primary transition-colors duration-200" title={novel.title}>
          {novel.title}
        </h3>
        <p className="text-neutral-400 text-xs sm:text-sm truncate" title={novel.genre}>
          {novel.genre}
        </p>
      </div>
    </div>
  );
};

export default WeeklyHotCard;
