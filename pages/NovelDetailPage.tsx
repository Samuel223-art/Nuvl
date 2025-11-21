
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Novel, Chapter, Comment } from '../data/novels';
import { firebaseConfig } from '../firebaseConfig';
import ActionMenu from '../components/ActionMenu';
import SkeletonLine from '../components/skeletons/SkeletonLine';
import TopCommentsPreview from '../components/comments/TopCommentsPreview';
import CommentsPage from './CommentsPage';

interface User {
  idToken: string;
  localId: string;
  email: string;
}

interface UserProfile {
    username: string;
    email: string;
    coins: number;
    role?: string;
    library?: string[];
    likedNovels?: string[];
}

export type Theme = 'dark' | 'light' | 'sepia';
export type FontSize = 'sm' | 'base' | 'lg' | 'xl';


interface NovelDetailPageProps {
  novel: Novel;
  allNovels: Novel[];
  onBack: () => void;
  library: string[];
  onAddToLibrary: (novelId: string) => void;
  onRemoveFromLibrary: (novelId: string) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
  likedNovels: string[];
  onLikeToggle: (novelId: string, currentLikes: number) => void;
  showLikeCounts: boolean;
  currentUser: User | null;
  profile: UserProfile | null;
  readerSettings: {theme: Theme, fontSize: FontSize};
  onUpdateReaderSettings: (newSettings: Partial<{theme: Theme, fontSize: FontSize}>) => void;
}

const ChapterListSkeleton = () => (
    <div className="space-y-4 py-3 animate-pulse">
        {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-baseline space-x-4">
                <SkeletonLine className="h-4 sm:h-5 w-8" />
                <SkeletonLine className="h-4 sm:h-5 flex-grow" />
            </div>
        ))}
    </div>
);

const NovelDetailPage: React.FC<NovelDetailPageProps> = ({
  novel,
  allNovels,
  onBack,
  library,
  onAddToLibrary,
  onRemoveFromLibrary,
  showToast,
  likedNovels,
  onLikeToggle,
  showLikeCounts,
  currentUser,
  profile,
  readerSettings,
  onUpdateReaderSettings
}) => {
  const [activeTab, setActiveTab] = useState<'Preview' | 'Chapters'>('Preview');
  const [publishedChapters, setPublishedChapters] = useState<Chapter[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(true);
  const [chaptersError, setChaptersError] = useState<string | null>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('asc');
  const [isContentsPageOpen, setIsContentsPageOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isCommentsPageOpen, setIsCommentsPageOpen] = useState(false);

  const [topComments, setTopComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  
  const initialViews = useMemo(() => parseInt(novel.id.replace(/\D/g, '').slice(0, 5), 10) * 123 % 1000000, [novel.id]);
  const [viewCount, setViewCount] = useState<number>(initialViews);

  const [isLiked, setIsLiked] = useState(likedNovels.includes(novel.id));
  const [likeCount, setLikeCount] = useState(novel.likes || 0);

  // Sync state if props change (e.g., user logs in/out, or novel data is refreshed)
  useEffect(() => {
      setIsLiked(likedNovels.includes(novel.id));
  }, [likedNovels, novel.id]);

  useEffect(() => {
      setLikeCount(novel.likes || 0);
  }, [novel.likes]);

  const handleLikeClick = () => {
    if (!currentUser) {
        showToast('Please log in to like stories.', 'error');
        return;
    }
    // Optimistic update for immediate feedback
    setIsLiked(prev => !prev);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    // Call the parent handler to sync with the server
    onLikeToggle(novel.id, likeCount);
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setViewCount(prevCount => prevCount + 3);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const formatViews = (count: number): string => {
    if (count >= 1000000) {
        return `${(count / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (count >= 1000) {
        return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    }
    return count.toLocaleString();
  };

  const synopsis = novel.description || 'No synopsis available.';
  const plainTextSynopsis = useMemo(() => {
    if (typeof document === 'undefined') return synopsis;
    const div = document.createElement('div');
    div.innerHTML = synopsis;
    return div.textContent || div.innerText || '';
  }, [synopsis]);
  
  const isTruncatable = plainTextSynopsis.length > 200;

  const isInLibrary = library.includes(novel.id);

  const handleLibraryClick = () => {
    if (isInLibrary) {
      onRemoveFromLibrary(novel.id);
    } else {
      onAddToLibrary(novel.id);
    }
  };

  const fetchTopComments = useCallback(async (chapterId: string) => {
    if (!novel?.id || !chapterId) return;
    setCommentsLoading(true);
    setCommentsError(null);
    try {
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/novels/${novel.id}/chapters/${chapterId}/comments?key=${firebaseConfig.apiKey}&orderBy=likes desc&pageSize=15`;
        const response = await fetch(firestoreUrl);
        if (response.status === 404) {
            setTopComments([]); // No comments collection exists
            return;
        }
        if (!response.ok) throw new Error("Could not fetch comments.");
        const data = await response.json();
        const fetchedComments: Comment[] = data.documents?.map((doc: any) => ({
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
        })) || [];
        const topLevelComments = fetchedComments.filter(c => !c.parentId).slice(0, 3);
        setTopComments(topLevelComments);
    } catch (error) {
        console.error("Failed to fetch top comments:", error);
        setCommentsError("Could not load comments.");
    } finally {
        setCommentsLoading(false);
    }
  }, [novel.id]);

  // Fetch chapters from subcollection
  useEffect(() => {
    const fetchChapters = async () => {
        if (!novel?.id) return;
        setChaptersLoading(true);
        setChaptersError(null);
        try {
            let allFetchedChapters: Chapter[] = [];
            let nextPageToken: string | undefined = undefined;
            do {
                let firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/novels/${novel.id}/chapters?key=${firebaseConfig.apiKey}&pageSize=300`;
                if (nextPageToken) {
                    firestoreUrl += `&pageToken=${nextPageToken}`;
                }

                const response = await fetch(firestoreUrl);
                
                if (response.status === 404) {
                    break;
                }

                if (!response.ok) {
                    const errorData = await response.json();
                    const message = errorData?.error?.message || `HTTP error! Status: ${response.status}`;
                    throw new Error(message);
                }

                const data = await response.json();
                
                const fetchedInPage: Chapter[] = data.documents?.map((doc: any) => {
                    const fields = doc.fields;
                    const chapterNumStr = fields.chapterNumber?.integerValue || fields.chapterNumber?.stringValue || '0';
                    return {
                        id: doc.name.split('/').pop() || '',
                        chapterNumber: parseInt(chapterNumStr, 10),
                        title: fields.title?.stringValue || `Chapter ${chapterNumStr}`,
                        status: (fields.status?.stringValue as 'published' | 'draft' | 'trashed') || 'published',
                        content: fields.content?.stringValue || fields.pc?.stringValue || '',
                    };
                }) || [];

                allFetchedChapters.push(...fetchedInPage);
                nextPageToken = data.nextPageToken;
            } while (nextPageToken);

            if (allFetchedChapters.length === 0) {
                setPublishedChapters([]);
            } else {
                const published = allFetchedChapters
                    .filter(ch => ch.status === 'published')
                    .sort((a, b) => a.chapterNumber - b.chapterNumber);
                setPublishedChapters(published);
                if (published.length > 0) {
                  fetchTopComments(published[0].id);
                }
            }
            
            setCurrentChapterIndex(0);
        } catch (error: any) {
            console.error("Error fetching chapters:", error);
            // Display a more informative error to the user.
            let friendlyMessage = "Could not load chapters for this story. Please try again later.";
            if (error.message.includes('permission') || error.message.includes('Permission denied')) {
                friendlyMessage = "There's a configuration issue preventing access to chapters (Permission Denied).";
            } else if (error.message.includes('index')) {
                friendlyMessage = "A database index is required to load chapters. Please check the Firestore console.";
            } else if (error.message === 'Failed to fetch') {
                friendlyMessage = "Could not connect to the story server. Please check your network.";
            }
            setChaptersError(friendlyMessage);
            setPublishedChapters([]);
        } finally {
            setChaptersLoading(false);
        }
    };

    fetchChapters();
  }, [novel, fetchTopComments]);


  const handleStartReading = useCallback((chapterId: string) => {
    const index = publishedChapters.findIndex(c => c.id === chapterId);
    if (index === -1) return;

    setCurrentChapterIndex(index);
    fetchTopComments(chapterId);
    setIsReading(true);
    setIsNavVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [publishedChapters, fetchTopComments]);

  const handleExitReading = () => {
    setIsReading(false);
    setIsContentsPageOpen(false);
    setActiveTab('Chapters'); // Land on chapter list when exiting
  };

  // Hide navs on scroll when in reading mode
  useEffect(() => {
    if (!isReading) return;

    const handleScroll = () => {
        setIsNavVisible(false);
    };
    
    // If navs are visible, a single scroll event will hide them.
    if(isNavVisible) {
        window.addEventListener('scroll', handleScroll, { once: true });
    }

    return () => {
        window.removeEventListener('scroll', handleScroll);
    };
  }, [isReading, isNavVisible]);
  
  const goToNextChapter = useCallback(() => {
    if (currentChapterIndex < publishedChapters.length - 1) {
        const newIndex = currentChapterIndex + 1;
        setCurrentChapterIndex(newIndex);
        fetchTopComments(publishedChapters[newIndex].id);
        window.scrollTo({ top: 0, behavior: 'auto' });
        setIsNavVisible(true); // Show navs on chapter change
    }
  }, [currentChapterIndex, publishedChapters, fetchTopComments]);

  const goToPreviousChapter = useCallback(() => {
    if (currentChapterIndex > 0) {
        const newIndex = currentChapterIndex - 1;
        setCurrentChapterIndex(newIndex);
        fetchTopComments(publishedChapters[newIndex].id);
        window.scrollTo({ top: 0, behavior: 'auto' });
        setIsNavVisible(true); // Show navs on chapter change
    }
  }, [currentChapterIndex, publishedChapters, fetchTopComments]);

  useEffect(() => {
    if (!isReading) return;

    let volumeSwitchEnabled = false;
    try {
        const item = localStorage.getItem('eTaleVolumeKeySwitch');
        volumeSwitchEnabled = item ? JSON.parse(item) : false;
    } catch (e) { 
        volumeSwitchEnabled = false;
    }

    if (!volumeSwitchEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'ArrowDown' || event.key === 'AudioVolumeDown') {
            event.preventDefault();
            goToNextChapter();
        } else if (event.key === 'ArrowUp' || event.key === 'AudioVolumeUp') {
            event.preventDefault();
            goToPreviousChapter();
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isReading, goToNextChapter, goToPreviousChapter]);


  const handleSelectChapterFromContents = (chapterId: string) => {
    const index = publishedChapters.findIndex(c => c.id === chapterId);
    if (index !== -1) {
        setCurrentChapterIndex(index);
        fetchTopComments(chapterId);
        setIsContentsPageOpen(false);
        window.scrollTo({ top: 0, behavior: 'auto' });
        setIsNavVisible(true);
    }
  };

  const themeConfig: Record<Theme, {bg: string, text: string, prose: string, swatch: string}> = {
    dark: { bg: 'bg-[#171717]', text: 'text-neutral-300', prose: 'prose-invert', swatch: 'bg-neutral-800 border-neutral-600' },
    light: { bg: 'bg-white', text: 'text-neutral-800', prose: '', swatch: 'bg-white border-neutral-300' },
    sepia: { bg: 'bg-[#FBF0D9]', text: 'text-[#5B4636]', prose: '', swatch: 'bg-[#FBF0D9] border-[#D4CBB9]' },
  };

  const fontSizes: FontSize[] = ['sm', 'base', 'lg', 'xl'];
  const fontSizeClasses: Record<FontSize, string> = {
    sm: 'prose-sm',
    base: 'prose-base',
    lg: 'prose-lg',
    xl: 'prose-xl',
  };

  const handleFontSizeChange = (direction: 'increase' | 'decrease') => {
    const currentIndex = fontSizes.indexOf(readerSettings.fontSize);
    if (direction === 'increase' && currentIndex < fontSizes.length - 1) {
      onUpdateReaderSettings({ fontSize: fontSizes[currentIndex + 1] });
    }
    if (direction === 'decrease' && currentIndex > 0) {
      onUpdateReaderSettings({ fontSize: fontSizes[currentIndex - 1] });
    }
  };

  const currentChapter = publishedChapters[currentChapterIndex];
  
  const bannerImageUrl = novel.imageUrls?.[1] || novel.coverUrl;

  const ChapterItem: React.FC<{ chapter: Chapter }> = ({ chapter }) => {
    const isCurrent = chapter.id === currentChapter?.id;
    const chapterTimestamp = parseInt(chapter.id, 10);
    const isNew = !isNaN(chapterTimestamp) && (Date.now() - chapterTimestamp) < 7 * 24 * 60 * 60 * 1000;

    return (
      <div 
        onClick={() => {
          if (!currentUser) {
            showToast('Please log in to read.', 'error');
            return;
          }
          handleStartReading(chapter.id)
        }} 
        className="flex items-center justify-between py-2 sm:py-3 cursor-pointer group"
      >
        <div className="flex items-baseline space-x-4">
          <span className="text-neutral-400 w-6 sm:w-8 text-left font-sans text-sm sm:text-base">{chapter.chapterNumber}</span>
          <h3 className="text-white font-medium text-sm sm:text-base group-hover:text-primary transition-colors">{chapter.title}</h3>
          {isNew && <span className="ml-2 bg-primary text-black text-xs font-bold px-2 py-0.5 rounded-full">NEW</span>}
        </div>
        {isCurrent && (
          <i className="fas fa-location-arrow text-primary text-sm"></i>
        )}
      </div>
    );
  };

  if (isReading) {
    if (!currentChapter) {
      return (
        <div className="flex justify-center items-center h-screen bg-neutral-900">
          <i className="fas fa-spinner fa-spin text-primary text-4xl"></i>
        </div>
      );
    }

    const sortedChaptersForPanel = [...publishedChapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
    const nextChapter = currentChapterIndex < publishedChapters.length - 1 ? publishedChapters[currentChapterIndex + 1] : null;

    return (
      <div className={`${themeConfig[readerSettings.theme].bg} ${themeConfig[readerSettings.theme].text} min-h-screen`} onClick={() => setIsNavVisible(v => !v)}>
        <header 
            onClick={e => e.stopPropagation()}
            className={`fixed top-0 left-0 right-0 z-50 flex items-center px-4 py-2 border-b border-neutral-700 bg-black/80 backdrop-blur-sm transition-transform duration-300 ease-in-out ${isNavVisible ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className="flex items-center space-x-4 overflow-hidden">
                <button onClick={e => { e.stopPropagation(); handleExitReading(); }} className="p-2 -ml-2 text-neutral-300 hover:text-white" aria-label="Back to details">
                    <i className="fas fa-arrow-left text-xl sm:text-2xl"></i>
                </button>
                <div className="text-left overflow-hidden">
                     <h2 className="text-sm sm:text-base font-bold truncate">{currentChapter ? `Ch ${currentChapter.chapterNumber}. ${currentChapter.title}` : ''}</h2>
                </div>
            </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-24">
          {currentChapter && currentChapter.content ? (
            <div
              className={`prose ${fontSizeClasses[readerSettings.fontSize]} ${themeConfig[readerSettings.theme].prose} max-w-none`}
              dangerouslySetInnerHTML={{ __html: currentChapter.content }}
            />
          ) : (
            <p className="text-neutral-400 text-center py-8">Chapter content not available.</p>
          )}

          {currentChapter && (
            <div className={`mt-16 -mx-4 sm:-mx-6 lg:-mx-8 ${themeConfig[readerSettings.theme].bg}`} onClick={e => e.stopPropagation()}>
              <div className="border-t border-neutral-800"></div>
              <div className="space-y-10 pt-8 pb-10 px-4 sm:px-6 lg:px-8">
                <div>
                    <p className="text-xs sm:text-sm">Creator</p>
                    <p className="font-bold text-sm sm:text-base uppercase">{novel.author || 'Unknown Author'}</p>
                </div>
                
                {nextChapter ? (
                  <button 
                      onClick={e => { e.stopPropagation(); goToNextChapter(); }}
                      className="w-full flex items-center p-3 rounded-lg hover:bg-neutral-700 transition-colors text-left space-x-4"
                      style={{ backgroundColor: '#222222', border: '0.7px solid #404040' }}
                  >
                      <img src={novel.coverUrl} alt={novel.title} className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-md flex-shrink-0" />
                      <div className="flex-grow overflow-hidden">
                          <p className="font-semibold text-white text-sm sm:text-base">Next Chapter</p>
                          <p className="text-xs sm:text-sm text-neutral-400 truncate" title={`Chapter ${nextChapter.chapterNumber}: ${nextChapter.title}`}>
                            Chapter {nextChapter.chapterNumber}: {nextChapter.title}
                          </p>
                      </div>
                      <i className="fas fa-chevron-right text-neutral-500 text-lg sm:text-xl"></i>
                  </button>
                ) : (
                  <div className="text-center py-8 border-y border-neutral-800">
                    <i className="fas fa-feather-alt text-3xl sm:text-4xl text-neutral-500 mb-4"></i>
                    <h3 className="text-lg sm:text-xl font-bold">The End</h3>
                    <p className="mt-2 text-sm sm:text-base">You've reached the final chapter of "{novel.title}".</p>
                  </div>
                )}

                {commentsLoading ? (
                    <div className="text-center py-4">
                        <i className="fas fa-spinner fa-spin text-primary"></i>
                    </div>
                ) : commentsError ? (
                    <div className="text-center py-4 text-neutral-500">{commentsError}</div>
                ) : (
                  <TopCommentsPreview
                      comments={topComments}
                      onViewAll={() => setIsCommentsPageOpen(true)}
                      showToast={showToast}
                  />
                )}
                
                <div>
                    <h2 className="text-lg sm:text-xl font-bold mb-4">
                        If you enjoyed <span className="text-primary">{novel.title}</span>
                    </h2>
                    <div className="flex space-x-3 sm:space-x-4 overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 no-scrollbar">
                      {allNovels
                        .filter(n => n.id !== novel.id)
                        .slice(0, 5)
                        .map(recNovel => (
                            <div key={recNovel.id} className="flex-shrink-0 w-28 sm:w-32 group">
                                <img 
                                    src={recNovel.coverUrl} 
                                    alt={recNovel.title}
                                    className="w-full h-36 sm:h-44 object-cover rounded-lg"
                                />
                                <div className="mt-2">
                                    <p className="text-[10px] sm:text-xs truncate">{recNovel.genre || 'Misc'}</p>
                                    <h3 className="text-xs sm:text-sm font-bold truncate">{recNovel.title}</h3>
                                    <p className="text-[10px] sm:text-xs truncate">{recNovel.author || 'Unknown'}</p>
                                </div>
                            </div>
                        ))
                      }
                    </div>
                </div>
              </div>
            </div>
          )}
        </main>
        
        {isSettingsOpen && (
          <div className="fixed inset-0 bg-black/60 z-[60]" onClick={() => setIsSettingsOpen(false)}>
            <div
              className={`fixed bottom-0 left-0 right-0 bg-neutral-800 text-white p-6 rounded-t-2xl shadow-lg transform transition-transform duration-300 ease-in-out ${isNavVisible ? 'translate-y-0' : 'translate-y-full'}`}
              style={{ bottom: isNavVisible ? '3.5rem' : '0' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-300">Font Size</span>
                  <div className="flex items-center space-x-2 bg-neutral-700 rounded-full p-1">
                    <button onClick={() => handleFontSizeChange('decrease')} className="w-10 h-8 rounded-full hover:bg-neutral-600 flex items-center justify-center font-bold text-lg" aria-label="Decrease font size">A-</button>
                    <span className="w-10 text-center text-sm uppercase font-mono">{readerSettings.fontSize}</span>
                    <button onClick={() => handleFontSizeChange('increase')} className="w-10 h-8 rounded-full hover:bg-neutral-600 flex items-center justify-center font-bold text-lg" aria-label="Increase font size">A+</button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-300">Theme</span>
                  <div className="flex items-center space-x-4">
                    {Object.entries(themeConfig).map(([key, value]) => (
                      <button
                        key={key}
                        onClick={() => onUpdateReaderSettings({ theme: key as Theme })}
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${readerSettings.theme === key ? 'border-primary' : ''} ${value.swatch}`}
                        aria-label={`Set ${key} theme`}
                      >
                        {readerSettings.theme === key && <i className={`fas fa-check ${key === 'dark' ? 'text-primary' : 'text-black'}`}></i>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <footer 
            onClick={e => e.stopPropagation()}
            className={`fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around py-1 border-t border-neutral-700 bg-black/80 backdrop-blur-sm transition-transform duration-300 ease-in-out ${isNavVisible ? 'translate-y-0' : 'translate-y-full'}`}>
            <button onClick={e => { e.stopPropagation(); goToPreviousChapter(); }} disabled={currentChapterIndex === 0} className="flex flex-col items-center text-neutral-400 hover:text-primary p-1 transition-colors disabled:text-neutral-600 disabled:cursor-not-allowed" aria-label="Previous Chapter">
                <i className="fas fa-chevron-left text-lg sm:text-xl"></i>
                <span className="text-[10px] sm:text-xs mt-1">Prev</span>
            </button>
            <button onClick={e => { e.stopPropagation(); setIsContentsPageOpen(true); }} className="flex flex-col items-center text-neutral-400 hover:text-primary p-1 transition-colors" aria-label="Open chapter list">
                <i className="fas fa-list-ul text-lg sm:text-xl"></i>
                <span className="text-[10px] sm:text-xs mt-1">Chapters</span>
            </button>
             <button onClick={e => { e.stopPropagation(); setIsSettingsOpen(o => !o); }} className="flex flex-col items-center text-neutral-400 hover:text-primary p-1 transition-colors" aria-label="Display settings">
                <i className="fas fa-cog text-lg sm:text-xl"></i>
                <span className="text-[10px] sm:text-xs mt-1">Settings</span>
            </button>
            <button onClick={e => { e.stopPropagation(); goToNextChapter(); }} disabled={currentChapterIndex >= publishedChapters.length - 1} className="flex flex-col items-center text-neutral-400 hover:text-primary p-1 transition-colors disabled:text-neutral-600 disabled:cursor-not-allowed" aria-label="Next Chapter">
                <i className="fas fa-chevron-right text-lg sm:text-xl"></i>
                <span className="text-[10px] sm:text-xs mt-1">Next</span>
            </button>
        </footer>
        
        {isContentsPageOpen && (
          <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true">
            <div 
                className="fixed inset-0 bg-black/60" 
                onClick={() => setIsContentsPageOpen(false)}
                aria-hidden="true"
            ></div>
            
            <div className="fixed top-0 left-0 h-full w-[85%] max-w-sm bg-black text-white shadow-2xl flex flex-col">
                <header className="p-4 flex-shrink-0">
                    <div className="inline-block">
                        <h1 className="text-xl sm:text-2xl font-bold">Contents</h1>
                        <div className="mt-2 h-px w-full bg-neutral-500"></div>
                    </div>
                </header>
                <main className="flex-grow overflow-y-auto">
                    <div className="divide-y divide-neutral-800">
                        {sortedChaptersForPanel.map(chapter => (
                            <button 
                                key={chapter.id}
                                onClick={() => handleSelectChapterFromContents(chapter.id)}
                                className={`w-full text-left p-4 flex items-center justify-between transition-colors ${chapter.id === currentChapter?.id ? '' : 'hover:bg-neutral-800'}`}
                            >
                                <div className="flex items-center space-x-4 overflow-hidden">
                                    <span className={`w-8 text-base sm:text-lg font-normal flex-shrink-0 ${chapter.id === currentChapter?.id ? 'text-indigo-400' : 'text-neutral-400'}`}>
                                        {chapter.chapterNumber}
                                    </span>
                                    <div className="flex-1">
                                        <h3 className={`font-medium text-sm sm:text-base truncate ${chapter.id === currentChapter?.id ? 'text-indigo-400' : 'text-neutral-200'}`} title={chapter.title}>
                                            {chapter.title}
                                        </h3>
                                    </div>
                                </div>
                                {chapter.id === currentChapter?.id && (
                                    <i className="fas fa-location-arrow text-primary ml-4 text-sm"></i>
                                )}
                            </button>
                        ))}
                    </div>
                </main>
            </div>
          </div>
        )}

        {isCommentsPageOpen && currentChapter && (
            <CommentsPage
                novelId={novel.id}
                chapterId={currentChapter.id}
                onClose={() => setIsCommentsPageOpen(false)}
                currentUser={currentUser}
                profile={profile}
                showToast={showToast}
            />
        )}
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#171717' }} className="min-h-screen text-white pb-10">
      <div className="relative h-48 sm:h-60 md:h-72">
        <img src={bannerImageUrl} alt={`${novel.title} banner`} className="absolute top-0 left-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
        <header className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-center">
          <button onClick={onBack} className="text-white h-10 w-10 rounded-full bg-black/30 flex items-center justify-center backdrop-blur-sm hover:bg-black/50 transition-colors" aria-label="Go back">
            <i className="fas fa-chevron-left text-xl"></i>
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleLibraryClick}
              className={`h-10 rounded-full flex items-center backdrop-blur-sm transition-colors px-4 space-x-2 ${isInLibrary ? 'bg-primary/20 text-primary' : 'bg-black/30 text-white hover:bg-black/50'}`}
              aria-label={isInLibrary ? 'Remove from Library' : 'Add to Library'}
            >
              <i className={`fas ${isInLibrary ? 'fa-check' : 'fa-plus'}`}></i>
              <span className="font-semibold text-xs sm:text-sm">{isInLibrary ? 'In Library' : 'Library'}</span>
            </button>
            <button onClick={() => setIsActionMenuOpen(true)} className="text-white h-10 w-10 rounded-full bg-black/30 flex items-center justify-center backdrop-blur-sm hover:bg-black/50 transition-colors" aria-label="More options">
              <i className="fas fa-ellipsis-v"></i>
            </button>
          </div>
        </header>
      </div>

      <div className="px-4 -mt-16 sm:-mt-20 md:-mt-24 relative z-10">
        <div className="flex items-end space-x-4">
          <img src={novel.coverUrl} alt={`Cover of ${novel.title}`} className="w-24 h-36 sm:w-28 sm:h-40 object-cover rounded-lg shadow-lg border-2 border-neutral-800" />
          <div className="flex-1 pb-2">
            <h1 className="text-lg sm:text-xl font-bold text-white leading-tight">{novel.title}</h1>
            <p className="text-primary text-xs sm:text-sm font-semibold mt-1">{novel.author || 'Unknown Author'}</p>
          </div>
        </div>
        
        <div className="mt-4 flex justify-around bg-neutral-800/50 rounded-lg p-2 sm:p-3 text-center">
          <div><p className="font-bold text-sm sm:text-base">{novel.status}</p><p className="text-[10px] sm:text-xs text-neutral-400">Status</p></div>
          <div className="border-l border-neutral-700"></div>
          <div><p className="font-bold text-sm sm:text-base capitalize">{novel.genre || 'N/A'}</p><p className="text-[10px] sm:text-xs text-neutral-400">Genre</p></div>
          <div className="border-l border-neutral-700"></div>
          <div><p className="font-bold text-sm sm:text-base">{formatViews(viewCount)}</p><p className="text-[10px] sm:text-xs text-neutral-400">Views</p></div>
        </div>

        <div className="mt-6">
          <div
            className={`prose prose-sm prose-invert max-w-none text-neutral-300 leading-relaxed relative overflow-hidden transition-[max-height] duration-500 ease-in-out ${isTruncatable && !isSynopsisExpanded ? 'max-h-24' : 'max-h-[1000px]'}`}
          >
            <div dangerouslySetInnerHTML={{ __html: synopsis }} />
            {isTruncatable && !isSynopsisExpanded && (
              <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#171717] to-transparent" />
            )}
          </div>
          {isTruncatable && (
            <button
              onClick={() => setIsSynopsisExpanded(!isSynopsisExpanded)}
              className="text-primary font-semibold mt-2 text-xs sm:text-sm hover:text-green-400"
            >
              {isSynopsisExpanded ? 'Show Less' : 'Show More'}
            </button>
          )}
        </div>

        {novel.tag && (
          <div className="mt-6 flex flex-wrap gap-2 sm:gap-3" aria-label="Tags">
            {novel.tag.split(',').map(tag => tag.trim()).filter(tag => tag).map(tag => (
              <span key={tag} className="bg-neutral-800 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold uppercase">
                # {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6 flex items-center space-x-4">
            <button 
                onClick={handleLikeClick}
                className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-colors duration-300 ${isLiked ? 'bg-primary/20 text-primary' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'}`}
                aria-label={isLiked ? 'Unlike this novel' : 'Like this novel'}
            >
                <i className={`fas fa-heart text-xl sm:text-2xl`}></i>
            </button>
            {showLikeCounts && (
                <div className="text-left">
                    <p className="font-bold text-base sm:text-lg text-white">{likeCount.toLocaleString()}</p>
                    <p className="text-[10px] sm:text-xs text-neutral-400">Likes</p>
                </div>
            )}
        </div>

        <div className="mt-8">
            <div className="border-b border-neutral-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('Preview')}
                        className={`whitespace-nowrap py-2 sm:py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none ${ activeTab === 'Preview' ? 'border-primary text-primary' : 'border-transparent text-neutral-400 hover:text-white'}`}
                    >
                        Preview
                    </button>
                    <button
                        onClick={() => setActiveTab('Chapters')}
                        className={`whitespace-nowrap py-2 sm:py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none ${ activeTab === 'Chapters' ? 'border-primary text-primary' : 'border-transparent text-neutral-400 hover:text-white'}`}
                    >
                        Chapters
                    </button>
                </nav>
            </div>
        </div>


        <div className="mt-6">
          {activeTab === 'Preview' && (
             chaptersLoading ? (
                <div className="animate-pulse space-y-4 mt-8">
                    <SkeletonLine className="h-6 w-3/4 mb-4" />
                    <SkeletonLine className="h-4 w-full" />
                    <SkeletonLine className="h-4 w-full" />
                    <SkeletonLine className="h-4 w-5/6" />
                </div>
            ) : (
            <div>
              <h2 className="text-lg sm:text-xl font-bold mb-4">{currentChapter?.title || 'Preview'}</h2>
              {currentChapter && currentChapter.content ? (
                <>
                  <div
                    className="prose prose-sm prose-invert max-w-none text-neutral-300"
                    dangerouslySetInnerHTML={{ __html: currentChapter.content }}
                  />
                  {currentChapterIndex === 0 && publishedChapters.length > 1 && (
                    <div className="mt-8 mb-16 flex justify-center">
                      <button 
                        onClick={() => {
                           if (!currentUser) {
                                showToast('Please log in to read.', 'error');
                                return;
                            }
                           handleStartReading(publishedChapters[1].id)
                        }}
                        className="bg-transparent border-2 border-primary text-primary font-bold py-2 sm:py-3 px-6 sm:px-8 rounded-full flex items-center space-x-3 hover:bg-primary/10 transition-colors duration-300 text-sm sm:text-base"
                        aria-label="Continue reading from chapter 2"
                      >
                        <span>Continue Reading</span>
                        <i className="fas fa-chevron-down"></i>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-neutral-400 text-center py-8 text-sm">
                  {publishedChapters.length > 0 ? 'Preview for this chapter is not available.' : 'No preview available.'}
                </p>
              )}
            </div>
          ))}
          {activeTab === 'Chapters' && (
            chaptersLoading ? (
              <ChapterListSkeleton />
            ) : chaptersError ? (
              <div className="text-center py-8 text-red-400 bg-red-500/10 rounded-lg p-4">
                  <i className="fas fa-exclamation-triangle text-xl sm:text-2xl mb-2"></i>
                  <p className="font-semibold text-sm sm:text-base">Failed to load chapters</p>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">{chaptersError}</p>
              </div>
            ) : (
              <div>
                {publishedChapters.length > 0 && (
                    <div className="flex justify-between items-center py-2 sm:py-3 border-b border-neutral-800 mb-2">
                        <span className="text-neutral-300 font-bold text-sm sm:text-base">
                            {publishedChapters.length} episodes
                        </span>
                        <button onClick={() => setSortOrder(so => so === 'desc' ? 'asc' : 'desc')} className="text-neutral-300 hover:text-white text-xs sm:text-sm flex items-center gap-2">
                            <span>{sortOrder === 'desc' ? 'Descending' : 'Ascending'}</span>
                            <i className="fas fa-sort text-neutral-500"></i>
                        </button>
                    </div>
                )}
                {(() => {
                    const sortedChapters = [...publishedChapters].sort((a, b) => {
                        if (sortOrder === 'asc') {
                            return a.chapterNumber - b.chapterNumber;
                        }
                        return b.chapterNumber - a.chapterNumber;
                    });
                    if (sortedChapters.length > 0) {
                        return sortedChapters.map((chapter) => <ChapterItem key={chapter.id} chapter={chapter} />);
                    } else {
                        return (
                            <div className="text-center py-12 px-6 bg-neutral-800/50 rounded-lg">
                                <i className="fas fa-book-open text-4xl sm:text-5xl text-neutral-600 mb-6"></i>
                                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">No Chapters Yet</h2>
                                <p className="text-neutral-400 text-sm sm:text-base max-w-sm mx-auto">This story is just getting started. Check back soon for new episodes!</p>
                            </div>
                        );
                    }
                })()}
              </div>
            )
          )}
        </div>
      </div>
      
      {isActionMenuOpen && (
        <ActionMenu 
          isOpen={isActionMenuOpen}
          onClose={() => setIsActionMenuOpen(false)}
          novel={novel}
          chapters={publishedChapters}
          showToast={showToast}
        />
      )}
    </div>
  );
};

export default NovelDetailPage;
