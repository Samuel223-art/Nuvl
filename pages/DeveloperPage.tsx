

import React, { useState } from 'react';
import NovelsView from '../components/developer/NovelsView';
import DeveloperMenu from '../components/developer/DeveloperMenu';
import { Novel } from '../data/novels';
import InboxView from '../components/developer/InboxView';
import NoticeView from '../components/developer/NoticeView';


interface User {
  idToken: string;
  localId: string;
  email: string;
}

interface DeveloperPageProps {
  currentUser: User | null;
  onNavigateBack: () => void;
  novels: Novel[];
  onSaveNovel: (novel: Novel) => void;
  onDeleteNovel: (id: string) => void;
  settings: { showLikeCounts: boolean };
  onUpdateSettings: (newSettings: { showLikeCounts: boolean }) => void;
}

const DeveloperPage: React.FC<DeveloperPageProps> = ({ currentUser, onNavigateBack, novels, onSaveNovel, onDeleteNovel, settings, onUpdateSettings }) => {
  const [activeView, setActiveView] = useState('Novels');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activeView) {
      case 'Novels':
        return <NovelsView 
                  currentUser={currentUser}
                  novels={novels}
                  onSaveNovel={onSaveNovel}
                  onDeleteNovel={onDeleteNovel}
                />;
      case 'Inbox':
        return <InboxView currentUser={currentUser} />;
      case 'Overview':
        return <div className="text-white"><h1 className="text-3xl font-bold">Overview</h1><p className="mt-4 text-neutral-400">App-wide statistics and summaries will be shown here. Coming soon!</p></div>;
      case 'Push':
        return <div className="text-white"><h1 className="text-3xl font-bold">Push Notifications</h1><p className="mt-4 text-neutral-400">Manage and send push notifications to your users. Coming soon!</p></div>;
      case 'Purchases':
        return <div className="text-white"><h1 className="text-3xl font-bold">Purchases</h1><p className="mt-4 text-neutral-400">View and manage user transactions. Coming soon!</p></div>;
       case 'Premium':
        return <div className="text-white"><h1 className="text-3xl font-bold">Premium Subscriptions</h1><p className="mt-4 text-neutral-400">Manage subscription plans and view subscriber data. Coming soon!</p></div>;
      case 'Notice':
        return <NoticeView currentUser={currentUser} />;
       case 'Settings':
        return (
            <div className="text-white">
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="mt-4 text-neutral-400 mb-6">Configure global app settings.</p>
                <div className="bg-neutral-800 p-6 rounded-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-semibold">Show Like Counts</h2>
                            <p className="text-sm text-neutral-400">Display the total like count on novel detail pages for all users.</p>
                        </div>
                        <label htmlFor="like-toggle" className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    id="like-toggle" 
                                    className="sr-only" 
                                    checked={settings.showLikeCounts}
                                    onChange={() => onUpdateSettings({ showLikeCounts: !settings.showLikeCounts })}
                                />
                                <div className={`block w-14 h-8 rounded-full ${settings.showLikeCounts ? 'bg-primary' : 'bg-neutral-600'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.showLikeCounts ? 'transform translate-x-6' : ''}`}></div>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        );
      default:
        return <NovelsView 
                  currentUser={currentUser}
                  novels={novels}
                  onSaveNovel={onSaveNovel}
                  onDeleteNovel={onDeleteNovel}
                />;
    }
  };

  const handleSelectView = (view: string) => {
    setActiveView(view);
    setIsMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-neutral-900">
      <header className="bg-neutral-800/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center justify-between p-4 border-b border-neutral-700">
              <button onClick={onNavigateBack} className="text-white p-2 -ml-2" aria-label="Go back to Me page">
                <i className="fas fa-arrow-left text-xl"></i>
              </button>
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              <button onClick={() => setIsMenuOpen(true)} className="text-white p-2 -mr-2" aria-label="Open menu">
                <i className="fas fa-bars text-xl"></i>
              </button>
          </div>
      </header>
      
      <main className="p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>

      <DeveloperMenu 
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeView={activeView}
        onSelectView={handleSelectView}
      />
    </div>
  );
};

export default DeveloperPage;