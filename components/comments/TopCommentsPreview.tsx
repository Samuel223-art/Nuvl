
import React from 'react';
import { Comment } from '../../data/novels';

interface TopCommentsPreviewProps {
  comments: Comment[];
  onViewAll: () => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const TopCommentsPreview: React.FC<TopCommentsPreviewProps> = ({ comments, onViewAll, showToast }) => {
  const formatCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    }
    return count.toString();
  };

  const handleInteraction = (e: React.MouseEvent) => {
    e.stopPropagation();
    showToast("Open the full comments page to interact", "error");
  };

  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-8" onClick={onViewAll}>
        <p className="text-neutral-500">Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="text-white">
      <button onClick={onViewAll} className="w-full flex justify-between items-center group mb-2">
        <h2 className="text-xl font-bold">Top Comments</h2>
        <i className="fas fa-chevron-right text-neutral-500 group-hover:text-primary transition-colors"></i>
      </button>
      <div className="divide-y divide-neutral-800">
        {comments.map(comment => (
          <div key={comment.id} onClick={onViewAll} className="cursor-pointer py-3 group">
            <div className="flex space-x-3 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center mt-1">
                <i className="fas fa-user text-neutral-400"></i>
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-white">{comment.username}</span>
                  <button onClick={handleInteraction} className="text-neutral-500 hover:text-white p-1 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Comment options">
                    <i className="fas fa-ellipsis-h"></i>
                  </button>
                </div>
                <p className="text-neutral-300 mt-1 text-sm whitespace-pre-wrap break-words">{comment.text}</p>
                <div className="flex items-center space-x-4 mt-2 text-neutral-500 text-xs">
                  <button onClick={handleInteraction} className="flex items-center space-x-1.5 hover:text-primary transition-colors">
                    <i className="far fa-thumbs-up"></i>
                    <span>{formatCount(comment.likes)}</span>
                  </button>
                  <button onClick={handleInteraction} className="flex items-center space-x-1.5 hover:text-white transition-colors">
                    <i className="far fa-thumbs-down"></i>
                    <span>{formatCount(comment.dislikes)}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopCommentsPreview;
