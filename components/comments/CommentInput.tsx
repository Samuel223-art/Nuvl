
import React, { useState, useRef, useEffect } from 'react';

interface CommentInputProps {
  onSubmit: (text: string, isSpoiler: boolean) => void;
  isSubmitting: boolean;
  replyingTo?: { username: string; commentId: string } | null;
  onCancelReply?: () => void;
}

const CommentInput: React.FC<CommentInputProps> = ({ onSubmit, isSubmitting, replyingTo, onCancelReply }) => {
  const [text, setText] = useState('');
  const [isSpoiler, setIsSpoiler] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (replyingTo) {
      inputRef.current?.focus();
    }
  }, [replyingTo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isSubmitting) {
      onSubmit(text.trim(), isSpoiler);
      setText('');
      setIsSpoiler(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-neutral-800 border-t border-neutral-700 z-10">
        {replyingTo && (
            <div className="px-3 pt-2 text-xs text-neutral-400 flex justify-between items-center">
                <span>Replying to <span className="font-bold text-white">{replyingTo.username}</span></span>
                <button onClick={onCancelReply} className="text-neutral-500 hover:text-white text-lg leading-none">&times;</button>
            </div>
        )}
        <form
            onSubmit={handleSubmit}
            className="p-2 flex items-center space-x-2"
        >
            <button
                type="button"
                onClick={() => setIsSpoiler(!isSpoiler)}
                className={`p-2 rounded-full w-10 h-10 flex items-center justify-center transition-colors ${isSpoiler ? 'bg-primary text-black' : 'text-neutral-400 hover:text-white'}`}
                aria-pressed={isSpoiler}
                title="Mark as spoiler"
            >
                <i className="fas fa-exclamation-triangle text-lg"></i>
            </button>
            <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={replyingTo ? 'Add a reply...' : 'Leave a comment...'}
                className="flex-grow bg-neutral-700 rounded-full py-2 px-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
                type="submit"
                disabled={!text.trim() || isSubmitting}
                className="bg-primary text-black font-bold rounded-full px-5 py-2 text-sm transition-colors disabled:bg-primary/50 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : 'Send'}
            </button>
        </form>
    </div>
  );
};

export default CommentInput;
