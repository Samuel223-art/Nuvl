
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

const getRecentViews = (): string[] => {
  try {
    const item = localStorage.getItem('eTaleRecentViews');
    return item ? JSON.parse(item) : [];
  } catch (e) {
    console.error("Failed to read recent views from local storage", e);
    return [];
  }
};


const HomePage: React.FC<HomePageProps> = ({ novels, onNovelClick, onPageChange }) => {
  const removedPicks = useMemo(() => getRemovedPicks(), []);
  
  const recommendations = useMemo(() => {
    const recentViewIds = getRecentViews();
    const availableNovels = novels.filter(n => !removedPicks[n.id]);
    
    // If available novels are too few, return empty or what we have
    if (availableNovels.length === 0) return [];

    // Requirement: Display Randomly until the user start reading
    if (recentViewIds.length === 0) {
        // Perform a Fisher-Yates shuffle for true randomness
        const shuffled = [...availableNovels];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        return shuffled.slice(0, 6).map(novel => ({
            novel,
            recommendation: { type: 'trending' as const }
        }));
    }

    // User has history: generate personalized recommendations
    type RecommendedNovel = { novel: Novel; recommendation: { type: 'similar' | 'new_episode' | 'trending'; relatedNovelTitle?: string; } };
    const result: RecommendedNovel[] = [];
    const existingIds = new Set<string>();

    // Helper to get random from array
    const getRandom = (arr: Novel[]): Novel => arr[Math.floor(Math.random() * arr.length)];

    // 1. Based on recently viewed genres
    const recentNovels = recentViewIds
        .map(id => novels.find(n => n.id === id))
        .filter((n): n is Novel => !!n);

    // Take up to 3 recent novels to generate 'similar' recommendations
    for (const recent of recentNovels.slice(0, 3)) {
        if (!recent.genre) continue;
        const candidates = availableNovels.filter(n => 
            n.genre === recent.genre && 
            n.id !== recent.id && 
            !recentViewIds.includes(n.id) && 
            !existingIds.has(n.id)
        );
        
        if (candidates.length > 0) {
            const similar = getRandom(candidates);
            result.push({
                novel: similar,
                recommendation: { type: 'similar', relatedNovelTitle: recent.title }
            });
            existingIds.add(similar.id);
        }
    }

    // 2. Add a 'New Episode' for an ongoing novel (random one for now)
    const ongoingCandidates = availableNovels.filter(n => 
        n.status === 'Ongoing' && 
        !existingIds.has(n.id) &&
        !recentViewIds.includes(n.id)
    );
    if (ongoingCandidates.length > 0) {
        const ongoing = getRandom(ongoingCandidates);
        result.push({
             novel: ongoing,
             recommendation: { type: 'new_episode' }
        });
        existingIds.add(ongoing.id);
    }

    // 3. Fill remaining slots with random trending novels
    const remainingSlots = 6 - result.length;
    if (remainingSlots > 0) {
        const trendingCandidates = availableNovels.filter(n => 
            !existingIds.has(n.id) && 
            !recentViewIds.includes(n.id)
        );
        // If we ran out of candidates (e.g. small library), try using any available except existing in result
        const finalPool = trendingCandidates.length > 0 ? trendingCandidates : availableNovels.filter(n => !existingIds.has(n.id));

        const shuffledTrending = [...finalPool].sort(() => 0.5 - Math.random());
        
        shuffledTrending.slice(0, remainingSlots).forEach(novel => {
             result.push({
                novel,
                recommendation: { type: 'trending' }
            });
        });
    }
    
    return result.sort(() => 0.5 - Math.random());
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
    <div className="space-y-8 sm:space-y-12">
        <TopPicksList title="Top Picks for You" recommendations={recommendations} onNovelClick={onNovelClick} />
        <SpotlightList title="Spotlight" novels={spotlightNovels} onNovelClick={onNovelClick} onViewAllClick={() => onPageChange('MoreSpotlights')} />
        <NovelList title="Newly Released Series" novels={newlyReleased} onNovelClick={onNovelClick} onViewAllClick={() => onPageChange('MoreNewlyReleased')} />
        <section>
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-white">
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
