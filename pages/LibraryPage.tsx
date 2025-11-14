

import React, { useState } from 'react';
import { Novel } from '../data/novels';
import NovelGrid from '../components/NovelGrid';

interface LibraryPageProps {
  novels: Novel[];
  onNovelClick: (novel: Novel) => void;
  library: string[];
  likedNovels: string[];
}

const LibraryPage: React.FC<LibraryPageProps> = ({ novels, onNovelClick, library, likedNovels }) => {
  const [activeTab, setActiveTab] = useState('Current reads');
  const libraryNovels = novels.filter(novel => library.includes(novel.id));
  const likedNovelsList = novels.filter(novel => likedNovels.includes(novel.id));
  const tabs = ['Current reads', 'Likes'];

  const renderContent = () => {
    switch (activeTab) {
      case 'Current reads':
        return libraryNovels.length > 0 ? (
          <NovelGrid novels={libraryNovels} onNovelClick={onNovelClick} />
        ) : (
          <div className="text-center py-20 px-6 bg-neutral-800/50 rounded-lg mt-8">
            <i className="fas fa-book-reader text-5xl text-neutral-600 mb-6"></i>
            <h2 className="text-2xl font-bold text-white mb-2">Your Library is Empty</h2>
            <p className="text-neutral-400 max-w-sm mx-auto">Find a story you like and tap the 'Add to Library' button to see it here.</p>
          </div>
        );
      case 'Likes':
        return likedNovelsList.length > 0 ? (
          <NovelGrid novels={likedNovelsList} onNovelClick={onNovelClick} />
        ) : (
          <div className="text-center py-20 px-6 bg-neutral-800/50 rounded-lg mt-8">
            <i className="fas fa-heart-crack text-5xl text-neutral-600 mb-6"></i>
            <h2 className="text-2xl font-bold text-white mb-2">No Liked Stories Yet</h2>
            <p className="text-neutral-400 max-w-sm mx-auto">Tap the heart on a story's page to add it to your liked list.</p>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pt-2">
        <h1 className="text-4xl sm:text-5xl font-bold text-white">Library</h1>
        <button className="flex items-center space-x-2 text-neutral-400 hover:text-white transition-colors">
            <i className="fas fa-lock"></i>
            <span className="text-sm font-medium">Private</span>
        </button>
      </div>

      <div className="border-b border-neutral-700">
          <nav className="flex space-x-8" aria-label="Tabs">
              {tabs.map(tab => (
                  <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`relative whitespace-nowrap pb-3 px-1 text-base transition-colors duration-200 focus:outline-none ${
                          activeTab === tab
                              ? 'text-white font-bold'
                              : 'text-neutral-500 hover:text-neutral-300 font-medium'
                      }`}
                      aria-current={activeTab === tab ? 'page' : undefined}
                  >
                      {tab}
                      {activeTab === tab && (
                          <span className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full"></span>
                      )}
                  </button>
              ))}
          </nav>
      </div>

      <div>
        {renderContent()}
      </div>
    </div>
  );
};

export default LibraryPage;