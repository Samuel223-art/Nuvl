
import React, { useState, useEffect } from 'react';
import { Novel, Chapter } from '../../data/novels';
import ChapterEditor from './ChapterEditor';
import { firebaseConfig } from '../../firebaseConfig';
import SkeletonLine from '../skeletons/SkeletonLine';

interface User {
  idToken: string;
  localId: string;
  email: string;
}

interface NovelFormProps {
  currentUser: User | null;
  novel: Novel;
  onSave: (novel: Novel) => void;
  onCancel: () => void;
}

const NovelForm: React.FC<NovelFormProps> = ({ currentUser, novel, onSave, onCancel }) => {
  const [activeTab, setActiveTab] = useState('Novel');
  const [editingChapter, setEditingChapter] = useState<Chapter | 'new' | null>(null);

  // State for novel details
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [tags, setTags] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [status, setStatus] = useState<'Ongoing' | 'Completed' | 'Hiatus'>('Ongoing');
  const [coverUrl, setCoverUrl] = useState('');
  
  // State for chapter management
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(true);

  useEffect(() => {
    if (novel) {
      setTitle(novel.title || '');
      setAuthor(novel.author || '');
      setGenre(novel.genre || '');
      setSynopsis(novel.description || '');
      setCoverUrl(novel.coverUrl || '');
      setStatus(novel.status || 'Ongoing');
      setTags(novel.tag || '');
      
      const fetchChapters = async () => {
        if (!novel.id) return;
        setChaptersLoading(true);
        try {
            let allFetchedChapters: Chapter[] = [];
            let nextPageToken: string | undefined = undefined;

            do {
                let firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/novels/${novel.id}/chapters?key=${firebaseConfig.apiKey}&showMissing=true&pageSize=300`;
                if (nextPageToken) {
                    firestoreUrl += `&pageToken=${nextPageToken}`;
                }
                const response = await fetch(firestoreUrl);

                if (response.status === 404) {
                    break;
                }

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData?.error?.message || 'Failed to fetch chapters.');
                }

                const data = await response.json();
                const fetchedInPage: Chapter[] = data.documents?.map((doc: any) => {
                    const fields = doc.fields;
                    const chapterNumStr = fields.chapterNumber?.integerValue || fields.chapterNumber?.stringValue || '0';
                    return {
                        id: doc.name.split('/').pop(),
                        chapterNumber: parseInt(chapterNumStr, 10),
                        title: fields.title?.stringValue || '',
                        status: fields.status?.stringValue || 'draft',
                        content: fields.content?.stringValue || fields.pc?.stringValue || '',
                    };
                }) || [];

                allFetchedChapters.push(...fetchedInPage);
                nextPageToken = data.nextPageToken;

            } while (nextPageToken);
            
            allFetchedChapters.sort((a, b) => b.chapterNumber - a.chapterNumber);
            setChapters(allFetchedChapters);
        } catch (error) {
            console.error("Failed to fetch chapters:", error);
            alert("Could not load chapters for this novel.");
            setChapters([]);
        } finally {
            setChaptersLoading(false);
        }
      };

      fetchChapters();
    }
  }, [novel]);

  const handleSaveAll = () => {
    if (!title) {
        alert("Title is required.");
        return;
    }
    const novelData: Novel = {
        ...novel,
        title,
        author,
        genre,
        description: synopsis,
        coverUrl,
        status,
        tag: tags,
        // Chapters are no longer saved with the main novel object
    };
    onSave(novelData);
  };
  
  // --- Chapter Handlers ---
  const handleSaveChapter = async (chapterToSave: Chapter) => {
    if (!currentUser) {
        alert("You must be logged in to save chapters.");
        return;
    }

    const isNew = !chapters.some(c => c.id === chapterToSave.id);
    let finalChapter = { ...chapterToSave };

    if (isNew) {
        const maxChapterNum = chapters.length > 0 ? Math.max(...chapters.map(c => c.chapterNumber)) : 0;
        finalChapter.chapterNumber = maxChapterNum + 1;
    }

    const chapterDataForFirestore = {
        fields: {
            chapterNumber: { integerValue: finalChapter.chapterNumber.toString() },
            title: { stringValue: finalChapter.title },
            status: { stringValue: finalChapter.status },
            content: { stringValue: finalChapter.content || '' },
        }
    };

    try {
        let url;
        let method;
        if(isNew) {
            url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/novels/${novel.id}/chapters?documentId=${finalChapter.id}`;
            method = 'POST';
        } else {
            const updateMask = Object.keys(chapterDataForFirestore.fields).map(f => `updateMask.fieldPaths=${f}`).join('&');
            url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/novels/${novel.id}/chapters/${finalChapter.id}?${updateMask}`;
            method = 'PATCH';
        }
        
        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${currentUser.idToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(chapterDataForFirestore),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData?.error?.message || 'Failed to save chapter.');
        }

        if (isNew) {
            setChapters(prev => [finalChapter, ...prev].sort((a,b) => b.chapterNumber - a.chapterNumber));
        } else {
            setChapters(prev => prev.map(c => c.id === finalChapter.id ? finalChapter : c));
        }
        setEditingChapter(null);

    } catch (err: any) {
        console.error("Error saving chapter:", err);
        alert(`Failed to save chapter: ${err.message}`);
    }
  };
  
  const handleUpdateChapterStatus = async (id: string, newStatus: Chapter['status']) => {
    if (!currentUser) {
        alert("You must be logged in to update chapters.");
        return;
    }
    try {
        const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/novels/${novel.id}/chapters/${id}?updateMask.fieldPaths=status`;
        const body = { fields: { status: { stringValue: newStatus } } };

        const response = await fetch(url, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${currentUser.idToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        
        if (!response.ok) throw new Error('Failed to update status.');
        
        setChapters(chapters.map(ch => ch.id === id ? { ...ch, status: newStatus } : ch));
    } catch(err) {
        alert('Could not update chapter status.');
        console.error(err);
    }
  };
  
  const handleDeleteChapterPermanently = async (id: string) => {
    if (window.confirm("Are you sure? This will permanently delete the chapter.")) {
        if (!currentUser) {
            alert("You must be logged in to delete chapters.");
            return;
        }
        try {
            const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/novels/${novel.id}/chapters/${id}`;
            const response = await fetch(url, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${currentUser.idToken}` }
            });
            if (!response.ok) throw new Error('Failed to delete chapter from server.');
            setChapters(chapters.filter(ch => ch.id !== id));
        } catch(err) {
            alert('Could not delete chapter.');
            console.error(err);
        }
    }
  };

  const tabs = ['Novel', 'Chapters', 'Draft', 'Trash'];

  if (editingChapter) {
    return (
        <ChapterEditor 
            chapter={editingChapter === 'new' ? null : chapters.find(c => c.id === (editingChapter as Chapter).id) || null}
            onSave={handleSaveChapter}
            onCancel={() => setEditingChapter(null)}
        />
    );
  }

  // --- Render Functions for Tabs ---
  const renderNovelDetails = () => (
    <div className="bg-neutral-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 border-b border-neutral-700 pb-2">Novel Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
                <label className="block text-sm font-medium text-neutral-300 mb-2">Cover Preview</label>
                <div className="aspect-[2/3] bg-neutral-700 rounded-lg flex items-center justify-center">
                    {coverUrl ? (
                        <img src={coverUrl} alt="Cover preview" className="w-full h-full object-cover rounded-lg"/>
                    ) : (
                        <i className="fas fa-image text-4xl text-neutral-500"></i>
                    )}
                </div>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                    <label htmlFor="title" className="block text-sm font-medium text-neutral-300 mb-2">Title</label>
                    <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-neutral-700 rounded-lg p-2 border border-neutral-600 focus:ring-primary focus:border-primary"/>
                </div>
                <div>
                    <label htmlFor="author" className="block text-sm font-medium text-neutral-300 mb-2">Author's Name</label>
                    <input type="text" id="author" value={author} onChange={e => setAuthor(e.target.value)} className="w-full bg-neutral-700 rounded-lg p-2 border border-neutral-600 focus:ring-primary focus:border-primary"/>
                </div>
                <div>
                    <label htmlFor="genre" className="block text-sm font-medium text-neutral-300 mb-2">Genre</label>
                    <input type="text" id="genre" value={genre} onChange={e => setGenre(e.target.value)} className="w-full bg-neutral-700 rounded-lg p-2 border border-neutral-600 focus:ring-primary focus:border-primary"/>
                </div>
                 <div className="sm:col-span-2">
                    <label htmlFor="coverUrl" className="block text-sm font-medium text-neutral-300 mb-2">Cover Image URL</label>
                    <input type="url" id="coverUrl" value={coverUrl} onChange={e => setCoverUrl(e.target.value)} className="w-full bg-neutral-700 rounded-lg p-2 border border-neutral-600 focus:ring-primary focus:border-primary"/>
                </div>
                <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-neutral-300 mb-2">Tags (comma-separated)</label>
                    <input type="text" id="tags" value={tags} onChange={e => setTags(e.target.value)} className="w-full bg-neutral-700 rounded-lg p-2 border border-neutral-600 focus:ring-primary focus:border-primary"/>
                </div>
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-neutral-300 mb-2">Status</label>
                    <select id="status" value={status} onChange={e => setStatus(e.target.value as any)} className="w-full bg-neutral-700 rounded-lg p-2 border border-neutral-600 focus:ring-primary focus:border-primary">
                        <option>Ongoing</option>
                        <option>Completed</option>
                        <option>Hiatus</option>
                    </select>
                </div>
                <div className="sm:col-span-2">
                    <label htmlFor="synopsis" className="block text-sm font-medium text-neutral-300 mb-2">Synopsis</label>
                    <textarea id="synopsis" value={synopsis} onChange={e => setSynopsis(e.target.value)} rows={5} className="w-full bg-neutral-700 rounded-lg p-2 border border-neutral-600 focus:ring-primary focus:border-primary"></textarea>
                </div>
            </div>
        </div>
    </div>
  );

  const renderChapterList = (listStatus: Chapter['status']) => {
    const filteredChapters = chapters.filter(ch => ch.status === listStatus);

    const getActions = (chapter: Chapter) => {
        switch(listStatus) {
            case 'published': return (
                <>
                    <button onClick={() => setEditingChapter(chapter)} className="text-neutral-300 hover:text-white" title="Edit Chapter"><i className="fas fa-pencil-alt"></i></button>
                    <button onClick={() => handleUpdateChapterStatus(chapter.id, 'draft')} className="text-yellow-500 hover:text-yellow-400" title="Move to Drafts"><i className="fas fa-file-alt"></i></button>
                    <button onClick={() => handleUpdateChapterStatus(chapter.id, 'trashed')} className="text-red-500 hover:text-red-400" title="Move to Trash"><i className="fas fa-trash"></i></button>
                </>
            );
            case 'draft': return (
                <>
                    <button onClick={() => setEditingChapter(chapter)} className="text-neutral-300 hover:text-white" title="Edit Chapter"><i className="fas fa-pencil-alt"></i></button>
                    <button onClick={() => handleUpdateChapterStatus(chapter.id, 'published')} className="text-green-500 hover:text-green-400" title="Publish"><i className="fas fa-check-circle"></i></button>
                    <button onClick={() => handleUpdateChapterStatus(chapter.id, 'trashed')} className="text-red-500 hover:text-red-400" title="Move to Trash"><i className="fas fa-trash"></i></button>
                </>
            );
            case 'trashed': return (
                <>
                    <button onClick={() => handleUpdateChapterStatus(chapter.id, 'draft')} className="text-blue-500 hover:text-blue-400" title="Restore"><i className="fas fa-undo"></i></button>
                    <button onClick={() => handleDeleteChapterPermanently(chapter.id)} className="text-red-500 hover:text-red-400" title="Delete Permanently"><i className="fas fa-times-circle"></i></button>
                </>
            );
        }
    }
    
    return (
        <div className="bg-neutral-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 border-b border-neutral-700 pb-2 capitalize">{listStatus} Chapters</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {chaptersLoading ? (
                    <div className="space-y-3 animate-pulse">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between bg-neutral-700 p-3 rounded-lg h-14">
                               <SkeletonLine className="h-5 w-3/5" />
                            </div>
                        ))}
                    </div>
                ) : filteredChapters.length > 0 ? filteredChapters.map((ch) => (
                    <div key={ch.id} className="flex items-center justify-between bg-neutral-700 p-3 rounded-lg">
                        <p><span className="font-bold mr-2 text-neutral-400">{ch.chapterNumber}.</span>{ch.title}</p>
                        <div className="flex space-x-4">
                            {getActions(ch)}
                        </div>
                    </div>
                )) : <p className="text-neutral-400 text-center py-8">No chapters in {listStatus}.</p>}
            </div>
        </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Novel': return renderNovelDetails();
      case 'Chapters': return renderChapterList('published');
      case 'Draft': return renderChapterList('draft');
      case 'Trash': return renderChapterList('trashed');
      default: return null;
    }
  };

  const showCreateChapterButton = ['Chapters', 'Draft'].includes(activeTab);

  return (
    <div className={`text-white max-w-4xl mx-auto ${showCreateChapterButton ? 'pb-36' : 'pb-24'}`}>
      <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold truncate pr-4">Editing "{novel.title}"</h1>
          <button type="button" onClick={onCancel} className="text-neutral-400 hover:text-white" aria-label="Close editor">
            <i className="fas fa-times text-2xl"></i>
          </button>
      </div>
      
      <div className="border-b border-neutral-700">
        <nav className="-mb-px flex space-x-6 overflow-x-auto no-scrollbar" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-neutral-400 hover:text-white hover:border-neutral-500'
              }`}
              aria-current={activeTab === tab ? 'page' : undefined}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="mt-6">
        {renderTabContent()}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-neutral-800/80 backdrop-blur-sm border-t border-neutral-700 z-30">
        <div className="max-w-4xl mx-auto p-4 flex justify-end">
          <button onClick={handleSaveAll} className="py-2 px-6 bg-primary text-black font-bold rounded-lg hover:bg-green-400 transition-colors">Save All Changes</button>
        </div>
      </div>

      {showCreateChapterButton && (
        <div className="fixed bottom-20 left-0 right-0 bg-neutral-900/80 backdrop-blur-sm z-20">
            <div className="max-w-4xl mx-auto p-4">
            <button
                onClick={() => setEditingChapter('new')}
                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-500 transition-colors flex items-center justify-center text-base"
            >
                <i className="fas fa-pen-alt mr-2"></i>
                Create Chapter
            </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default NovelForm;
