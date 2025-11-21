
import React from 'react';
import { Novel } from '../data/novels';
import NovelList from '../components/NovelList';
import RankingsDisplay, { RankedNovel } from '../components/RankingsDisplay';

interface FeaturedPageProps {
  novels: Novel[];
  onNovelClick: (novel: Novel) => void;
}

const FeaturedPage: React.FC<FeaturedPageProps> = ({ novels, onNovelClick }) => {
  const editorsPicks = novels.slice(0, 5);
  const continueReading = novels.filter(n => n.progress && n.progress > 0).slice(0, 5);
  const mustReadSuperheroes = novels.filter(n => n.genre?.toLowerCase().includes('superhero')).slice(0, 6);

  const fantasyNovels = novels
    .filter(n => n.genre?.toLowerCase().includes('fantasy') || n.tag?.toLowerCase().includes('fantasy'))
    .slice(0, 9);
    
  const romanceNovels = novels
    .filter(n => n.genre?.toLowerCase().includes('romance') || n.tag?.toLowerCase().includes('romance'))
    .slice(0, 9);

  const calculateWeeklyViews = (novel: Novel): number => {
    // This is a simulation of weekly views based on novel properties for deterministic results.
    // A higher ID (newer novel) will generally result in higher "weekly" views.
    const idPart = parseInt(novel.id.slice(-7)) || 0; // Use last 7 digits for more variance
    const genreFactor = (novel.genre?.length || 5) * 150;
    const authorFactor = (novel.author?.length || 10) * 100;
    return (idPart + genreFactor + authorFactor) % 80000 + 1000; // Add a base to avoid zero views and cap it
  };

  // Create dynamic rankings from live data
  const weeklyHot: RankedNovel[] = [...novels]
    .sort((a, b) => calculateWeeklyViews(b) - calculateWeeklyViews(a))
    .slice(0, 10)
    .map((novel, index) => ({
      ...novel,
      rank: index + 1,
    }));
    
  const likesRankings: RankedNovel[] = [...novels].reverse().slice(0, 10).map((novel, index) => ({
    ...novel,
    rank: index + 1,
  }));


  return (
    <div className="space-y-8 sm:space-y-12">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white pt-2">Featured</h1>

      <NovelList title="Editor's Pick" novels={editorsPicks} onNovelClick={onNovelClick} />
      
      {continueReading.length > 0 && (
        <NovelList title="Continue Reading" novels={continueReading} onNovelClick={onNovelClick} />
      )}
      
      {weeklyHot.length > 0 && likesRankings.length > 0 && (
        <RankingsDisplay 
          lists={[
              { title: 'Weekly HOT', novels: weeklyHot },
              { title: 'Likes Ranking', novels: likesRankings }
          ]} 
          onNovelClick={onNovelClick}
        />
      )}

      {fantasyNovels.length > 0 && (
        <NovelList title="Fantasy Worlds" novels={fantasyNovels} onNovelClick={onNovelClick} />
      )}

      {romanceNovels.length > 0 && (
        <NovelList title="Heart-fluttering Romance" novels={romanceNovels} onNovelClick={onNovelClick} />
      )}

      {mustReadSuperheroes.length > 0 && (
        <NovelList title="Must-Read Superheroes" novels={mustReadSuperheroes} onNovelClick={onNovelClick} />
      )}
    </div>
  );
};

export default FeaturedPage;
