
import React, { useState, useEffect } from 'react';
import { Novel } from '../data/novels';
import NovelGrid from '../components/NovelGrid';

interface User {
  idToken: string;
  localId: string;
  email: string;
}

interface MePageProps {
  currentUser: User | null;
  onNavigate: (page: string) => void;
  library: string[];
  novels: Novel[];
  onNovelClick: (novel: Novel) => void;
}

const getRecentNovels = (allNovels: Novel[]): Novel[] => {
    try {
        const item = localStorage.getItem('eTaleRecentViews');
        if (!item) return [];
        const ids: string[] = JSON.parse(item);
        const novelMap = new Map(allNovels.map(n => [n.id, n]));
        return ids.map(id => novelMap.get(id)).filter((n): n is Novel => !!n);
    } catch (e) {
        console.error("Failed to read recent novels from local storage", e);
        return [];
    }
}

const MePage: React.FC<MePageProps> = ({ currentUser, onNavigate, library, novels, onNovelClick }) => {
  const [activeTab, setActiveTab] = useState('Recent');
  const [downloadedNovels, setDownloadedNovels] = useState<Novel[]>([]);
  
  // Memoize calculations to prevent re-running on every render
  const recentNovels = React.useMemo(() => getRecentNovels(novels), [novels]);
  const newChapterNovels = React.useMemo(() => novels.filter(n => library.includes(n.id) && n.status === 'Ongoing'), [novels, library]);

  useEffect(() => {
    if (currentUser) {
        const downloadedIds: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('eTale-novel-')) {
                downloadedIds.push(key.replace('eTale-novel-', ''));
            }
        }
        const downloaded = novels.filter(novel => downloadedIds.includes(novel.id));
        setDownloadedNovels(downloaded);
    }
  }, [novels, currentUser]);

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center pt-16 text-center px-4">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-neutral-800 flex items-center justify-center mb-6">
          <i className="fas fa-user-circle text-5xl sm:text-6xl text-neutral-600"></i>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Welcome to eTale</h2>
        <p className="text-neutral-400 mb-8 text-sm sm:text-base">Log in or create an account to get started.</p>
        <div className="w-full max-w-xs space-y-3">
          <button
            onClick={() => onNavigate('Login')}
            className="w-full py-2.5 sm:py-3 bg-primary text-black font-bold rounded-lg hover:bg-green-400 transition-colors text-sm sm:text-base"
          >
            Log In
          </button>
          <button
            onClick={() => onNavigate('Register')}
            className="w-full py-2.5 sm:py-3 bg-neutral-800 text-white font-bold rounded-lg hover:bg-neutral-700 transition-colors text-sm sm:text-base"
          >
            Register
          </button>
        </div>
      </div>
    );
  }
  
  const tabs = ['Recent', 'New Chapter', 'Downloads'];

  const renderTabContent = () => {
    let content: Novel[];
    let emptyMessage: { icon: string, title: string, text: string };

    switch (activeTab) {
      case 'Recent':
        content = recentNovels;
        emptyMessage = {
          icon: 'fa-history',
          title: 'No Recent Stories',
          text: 'Stories you view will appear here.'
        };
        break;
      case 'New Chapter':
        content = newChapterNovels;
        emptyMessage = {
          icon: 'fa-star',
          title: 'No New Chapters',
          text: "When stories in your library update, you'll see them here."
        };
        break;
      case 'Downloads':
        content = downloadedNovels;
        emptyMessage = {
          icon: 'fa-download',
          title: 'No Downloads',
          text: 'Download stories to read them offline.'
        };
        break;
      default:
        content = [];
        emptyMessage = { icon: 'fa-question-circle', title: 'Nothing here', text: '' };
    }

    if (content.length > 0) {
      return <NovelGrid novels={content} onNovelClick={onNovelClick} />;
    }

    return (
      <div className="text-center py-20 px-6 bg-neutral-800/50 rounded-lg mt-8">
        <i className={`fas ${emptyMessage.icon} text-4xl sm:text-5xl text-neutral-600 mb-6`}></i>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{emptyMessage.title}</h2>
        <p className="text-neutral-400 text-sm sm:text-base max-w-sm mx-auto">{emptyMessage.text}</p>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center pt-2">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white">My novels</h1>
            <button onClick={() => onNavigate('Settings')} className="text-neutral-400 hover:text-white transition-colors h-10 w-10 flex items-center justify-center" aria-label="Settings">
                <i className="fas fa-cog text-xl sm:text-2xl"></i>
            </button>
        </div>

        <div className="border-b border-neutral-700">
            <nav className="flex space-x-6 sm:space-x-8" aria-label="Tabs">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`relative whitespace-nowrap pb-3 px-1 text-sm sm:text-base transition-colors duration-200 focus:outline-none ${
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
            {renderTabContent()}
        </div>
    </div>
  );
};

export default MePage;
