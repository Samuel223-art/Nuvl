
import React from 'react';

interface CategoryFilterProps {
  genres: string[];
  activeGenre: string;
  onSelectGenre: (genre: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ genres, activeGenre, onSelectGenre }) => {
  return (
    <div className="mb-4">
      <div className="overflow-x-auto no-scrollbar">
        <nav className="flex space-x-2 sm:space-x-3 pb-2">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => onSelectGenre(genre)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-colors duration-300 ease-in-out focus:outline-none ${
                activeGenre === genre
                  ? 'bg-primary text-neutral-900 font-bold'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white'
              }`}
              aria-pressed={activeGenre === genre}
            >
              {genre}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default CategoryFilter;
