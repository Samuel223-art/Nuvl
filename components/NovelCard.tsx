
import React from 'react';
import { Novel } from '../data/novels';

interface NovelCardProps {
  novel: Novel;
  onClick?: () => void;
}

const NovelCard: React.FC<NovelCardProps> = ({ novel, onClick }) => {
  return (
    <div onClick={onClick} className="transform transition-transform duration-300 hover:scale-105 cursor-pointer group">
      <div className="relative">
        <img
          src={novel.coverUrl}
          alt={`Cover of ${novel.title}`}
          className="w-full h-40 sm:h-48 object-cover rounded-lg shadow-lg group-hover:shadow-2xl group-hover:shadow-primary/30 transition-all duration-300"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-colors duration-300 rounded-lg"></div>
        {novel.progress !== undefined && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-neutral-700/80 rounded-b-lg overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${novel.progress}%` }}></div>
          </div>
        )}
      </div>
      <div className="mt-2 sm:mt-3">
        <h3 className="text-white text-xs sm:text-sm font-bold truncate" title={novel.title}>
          {novel.title}
        </h3>
        {novel.author && (
          <p className="text-neutral-400 text-[10px] sm:text-xs truncate" title={novel.author}>
            {novel.author}
          </p>
        )}
      </div>
    </div>
  );
};

export default NovelCard;
