
import React, { useMemo } from 'react';
import { Novel } from '../data/novels';

interface SpotlightCardProps {
  novel: Novel;
  onClick?: () => void;
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({ novel, onClick }) => {
  const plainDescription = useMemo(() => {
    if (typeof document === 'undefined' || !novel.description) return '';
    const div = document.createElement('div');
    div.innerHTML = novel.description;
    return div.textContent || div.innerText || '';
  }, [novel.description]);
  
  return (
    <div onClick={onClick} className="flex-shrink-0 w-80 h-40 bg-neutral-800 rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 cursor-pointer group flex">
      <div className="w-1/3 h-full">
        <img
          src={novel.coverUrl}
          alt={`Cover of ${novel.title}`}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="w-2/3 p-4 flex flex-col justify-center">
        <h3 className="text-white text-md font-bold truncate leading-tight" title={novel.title}>
          {novel.title}
        </h3>
        {novel.subtitle && (
            <p className="text-primary text-xs font-semibold mt-1 truncate">{novel.subtitle}</p>
        )}
        {novel.description && (
          <p className="text-neutral-400 text-xs mt-2 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
            {plainDescription}
          </p>
        )}
      </div>
    </div>
  );
};

export default SpotlightCard;
