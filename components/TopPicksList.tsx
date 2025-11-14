
import React from 'react';
import { Novel } from '../data/novels';
import TopPickCard from './TopPickCard';

// Define the recommendation structure here for clarity
interface RecommendedNovel {
  novel: Novel;
  recommendation: {
    type: 'similar' | 'new_episode' | 'trending';
    relatedNovelTitle?: string;
  };
}

interface TopPicksListProps {
  title: string;
  recommendations: RecommendedNovel[];
  onNovelClick?: (novel: Novel) => void;
}

const TopPicksList: React.FC<TopPicksListProps> = ({ title, recommendations, onNovelClick }) => {
  return (
    <section>
      <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
      <div className="grid grid-cols-3 gap-x-4 gap-y-6">
        {recommendations.map(({ novel, recommendation }) => (
          <TopPickCard 
            key={novel.id} 
            novel={novel} 
            recommendation={recommendation} 
            onClick={onNovelClick ? () => onNovelClick(novel) : undefined} 
          />
        ))}
      </div>
    </section>
  );
};

export default TopPicksList;