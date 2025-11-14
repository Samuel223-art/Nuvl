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
        <nav className="flex space-x-3 pb-2">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => onSelectGenre(genre)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ease-in-out focus:outline-none ${
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
