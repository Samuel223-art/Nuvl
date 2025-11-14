

import React, { useState, useMemo } from 'react';
import NovelList from '../components/NovelList';
import { Novel } from '../data/novels';
import TopPicksList from '../components/TopPicksList';
import CategoryFilter from '../components/CategoryFilter';
import SpotlightList from '../components/SpotlightList';

interface HomePageProps {
  novels: Novel[];
  onNovelClick: (novel: Novel) => void;
  onPageChange: (page: string) => void;
}

const getRemovedPicks = (): { [id: string]: number } => {
  try {
    const item = localStorage.getItem('eTaleRemovedPicks');
    if (item) {
      const parsed = JSON.parse(item);
      // Clear expired entries
      const now = Date.now();
      const validPicks: { [id: string]: number } = {};
      Object.entries(parsed).forEach(([id, expiry]) => {
        if (typeof expiry === 'number' && expiry > now) {
          validPicks[id] = expiry;
        }
      });
      if (Object.keys(validPicks).length !== Object.keys(parsed).length) {
        localStorage.setItem('eTaleRemovedPicks', JSON.stringify(validPicks));
      }
      return validPicks;
    }
  } catch (e) {
    console.error("Failed to read removed picks from local storage", e);
  }
  return {};
};


const HomePage: React.FC<HomePageProps> = ({ novels, onNovelClick, onPageChange }) => {
  const removedPicks = useMemo(() => getRemovedPicks(), []);
  
  const recommendations = useMemo(() => {
    const availableNovels = novels.filter(n => !removedPicks[n.id]);
    if (availableNovels.length < 6) return [];

    type RecommendedNovel = { novel: Novel; recommendation: { type: 'similar' | 'new_episode' | 'trending'; relatedNovelTitle?: string; } };
    const result: RecommendedNovel[] = [];
    
    // Simulate: Find a novel for "New Episode" (e.g., a popular one)
    const newEpisodeNovel = availableNovels.find(n => n.title.includes("Estate Developer"));
    if (newEpisodeNovel) {
      result.push({ novel: newEpisodeNovel, recommendation: { type: 'new_episode' } });
    }

    // Simulate: Find a novel for "Similar To"
    const similarNovel = availableNovels.find(n => n.title.includes("Study Group"));
    const likedNovelTitle = "Random Chat";
    if (similarNovel) {
      result.push({ novel: similarNovel, recommendation: { type: 'similar', relatedNovelTitle: likedNovelTitle } });
    }
    
    // Fill the rest with "Trending" novels
    const existingIds = new Set(result.map(r => r.novel.id));
    const trending = availableNovels.filter(n => !existingIds.has(n.id));
    
    const needed = Math.max(0, 6 - result.length);
    for(let i = 0; i < needed && i < trending.length; i++) {
        result.push({ novel: trending[i], recommendation: { type: 'trending' } });
    }
    
    // In case we couldn't find specific novels, fill up to 6 with trending
    const finalNeeded = Math.max(0, 6 - result.length);
    if (finalNeeded > 0) {
        const moreTrending = availableNovels.filter(n => !new Set(result.map(r => r.novel.id)).has(n.id));
        result.push(...moreTrending.slice(0, finalNeeded).map(n => ({ novel: n, recommendation: { type: 'trending' as const } })));
    }

    return result.sort(() => 0.5 - Math.random()); // Shuffle for dynamic feel
  }, [novels, removedPicks]);

  const spotlightNovels = useMemo(() => {
    const calculateViews = (novel: Novel): number => {
      // Consistent with NovelDetailPage's initial view calculation for deterministic sorting
      return (parseInt(novel.id.replace(/\D/g, '').slice(0, 5), 10) * 123) % 1000000;
    };

    return [...novels]
      .filter(n => n.description && n.description.length > 50)
      .sort((a, b) => calculateViews(b) - calculateViews(a))
      .slice(0, 5);
  }, [novels]);

  const newlyReleased = useMemo(() => {
    // New novels have a higher ID (timestamp-based), so sort descending by ID.
    const topPicksIds = new Set(recommendations.map(r => r.novel.id));
    return [...novels]
      .filter(n => !topPicksIds.has(n.id))
      .sort((a, b) => b.id.localeCompare(a.id))
      .slice(0, 8);
  }, [novels, recommendations]);

  const [activeGenre, setActiveGenre] = useState('All');

  const genres = ['All', ...Array.from(new Set(novels.map(n => n.genre).filter((g): g is string => !!g)))];

  const superheroNovels = useMemo(() => {
    return novels.filter(n => n.genre?.toLowerCase().includes('superhero')).slice(0, 6);
  }, [novels]);

  const filteredByGenre = useMemo(() => {
    if (activeGenre === 'All') {
      // When 'All' is selected, display all available novels.
      return novels;
    }
    // For a specific genre, show all novels matching that genre.
    return novels.filter(novel => novel.genre === activeGenre);
  }, [activeGenre, novels]);
  

  return (
    <div className="space-y-12">
        <TopPicksList title="Top Picks for You" recommendations={recommendations} onNovelClick={onNovelClick} />
        <SpotlightList title="Spotlight" novels={spotlightNovels} onNovelClick={onNovelClick} onViewAllClick={() => onPageChange('MoreSpotlights')} />
        <NovelList title="Newly Released Series" novels={newlyReleased} onNovelClick={onNovelClick} onViewAllClick={() => onPageChange('MoreNewlyReleased')} />
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">
              Browse by Genre
            </h2>
          </div>
          <CategoryFilter genres={genres} activeGenre={activeGenre} onSelectGenre={setActiveGenre} />
          <NovelList novels={filteredByGenre} onNovelClick={onNovelClick} />
        </section>
        {superheroNovels.length > 0 && (
          <NovelList title="Superhero Spectacular" novels={superheroNovels} onNovelClick={onNovelClick} />
        )}
    </div>
  );
};

export default HomePage;