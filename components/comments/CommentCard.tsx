
import React, { useState, useMemo } from 'react';
import { Comment } from '../../data/novels';

interface User {
  idToken: string;
  localId: string;
  email: string;
}

interface CommentCardProps {
  comment: Comment;
  currentUser: User | null;
  onLike: (commentId: string) => void;
  onDislike: (commentId: string) => void;
  onReply: (username: string, commentId: string) => void;
  isTopComment?: boolean;
  nestingLevel?: number;
}

const CommentCard: React.FC<CommentCardProps> = ({ comment, currentUser, onLike, onDislike, onReply, isTopComment = false, nestingLevel = 0 }) => {
    const [isSpoilerRevealed, setIsSpoilerRevealed] = useState(false);
    const [areRepliesVisible, setAreRepliesVisible] = useState(false);

    const formatTimestamp = useMemo(() => {
        const date = new Date(comment.timestamp);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }, [comment.timestamp]);

    const isLiked = currentUser && comment.likedBy?.includes(currentUser.localId);
    const isDisliked = currentUser && comment.dislikedBy?.includes(currentUser.localId);

    const formatCount = (count: number): string => {
        return count.toLocaleString();
    };

    return (
        <div className={`py-3 ${nestingLevel > 0 ? 'pl-4' : ''}`}>
            <div className="flex space-x-3">
                <div className="flex-grow">
                    <div className="flex items-start justify-between">
                         <div className="flex items-center space-x-3 mb-2">
                            <span className="font-bold text-md text-white">{comment.username}</span>
                            <span className="text-sm text-neutral-500">{formatTimestamp}</span>
                        </div>
                        <button className="text-neutral-600 hover:text-white self-start p-1 -mr-1" aria-label="Comment options">
                            <i className="fas fa-ellipsis-v"></i>
                        </button>
                    </div>

                    {comment.isSpoiler && !isSpoilerRevealed ? (
                        <div className="mt-2">
                            <button
                                onClick={() => setIsSpoilerRevealed(true)}
                                className="w-full text-left p-4 bg-neutral-800 rounded-lg flex items-center justify-between hover:bg-neutral-700 transition-colors"
                            >
                                <div className="flex items-center">
                                    <i className="fas fa-exclamation-triangle text-yellow-400 mr-3"></i>
                                    <span className="font-semibold">Spoiler</span>
                                </div>
                                <span className="text-sm text-neutral-400">Tap to reveal</span>
                            </button>
                        </div>
                    ) : (
                        <div className="text-white flex items-start space-x-2">
                            {isTopComment && (
                                <span className="flex-shrink-0 bg-primary text-black text-xs font-bold px-2 py-0.5 rounded">
                                    TOP
                                </span>
                            )}
                            <p className="text-base leading-relaxed whitespace-pre-wrap">{comment.text}</p>
                        </div>
                    )}
                    
                    <div className="flex items-center space-x-4 mt-3 text-neutral-400">
                        {nestingLevel < 2 && (
                            <button
                                onClick={() => onReply(comment.username, comment.id)}
                                className="text-sm font-semibold text-neutral-400 hover:text-white transition-colors"
                            >
                                Reply
                            </button>
                        )}
                        
                        <div className="flex items-center border border-neutral-700 rounded-md overflow-hidden text-sm bg-neutral-800">
                            <button onClick={() => onLike(comment.id)} className={`flex items-center space-x-2 px-4 py-2 hover:bg-neutral-700 transition-colors ${isLiked ? 'text-primary' : ''}`}>
                                <i className={`${isLiked ? 'fas' : 'far'} fa-thumbs-up`}></i>
                                <span>{formatCount(comment.likes)}</span>
                            </button>
                            <div className="w-px h-5 bg-neutral-700"></div>
                            <button onClick={() => onDislike(comment.id)} className={`flex items-center space-x-2 px-4 py-2 hover:bg-neutral-700 transition-colors`}>
                                <i className={`${isDisliked ? 'fas' : 'far'} fa-thumbs-down`}></i>
                                <span>{formatCount(comment.dislikes)}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3">
                    <button 
                        onClick={() => setAreRepliesVisible(!areRepliesVisible)}
                        className="text-sm font-bold text-primary hover:text-green-400"
                    >
                        {areRepliesVisible ? 'Hide replies' : `View ${comment.replies.length} ${comment.replies.length > 1 ? 'replies' : 'reply'}`}
                    </button>
                    {areRepliesVisible && (
                        <div className="mt-2 border-l-2 border-neutral-800">
                            <div className="space-y-2">
                                {comment.replies.map(reply => (
                                    <CommentCard
                                        key={reply.id}
                                        comment={reply}
                                        currentUser={currentUser}
                                        onLike={onLike}
                                        onDislike={onDislike}
                                        onReply={onReply}
                                        nestingLevel={nestingLevel + 1}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommentCard;
