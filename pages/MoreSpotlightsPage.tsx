import React, { useMemo } from 'react';
import { Novel } from '../data/novels';
import NovelGrid from '../components/NovelGrid';

interface MoreSpotlightsPageProps {
  novels: Novel[];
  onNovelClick: (novel: Novel) => void;
  onBack: () => void;
}

const MoreSpotlightsPage: React.FC<MoreSpotlightsPageProps> = ({ novels, onNovelClick, onBack }) => {
  const spotlightNovels = useMemo(() => {
    const calculateViews = (novel: Novel): number => {
      return (parseInt(novel.id.replace(/\D/g, '').slice(0, 5), 10) * 123) % 1000000;
    };

    return [...novels]
      .filter(n => n.description && n.description.length > 50)
      .sort((a, b) => calculateViews(b) - calculateViews(a))
      .slice(0, 20);
  }, [novels]);

  return (
    <div>
      <header className="relative flex items-center justify-center py-4">
        <button onClick={onBack} className="absolute left-0 text-white" aria-label="Go back">
          <i className="fas fa-chevron-left text-2xl"></i>
        </button>
        <h1 className="text-xl font-bold text-white">Spotlight</h1>
      </header>
      <main className="mt-6">
        <NovelGrid novels={spotlightNovels} onNovelClick={onNovelClick} />
      </main>
    </div>
  );
};

export default MoreSpotlightsPage;
