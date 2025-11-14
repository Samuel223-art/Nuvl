
import React from 'react';
import { Novel, Chapter } from '../data/novels';

interface ActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  novel: Novel;
  chapters: Chapter[];
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ isOpen, onClose, novel, chapters, showToast }) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    try {
      const dataToCache = {
        novel,
        chapters,
        timestamp: Date.now(),
      };
      localStorage.setItem(`eTale-novel-${novel.id}`, JSON.stringify(dataToCache));
      showToast(`"${novel.title}" has been downloaded.`);
    } catch (error) {
      console.error("Failed to download novel:", error);
      showToast("Failed to download. Storage might be full.", 'error');
    }
    onClose();
  };

  const handleShare = async () => {
    const shareData = {
      title: novel.title,
      text: `Check out "${novel.title}" on eTale!`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that do not support the Web Share API
        await navigator.clipboard.writeText(shareData.url);
        showToast('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      showToast('Could not share at this moment.', 'error');
    }
    onClose();
  };
  
  const handleRemoveFromTopPicks = () => {
    try {
      const twoWeeks = 14 * 24 * 60 * 60 * 1000;
      const expiry = Date.now() + twoWeeks;
      
      const item = localStorage.getItem('eTaleRemovedPicks');
      const removedPicks = item ? JSON.parse(item) : {};
      
      removedPicks[novel.id] = expiry;
      
      localStorage.setItem('eTaleRemovedPicks', JSON.stringify(removedPicks));
      showToast(`"${novel.title}" won't be recommended for a while.`);
    } catch (error) {
      console.error("Failed to remove from top picks:", error);
      showToast("Could not update your preferences.", 'error');
    }
    onClose();
  };

  const menuItems = [
    { label: 'Download', icon: 'fa-download', action: handleDownload },
    { label: 'Share', icon: 'fa-share-alt', action: handleShare },
    { label: 'Remove from Top Picks for You', icon: 'fa-eye-slash', action: handleRemoveFromTopPicks },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-neutral-800 w-full max-w-lg rounded-t-2xl p-4 transform transition-transform duration-300 ease-in-out"
        style={{ transform: isOpen ? 'translateY(0)' : 'translateY(100%)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-neutral-600 rounded-full mx-auto mb-4"></div>
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <button
                onClick={item.action}
                className="w-full flex items-center text-left p-3 text-white text-lg rounded-lg hover:bg-neutral-700 transition-colors"
              >
                <i className={`fas ${item.icon} w-8 text-center text-neutral-400`}></i>
                <span className="ml-3">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ActionMenu;
