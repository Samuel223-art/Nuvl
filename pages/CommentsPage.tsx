


import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Comment } from '../data/novels';
import { firebaseConfig } from '../firebaseConfig';
import CommentCard from '../components/comments/CommentCard';
import CommentInput from '../components/comments/CommentInput';

interface User {
  idToken: string;
  localId: string;
  email: string;
}

interface UserProfile {
    username: string;
    email: string;
}

interface CommentsPageProps {
  novelId: string;
  chapterId: string;
  onClose: () => void;
  currentUser: User | null;
  profile: UserProfile | null;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const blocklist = ['fuck', 'shit', 'bitch', 'asshole', 'cunt', 'damn', 'hell', 'pussy', 'dick'];
const urlRegex = new RegExp(
  '((https?|ftp)://)?' + // protocol
  '([a-z0-9-]+\\.)+[a-z]{2,}' + // domain name
  '(:[0-9]{1,5})?' + // port
  '(/.*)?', 'i' // path
);

const CommentsPage: React.FC<CommentsPageProps> = ({ novelId, chapterId, onClose, currentUser, profile, showToast }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'top' | 'newest'>('top');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ username: string; commentId: string } | null>(null);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/novels/${novelId}/chapters/${chapterId}/comments?key=${firebaseConfig.apiKey}&pageSize=300`;
      
      const response = await fetch(firestoreUrl);
      if (response.status === 404) {
        setComments([]);
        return;
      }
      if (!response.ok) throw new Error('Failed to fetch comments.');
      const data = await response.json();

      const allComments: Comment[] = data.documents?.map((doc: any) => ({
        id: doc.name.split('/').pop(),
        text: doc.fields.text?.stringValue || '',
        username: doc.fields.username?.stringValue || 'Anonymous',
        userId: doc.fields.userId?.stringValue || '',
        timestamp: doc.fields.timestamp?.timestampValue || new Date().toISOString(),
        likes: parseInt(doc.fields.likes?.integerValue || '0', 10),
        dislikes: parseInt(doc.fields.dislikes?.integerValue || '0', 10),
        parentId: doc.fields.parentId?.stringValue || null,
        likedBy: doc.fields.likedBy?.arrayValue?.values?.map((v: any) => v.stringValue) || [],
        dislikedBy: doc.fields.dislikedBy?.arrayValue?.values?.map((v: any) => v.stringValue) || [],
        replyCount: parseInt(doc.fields.replyCount?.integerValue || '0', 10),
        isSpoiler: doc.fields.isSpoiler?.booleanValue || false,
      })) || [];

      // Build tree structure for replies
      const commentMap = new Map<string, Comment & { replies: Comment[] }>();
      const rootComments: (Comment & { replies: Comment[] })[] = [];
      allComments.forEach(c => commentMap.set(c.id, {...c, replies: []}));
      allComments.forEach(c => {
        if (c.parentId && commentMap.has(c.parentId)) {
          commentMap.get(c.parentId)!.replies.push(commentMap.get(c.id)!);
        } else {
          rootComments.push(commentMap.get(c.id)!);
        }
      });
      
      // Sort replies by timestamp
      rootComments.forEach(c => c.replies.sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));

      setComments(rootComments);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [novelId, chapterId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handlePostComment = async (text: string, isSpoiler: boolean) => {
    if (!currentUser || !profile) {
      showToast('You must be logged in to comment.', 'error');
      return;
    }
    setIsSubmitting(true);

    // Validation
    const lowerCaseText = text.toLowerCase();
    if (urlRegex.test(lowerCaseText)) {
        showToast('Comments cannot contain links.', 'error');
        setIsSubmitting(false);
        return;
    }

    if (blocklist.some(word => lowerCaseText.includes(word))) {
        showToast('Your comment contains inappropriate language and was not posted.', 'error');
        setIsSubmitting(false);
        return;
    }
    
    try {
        const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/novels/${novelId}/chapters/${chapterId}/comments`;
        const body = { fields: {
            text: { stringValue: text },
            userId: { stringValue: currentUser.localId },
            username: { stringValue: profile.username },
            timestamp: { timestampValue: new Date().toISOString() },
            likes: { integerValue: '0' },
            dislikes: { integerValue: '0' },
            likedBy: { arrayValue: { values: [] } },
            dislikedBy: { arrayValue: { values: [] } },
            isSpoiler: { booleanValue: isSpoiler },
            ...(replyingTo && { parentId: { stringValue: replyingTo.commentId } })
        }};

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${currentUser.idToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!response.ok) throw new Error("Failed to post comment.");
        
        showToast("Comment posted!", 'success');
        setReplyingTo(null);
        await fetchComments(); // Refetch all comments
    } catch (err) {
        showToast("Could not post comment.", 'error');
    } finally {
        setIsSubmitting(false);
    }
  };
  
    const handleLikeDislike = async (commentId: string, action: 'like' | 'dislike') => {
    if (!currentUser) {
        showToast('Please log in to vote on comments.', 'error');
        return;
    }

    const originalComments = JSON.parse(JSON.stringify(comments));

    // Helper to find and update the comment recursively
    const findAndUpdate = (commentsArr: Comment[], id: string, updateFn: (c: Comment) => void): boolean => {
        for (const c of commentsArr) {
            if (c.id === id) {
                updateFn(c);
                return true;
            }
            if (c.replies && findAndUpdate(c.replies, id, updateFn)) {
                return true;
            }
        }
        return false;
    };

    // Optimistic update
    const newComments = JSON.parse(JSON.stringify(comments));
    let updatedComment: Comment | null = null;
    
    findAndUpdate(newComments, commentId, (comment) => {
        const userId = currentUser.localId;
        const isLiked = comment.likedBy.includes(userId);
        const isDisliked = comment.dislikedBy.includes(userId);

        if (action === 'like') {
            if (isLiked) {
                comment.likedBy = comment.likedBy.filter(id => id !== userId);
                comment.likes--;
            } else {
                comment.likedBy.push(userId);
                comment.likes++;
                if (isDisliked) {
                    comment.dislikedBy = comment.dislikedBy.filter(id => id !== userId);
                    comment.dislikes--;
                }
            }
        } else { // 'dislike'
            if (isDisliked) {
                comment.dislikedBy = comment.dislikedBy.filter(id => id !== userId);
                comment.dislikes--;
            } else {
                comment.dislikedBy.push(userId);
                comment.dislikes++;
                if (isLiked) {
                    comment.likedBy = comment.likedBy.filter(id => id !== userId);
                    comment.likes--;
                }
            }
        }
        updatedComment = comment;
    });
    
    if (!updatedComment) return;

    setComments(newComments);

    // API call
    try {
        const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/novels/${novelId}/chapters/${chapterId}/comments/${commentId}?updateMask.fieldPaths=likes&updateMask.fieldPaths=dislikes&updateMask.fieldPaths=likedBy&updateMask.fieldPaths=dislikedBy`;
        
        const body = {
            fields: {
                likes: { integerValue: updatedComment.likes.toString() },
                dislikes: { integerValue: updatedComment.dislikes.toString() },
                likedBy: { arrayValue: { values: updatedComment.likedBy.map(id => ({ stringValue: id })) || [] } },
                dislikedBy: { arrayValue: { values: updatedComment.dislikedBy.map(id => ({ stringValue: id })) || [] } },
            }
        };

        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${currentUser.idToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error('Failed to update comment.');
        }

    } catch (error) {
        console.error('Failed to update like/dislike:', error);
        showToast('Could not save your vote. Please try again.', 'error');
        // Revert on failure
        setComments(originalComments);
    }
  };

  const sortedComments = useMemo(() => {
    const commentsCopy = [...comments];
    if (sortOrder === 'top') {
      return commentsCopy.sort((a, b) => b.likes - a.likes);
    }
    return commentsCopy.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [comments, sortOrder]);

  const totalCommentCount = useMemo(() => {
      let count = 0;
      comments.forEach(c => {
          count += 1; // count parent
          count += c.replies?.length || 0; // count replies
      });
      return count;
  }, [comments]);


  return (
    <div className="fixed inset-0 bg-neutral-900 z-[100] flex flex-col" role="dialog" aria-modal="true">
      <header className="flex-shrink-0 bg-neutral-900 flex items-center justify-between p-3 border-b border-neutral-700">
        <button onClick={onClose} aria-label="Back to reading">
            <i className="fas fa-chevron-left text-xl"></i>
        </button>
        <h1 className="font-bold">Comments ({totalCommentCount})</h1>
        <button onClick={onClose} aria-label="Close comments">
            <i className="fas fa-times text-xl"></i>
        </button>
      </header>

      <div className="flex-shrink-0 flex items-center px-4 border-b border-neutral-700">
          <button 
              onClick={() => setSortOrder('top')}
              className={`py-3 px-2 text-sm font-bold border-b-2 ${sortOrder === 'top' ? 'border-white text-white' : 'border-transparent text-neutral-500'}`}>
              TOP
          </button>
          <button 
              onClick={() => setSortOrder('newest')}
              className={`py-3 px-2 text-sm font-bold border-b-2 ${sortOrder === 'newest' ? 'border-white text-white' : 'border-transparent text-neutral-500'}`}>
              NEWEST
          </button>
      </div>

      <main className="flex-grow overflow-y-auto px-4 pb-24">
        {isLoading && <div className="text-center py-10"><i className="fas fa-spinner fa-spin text-2xl text-primary"></i></div>}
        {error && <div className="text-center py-10 text-red-400">{error}</div>}
        {!isLoading && !error && (
          sortedComments.length > 0 ? (
            <div className="divide-y divide-neutral-800">
              {sortedComments.map((comment, index) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  currentUser={currentUser}
                  onLike={(id) => handleLikeDislike(id, 'like')}
                  onDislike={(id) => handleLikeDislike(id, 'dislike')}
                  onReply={(username, id) => setReplyingTo({ username, commentId: id })}
                  isTopComment={sortOrder === 'top' && index < 1}
                  nestingLevel={0}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-neutral-500">
                <i className="far fa-comment-alt text-4xl mb-4"></i>
                <p>No comments yet.</p>
                <p className="text-sm">Be the first to share your thoughts!</p>
            </div>
          )
        )}
      </main>

      <CommentInput 
        onSubmit={handlePostComment} 
        isSubmitting={isSubmitting} 
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />
    </div>
  );
};

export default CommentsPage;