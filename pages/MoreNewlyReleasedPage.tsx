import React, { useMemo } from 'react';
import { Novel } from '../data/novels';
import NovelGrid from '../components/NovelGrid';

interface MoreNewlyReleasedPageProps {
  novels: Novel[];
  onNovelClick: (novel: Novel) => void;
  onBack: () => void;
}

const MoreNewlyReleasedPage: React.FC<MoreNewlyReleasedPageProps> = ({ novels, onNovelClick, onBack }) => {
  const newlyReleased = useMemo(() => {
    return [...novels]
      .sort((a, b) => b.id.localeCompare(a.id))
      .slice(0, 20);
  }, [novels]);

  return (
    <div>
      <header className="relative flex items-center justify-center py-4">
        <button onClick={onBack} className="absolute left-0 text-white" aria-label="Go back">
          <i className="fas fa-chevron-left text-2xl"></i>
        </button>
        <h1 className="text-xl font-bold text-white">Newly Released</h1>
      </header>
      <main className="mt-6">
        <NovelGrid novels={newlyReleased} onNovelClick={onNovelClick} />
      </main>
    </div>
  );
};

export default MoreNewlyReleasedPage;
