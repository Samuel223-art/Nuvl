
import React, { useState, useEffect, useRef } from 'react';
import { Chapter } from '../../data/novels';

interface ChapterEditorProps {
  chapter: Chapter | null; // null for a new chapter
  onSave: (chapter: Chapter) => void;
  onCancel: () => void;
}

const ChapterEditor: React.FC<ChapterEditorProps> = ({ chapter, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Refs to hold the latest state for the cleanup function to avoid stale closures
  const dirtyRef = useRef(isDirty);
  const titleRef = useRef(title);
  
  useEffect(() => {
    dirtyRef.current = isDirty;
    titleRef.current = title;
  }, [isDirty, title]);

  // Set initial content and handle auto-save on unmount/change
  useEffect(() => {
    setTitle(chapter?.title || '');
    if (editorRef.current) {
        // Set the editor's content whenever the chapter prop changes.
        // This ensures that when an existing chapter is opened, its content is displayed.
        editorRef.current.innerHTML = chapter?.content || '';
    }

    // Auto-save unsaved changes as a draft when the component unmounts or the chapter changes.
    return () => {
      if (dirtyRef.current) {
        handleSave('draft');
      }
    };
    // Re-run this effect if the `chapter` prop changes.
  }, [chapter]);

  const handleInput = () => {
    setIsDirty(true);
  };

  const formatDoc = (cmd: string) => {
    document.execCommand(cmd, false);
    editorRef.current?.focus();
    setIsDirty(true);
  };

  const handleSave = (status: 'published' | 'draft') => {
    // Use the ref for title to get the most up-to-date value, especially for auto-save
    const finalTitle = titleRef.current.trim() || 'Untitled Chapter';
    const content = editorRef.current?.innerHTML || '';

    // If there's no content and the title is the default, don't save an empty draft
    if (status === 'draft' && !content && finalTitle === 'Untitled Chapter') {
      return;
    }

    const chapterToSave: Chapter = {
      id: chapter?.id || Date.now().toString(),
      chapterNumber: chapter?.chapterNumber || 0, // A real chapter number is assigned in NovelForm
      title: finalTitle,
      content: content,
      status: status,
    };

    onSave(chapterToSave);
    setIsDirty(false); // Reset dirty state after saving
    dirtyRef.current = false; // Manually update ref to prevent race condition on unmount
  };
  
  const handleBack = () => {
    // The useEffect cleanup will handle auto-saving if dirty.
    onCancel();
  };


  return (
    <div className="fixed inset-0 bg-neutral-900 text-white z-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-neutral-700 bg-neutral-800 flex-shrink-0">
        <button onClick={handleBack} className="p-2 -ml-2 text-neutral-300 hover:text-white" aria-label="Go back">
          <i className="fas fa-arrow-left text-xl"></i>
        </button>
        <h2 className="text-lg font-bold">Chapter Editor</h2>
        <button 
            onClick={() => handleSave('published')}
            className="py-2 px-5 bg-primary text-black font-bold rounded-lg hover:bg-green-400 transition-colors"
        >
            Save
        </button>
      </header>

      {/* Toolbar */}
      <div className="p-2 border-b border-neutral-700 bg-neutral-800 flex-shrink-0">
        <div className="flex items-center space-x-2">
            <button onClick={() => formatDoc('bold')} className="w-10 h-10 rounded hover:bg-neutral-700 flex items-center justify-center" aria-label="Bold text"><i className="fas fa-bold"></i></button>
            <button onClick={() => formatDoc('italic')} className="w-10 h-10 rounded hover:bg-neutral-700 flex items-center justify-center" aria-label="Italic text"><i className="fas fa-italic"></i></button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8">
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setIsDirty(true);
          }}
          placeholder="Chapter Title"
          className="w-full bg-transparent text-3xl sm:text-4xl font-bold focus:outline-none mb-6 text-white"
        />
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="w-full h-full focus:outline-none text-lg leading-relaxed text-neutral-300"
          aria-label="Chapter content"
        >
        </div>
      </div>
    </div>
  );
};

export default ChapterEditor;
