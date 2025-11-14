
import React, { useState, useEffect } from 'react';
import { Novel } from '../data/novels';

interface TopPickCardProps {
  novel: Novel;
  onClick?: () => void;
  recommendation?: {
    type: 'similar' | 'new_episode' | 'trending';
    relatedNovelTitle?: string;
  };
}

const TopPickCard: React.FC<TopPickCardProps> = ({ novel, onClick, recommendation }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = novel.imageUrls && novel.imageUrls.length > 0 ? novel.imageUrls : [novel.coverUrl];

  useEffect(() => {
    if (images.length <= 1) return;

    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); 

    return () => clearInterval(intervalId);
  }, [images.length]);

  const renderRecommendationText = () => {
    // Fallback to original display if no recommendation object is passed
    if (!recommendation) {
      return (
        <>
         <h3 className="text-white text-sm font-bold truncate leading-snug" title={novel.title}>
          {novel.title}
        </h3>
        {novel.subtitle && (
          <p className="text-xs text-primary truncate">{novel.subtitle}</p>
        )}
        </>
      );
    }

    switch (recommendation.type) {
      case 'similar':
        return (
          <p className="text-sm text-neutral-400">
            More like <span className="text-primary font-bold">{recommendation.relatedNovelTitle}</span>
          </p>
        );
      case 'new_episode':
      case 'trending':
        return (
          <p className="text-sm text-neutral-400 capitalize">{novel.genre || 'New Story'}</p>
        );
      default:
        // Render original content as a safe fallback
        return (
          <h3 className="text-white text-sm font-bold truncate leading-snug" title={novel.title}>
            {novel.title}
          </h3>
        );
    }
  };


  return (
    <div onClick={onClick} className="cursor-pointer group">
      <div className="relative rounded-lg overflow-hidden aspect-[2/3]">
        {recommendation?.type === 'new_episode' && (
          <div className="absolute top-2 left-2 z-20">
            <span className="bg-primary text-black font-bold text-xs px-2.5 py-1 rounded-md">
              New Episode
            </span>
          </div>
        )}
        {images.map((src, index) => (
            <img
              key={src}
              src={src}
              alt={`Cover of ${novel.title}`}
              className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            />
        ))}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-colors duration-300 rounded-lg z-10"></div>
      </div>
      <div className="mt-1.5 h-8 flex items-center"> {/* Fixed height to prevent layout shift */}
         {renderRecommendationText()}
      </div>
    </div>
  );
};

export default TopPickCard;