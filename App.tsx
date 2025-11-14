
import React, { useState, useEffect, useCallback } from 'react';
import NavBar from './components/NavBar';
import BottomNavBar from './components/BottomNavBar';
import HomePage from './pages/HomePage';
import FeaturedPage from './pages/FeaturedPage';
import SearchPage from './pages/SearchPage';
import LibraryPage from './pages/LibraryPage';
import MePage from './pages/MePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DeveloperPage from './pages/DeveloperPage';
import NovelDetailPage from './pages/NovelDetailPage';
import SettingsPage from './pages/SettingsPage';
import { firebaseConfig } from './firebaseConfig';
import { Novel } from './data/novels';
import Toast, { ToastData } from './components/Toast';
import MoreSpotlightsPage from './pages/MoreSpotlightsPage';
import MoreNewlyReleasedPage from './pages/MoreNewlyReleasedPage';
import HomePageSkeleton from './components/skeletons/HomePageSkeleton';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfUsePage from './pages/TermsOfUsePage';
import HelpPage from './pages/HelpPage';
import AppVersionPage from './pages/AppVersionPage';
import NoticePage from './pages/NoticePage';
import ReaderThemeSelectorPage from './pages/ReaderThemeSelectorPage';
import ManageDevicesPage from './pages/ManageDevicesPage';
import DisclaimerPage from './pages/DisclaimerPage';


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

// Helper to convert Firestore document to Novel object
const firestoreDocToNovel = (doc: any): Novel => {
    const fields = doc.fields;
    const idString = doc.name.split('/').pop() || '';

    const genreArray = fields?.genre?.arrayValue?.values;
    const genre = genreArray && genreArray.length > 0 ? genreArray[0].stringValue : undefined;

    const tagArray = fields?.tags?.arrayValue?.values;
    const tags = tagArray ? tagArray.map((v: any) => v.stringValue).join(', ') : (fields?.tags?.stringValue || '');

    const novel: Novel = {
        id: idString,
        title: fields?.title?.stringValue || '',
        author: fields?.author?.stringValue || '',
        coverUrl: fields?.coverUrl?.stringValue || '',
        subtitle: fields?.subtitle?.stringValue || '',
        tag: tags,
        genre: genre ?? fields?.genre?.stringValue,
        hasVideo: fields?.hasVideo?.booleanValue,
        imageUrls: fields?.imageUrls?.arrayValue?.values?.map((v: any) => v.stringValue),
        description: fields?.synopsis?.stringValue || fields?.description?.stringValue || fields?.pc?.stringValue || '',
        progress: fields?.progress?.integerValue ? parseInt(fields.progress.integerValue, 10) : undefined,
        status: fields?.status?.stringValue as 'Ongoing' | 'Completed' | 'Hiatus' | undefined,
        likes: fields?.likes?.integerValue ? parseInt(fields.likes.integerValue, 10) : 0,
        // Chapters are now fetched from a subcollection on-demand, not with the main novel document.
    };
    return novel;
};

// Helper to convert Novel object to Firestore fields for PATCH/POST
const novelToFirestoreFields = (novel: Novel) => {
    const fields: { [key: string]: any } = {};
    // Only include fields that have a value to avoid overwriting with null/undefined in PATCH
    if (novel.title !== undefined) fields.title = { stringValue: novel.title };
    if (novel.author !== undefined) fields.author = { stringValue: novel.author };
    if (novel.coverUrl !== undefined) fields.coverUrl = { stringValue: novel.coverUrl };
    if (novel.subtitle !== undefined) fields.subtitle = { stringValue: novel.subtitle };
    if (novel.tag !== undefined) {
        const tagsArray = novel.tag.split(',').map(t => t.trim()).filter(t => t);
        fields.tags = { arrayValue: { values: tagsArray.map(t => ({ stringValue: t })) } };
    }
    if (novel.genre !== undefined) {
        fields.genre = { arrayValue: { values: [{ stringValue: novel.genre }] } };
    }
    if (novel.hasVideo !== undefined) fields.hasVideo = { booleanValue: novel.hasVideo };
    if (novel.imageUrls !== undefined) fields.imageUrls = { arrayValue: { values: novel.imageUrls.map(url => ({ stringValue: url })) } };
    if (novel.description !== undefined) {
        fields.synopsis = { stringValue: novel.description };
    }
    if (novel.progress !== undefined) fields.progress = { integerValue: novel.progress.toString() };
    if (novel.status !== undefined) fields.status = { stringValue: novel.status };
    if (novel.likes !== undefined) fields.likes = { integerValue: novel.likes.toString() };
    
    // Chapter data is no longer stored in the main novel document.
    return { fields };
};


const App: React.FC = () => {
  const [activePage, setActivePage] = useState('Home');
  const [previousPage, setPreviousPage] = useState('Home');
  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [allNovels, setAllNovels] = useState<Novel[]>([]);
  const [isNovelsLoading, setIsNovelsLoading] = useState(true);
  const [novelsError, setNovelsError] = useState<string | null>(null);
  const [library, setLibrary] = useState<string[]>([]);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [settings, setSettings] = useState({ showLikeCounts: false });
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [readerSettings, setReaderSettings] = useState<{theme: Theme, fontSize: FontSize}>({
    theme: 'dark',
    fontSize: 'base',
  });

  // Load reader settings from local storage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('eTaleReaderSettings');
      if (savedSettings) {
        setReaderSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error("Failed to load reader settings", error);
    }
  }, []);

  const handleUpdateReaderSettings = (newSettings: Partial<{theme: Theme, fontSize: FontSize}>) => {
    const updatedSettings = { ...readerSettings, ...newSettings };
    setReaderSettings(updatedSettings);
    try {
        localStorage.setItem('eTaleReaderSettings', JSON.stringify(updatedSettings));
    } catch (error) {
        console.error("Failed to save reader settings", error);
    }
  };


  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ id: Date.now(), message, type });
  };
  
  const handleAddToLibrary = async (novelId: string) => {
    if (!currentUser) {
        showToast('Please log in to add stories to your library.', 'error');
        return;
    }

    if (library.includes(novelId)) return;

    const newLibrary = [...library, novelId];

    try {
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/users/${currentUser.localId}?updateMask.fieldPaths=library`;
        
        const response = await fetch(firestoreUrl, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${currentUser.idToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fields: {
                    library: {
                        arrayValue: {
                            values: newLibrary.map(id => ({ stringValue: id }))
                        }
                    }
                }
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to update library on the server.');
        }
        
        setLibrary(newLibrary);
        showToast('Added to library!');
    } catch (error) {
        console.error("Failed to add to library in Firestore", error);
        showToast('Could not add to library. Please try again.', 'error');
    }
  };

  const handleRemoveFromLibrary = async (novelId: string) => {
    if (!currentUser) {
        showToast('Please log in to manage your library.', 'error');
        return;
    }

    const newLibrary = library.filter(id => id !== novelId);

    try {
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/users/${currentUser.localId}?updateMask.fieldPaths=library`;
        
        const response = await fetch(firestoreUrl, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${currentUser.idToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fields: {
                    library: {
                        arrayValue: {
                            values: newLibrary.map(id => ({ stringValue: id }))
                        }
                    }
                }
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to update library on the server.');
        }

        setLibrary(newLibrary);
        showToast('Removed from library.');
    } catch (error) {
        console.error("Failed to remove from library in Firestore", error);
        showToast('Could not remove from library. Please try again.', 'error');
    }
  };

  const fetchNovels = useCallback(async () => {
    setIsNovelsLoading(true);
    setNovelsError(null);
    let allFetchedNovels: Novel[] = [];
    let nextPageToken: string | undefined = undefined;

    try {
      do {
        let firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/novels?key=${firebaseConfig.apiKey}`;
        if (nextPageToken) {
            firestoreUrl += `&pageToken=${nextPageToken}`;
        }
        
        const response = await fetch(firestoreUrl);

        if (!response.ok) {
            try {
              const errorData = await response.json();
              const message = errorData?.error?.message || `HTTP error! Status: ${response.status}`;
              throw new Error(message);
            } catch (jsonError) {
              throw new Error(`Failed to fetch novels. Status: ${response.status}`);
            }
        }

        const data = await response.json();
        const fetchedNovels = data.documents?.map(firestoreDocToNovel) || [];
        allFetchedNovels = [...allFetchedNovels, ...fetchedNovels];
        nextPageToken = data.nextPageToken;

      } while (nextPageToken);

      setAllNovels(allFetchedNovels);
    } catch (err: any) {
        console.error("Error fetching novels:", err);
        let friendlyMessage = "Could not load stories. Please check your network connection and try again.";
        if (err.message.includes('API key not valid')) {
            friendlyMessage = "There's an issue with the application configuration (Invalid API Key).";
        } else if (err.message.includes('permission') || err.message.includes('Permission denied')) {
            friendlyMessage = "There's a configuration issue preventing access to stories (Permission Denied).";
        } else if (err.message === 'Failed to fetch') {
            friendlyMessage = "Could not connect to the story server. This can be a network issue or an API key restriction in your Google Cloud project.";
        }
        setNovelsError(friendlyMessage);
        setAllNovels([]); // Use empty array as a fallback
    } finally {
        setIsNovelsLoading(false);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    setIsSettingsLoading(true);
    try {
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/settings/global?key=${firebaseConfig.apiKey}`;
        const response = await fetch(firestoreUrl);
        if (response.ok) {
            const data = await response.json();
            const showLikes = data.fields?.showLikeCounts?.booleanValue || false;
            setSettings({ showLikeCounts: showLikes });
        }
    } catch (error) {
        console.error("Failed to fetch settings, using defaults.", error);
    } finally {
        setIsSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNovels();
    fetchSettings();
  }, [fetchNovels, fetchSettings]);
  
  const handlePageChange = (page: string) => {
    if (page !== activePage) {
      setPreviousPage(activePage);
      setActivePage(page);
    }
  };

  const handleNovelSelect = (novel: Novel) => {
    setPreviousPage(activePage);
    setSelectedNovel(novel);
    setActivePage('NovelDetail');

    // Add to recently viewed
    try {
        const recentViewsRaw = localStorage.getItem('eTaleRecentViews');
        let recentViews: string[] = recentViewsRaw ? JSON.parse(recentViewsRaw) : [];
        // Remove novel if it's already there to move it to the front
        recentViews = recentViews.filter(id => id !== novel.id);
        // Add to the front
        recentViews.unshift(novel.id);
        // Keep only last 50
        localStorage.setItem('eTaleRecentViews', JSON.stringify(recentViews.slice(0, 50)));
    } catch (e) {
        console.error("Failed to update recent views", e);
    }
  };

  const handleBackFromDetail = () => {
    setSelectedNovel(null);
    setActivePage(previousPage);
  };

  const handleSaveNovel = async (novelToSave: Novel) => {
    if (!currentUser) {
        alert("You must be logged in to save novels.");
        return;
    }

    try {
        const exists = allNovels.some(n => n.id === novelToSave.id);
        const fieldsForFirestore = novelToFirestoreFields(novelToSave);
        let firestoreUrl: string;
        let method: string;

        if (exists) {
            // For updates, use PATCH with an updateMask to specify fields to change.
            const updateMask = Object.keys(fieldsForFirestore.fields)
                .map(field => `updateMask.fieldPaths=${field}`)
                .join('&');
            firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/novels/${novelToSave.id}?${updateMask}`;
            method = 'PATCH';
        } else {
            // For creation, use POST with a documentId to create a new document with our client-side ID.
            firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/novels?documentId=${novelToSave.id}`;
            method = 'POST';
        }

        const response = await fetch(firestoreUrl, {
            method: method,
            headers: {
                'Authorization': `Bearer ${currentUser.idToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(fieldsForFirestore),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData?.error?.message || `Failed to ${method === 'POST' ? 'create' : 'update'} novel.`);
        }
        await fetchNovels(); // Refetch on success
    } catch (err: any) {
        console.error("Error saving novel:", err);
        alert(`Failed to save novel to the database: ${err.message}`);
    }
  };

  const handleDeleteNovel = async (novelId: string) => {
    if (!currentUser) {
        alert("You must be logged in to delete novels.");
        return;
    }

    try {
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/novels/${novelId}`;
        const response = await fetch(firestoreUrl, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${currentUser.idToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData?.error?.message || 'Failed to delete novel.');
        }
        await fetchNovels(); // Refetch on success
    } catch (err: any) {
        console.error("Error deleting novel:", err);
        alert(`Failed to delete novel from the database: ${err.message}`);
    }
  };

  const handleUpdateSettings = async (newSettings: Partial<typeof settings>) => {
    if (!currentUser) {
        showToast('You must be logged in to change settings.', 'error');
        return;
    }

    const updatedSettings = { ...settings, ...newSettings };

    try {
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/settings/global?updateMask.fieldPaths=showLikeCounts`;
        const response = await fetch(firestoreUrl, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${currentUser.idToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fields: {
                    showLikeCounts: { booleanValue: updatedSettings.showLikeCounts }
                }
            })
        });

        if (!response.ok) {
            throw new Error("Failed to update settings on server.");
        }
        setSettings(updatedSettings);
        showToast("Settings updated successfully!", 'success');
    } catch (error) {
        console.error("Failed to update settings", error);
        showToast('Could not update settings. Please try again.', 'error');
    }
  };
  
  const handleLikeToggle = async (novelId: string, currentLikes: number) => {
    if (!currentUser || !profile) {
        showToast('Please log in to like stories.', 'error');
        return;
    }

    const isLiked = profile.likedNovels?.includes(novelId) || false;
    const newLikedNovels = isLiked
        ? profile.likedNovels?.filter(id => id !== novelId) || []
        : [...(profile.likedNovels || []), novelId];
    
    const newLikeCount = isLiked ? currentLikes - 1 : currentLikes + 1;

    // Optimistic UI update
    const originalProfile = { ...profile };
    const originalNovels = [...allNovels];
    setProfile(p => ({ ...p!, likedNovels: newLikedNovels }));
    setAllNovels(novels => novels.map(n => n.id === novelId ? { ...n, likes: newLikeCount } : n));

    try {
        // Update User's likedNovels
        const userUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/users/${currentUser.localId}?updateMask.fieldPaths=likedNovels`;
        const userUpdatePromise = fetch(userUrl, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${currentUser.idToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fields: {
                    likedNovels: { arrayValue: { values: newLikedNovels.map(id => ({ stringValue: id })) } }
                }
            }),
        });

        // Update Novel's like count
        const novelUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/novels/${novelId}?updateMask.fieldPaths=likes`;
        const novelUpdatePromise = fetch(novelUrl, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${currentUser.idToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fields: {
                    likes: { integerValue: newLikeCount.toString() }
                }
            }),
        });

        const [userResponse, novelResponse] = await Promise.all([userUpdatePromise, novelUpdatePromise]);

        if (!userResponse.ok || !novelResponse.ok) {
            throw new Error('Failed to sync like with server.');
        }
        
        showToast(isLiked ? 'Removed from likes' : 'Added to likes!', 'success');

    } catch (error) {
        console.error("Failed to update like status", error);
        showToast('Could not update like. Please try again.', 'error');
        // Revert optimistic update on failure
        setProfile(originalProfile);
        setAllNovels(originalNovels);
    }
  };


  useEffect(() => {
    if (currentUser) {
      const fetchProfile = async () => {
        setProfileLoading(true);
        setProfileError(null);
        try {
          const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/users/${currentUser.localId}`;
          const response = await fetch(firestoreUrl, {
            headers: {
              'Authorization': `Bearer ${currentUser.idToken}`
            }
          });
          
          if (!response.ok) {
            if (response.status === 404) {
              throw new Error("User profile not found. It may not have been created yet.");
            }
            const errorData = await response.json();
            const errorMessage = errorData?.error?.message || 'Failed to fetch user profile.';
            throw new Error(errorMessage);
          }

          const firestoreData = await response.json();

          if (firestoreData && firestoreData.fields) {
            const createdAt = firestoreData.fields.createdAt?.stringValue;
            const libraryIds = firestoreData.fields.library?.arrayValue?.values?.map((v: any) => v.stringValue) || [];
            const likedNovelIds = firestoreData.fields.likedNovels?.arrayValue?.values?.map((v: any) => v.stringValue) || [];

            const formattedProfile: UserProfile = {
              username: firestoreData.fields.username?.stringValue || '',
              email: firestoreData.fields.email?.stringValue || '',
              coins: parseInt(firestoreData.fields.coins?.integerValue || '0', 10),
              library: libraryIds,
              likedNovels: likedNovelIds,
            };

            if (createdAt && createdAt.startsWith('2025-11-08')) {
              formattedProfile.role = 'developer';
            }

            setProfile(formattedProfile);
            setLibrary(libraryIds);
          } else {
            setProfile(null);
            setLibrary([]);
          }
        } catch (err: any) {
          setProfileError(err.message);
          setLibrary([]);
          console.error("Error fetching profile:", err);
        } finally {
          setProfileLoading(false);
        }
      };
      fetchProfile();
    } else {
      setProfile(null);
      setProfileLoading(false);
      setProfileError(null);
      setLibrary([]);
    }
  }, [currentUser]);


  const isLoggedIn = !!currentUser;

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    handlePageChange('Home');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    handlePageChange('Home');
  };

  const renderContent = () => {
    if (isNovelsLoading || isSettingsLoading) {
      return <HomePageSkeleton />;
    }

    switch (activePage) {
      case 'Home':
        return <HomePage novels={allNovels} onNovelClick={handleNovelSelect} onPageChange={handlePageChange} />;
      case 'Library':
        return <LibraryPage 
                  novels={allNovels} 
                  onNovelClick={handleNovelSelect} 
                  library={library} 
                  likedNovels={profile?.likedNovels || []}
                />;
      case 'Featured':
        return <FeaturedPage novels={allNovels} onNovelClick={handleNovelSelect} />;
      case 'Search':
        return <SearchPage novels={allNovels} onNovelClick={handleNovelSelect} currentUser={currentUser} showToast={showToast} />;
      case 'Me':
        return <MePage 
          currentUser={currentUser} 
          onNavigate={handlePageChange} 
          library={library}
          novels={allNovels}
          onNovelClick={handleNovelSelect}
        />;
      case 'Login':
        return <LoginPage onLoginSuccess={handleLogin} onNavigateToRegister={() => handlePageChange('Register')} />;
      case 'Register':
        return <RegisterPage onRegisterSuccess={handleLogin} onNavigateToLogin={() => handlePageChange('Login')} />;
      case 'DeveloperCenter':
        return <DeveloperPage 
                  currentUser={currentUser}
                  onNavigateBack={() => handlePageChange('Me')} 
                  novels={allNovels}
                  onSaveNovel={handleSaveNovel}
                  onDeleteNovel={handleDeleteNovel}
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                />;
      case 'MoreSpotlights':
        return <MoreSpotlightsPage 
            novels={allNovels} 
            onNovelClick={handleNovelSelect} 
            onBack={() => setActivePage(previousPage)} 
        />;
      case 'MoreNewlyReleased':
        return <MoreNewlyReleasedPage 
            novels={allNovels} 
            onNovelClick={handleNovelSelect} 
            onBack={() => setActivePage(previousPage)} 
        />;
      case 'Settings':
        return <SettingsPage 
            onBack={() => setActivePage('Me')}
            profile={profile}
            onLogout={handleLogout}
            onNavigate={handlePageChange}
        />;
      case 'PrivacyPolicy':
        return <PrivacyPolicyPage onBack={() => setActivePage(previousPage)} />;
      case 'TermsOfUse':
        return <TermsOfUsePage onBack={() => setActivePage(previousPage)} />;
      case 'Help':
        return <HelpPage onBack={() => setActivePage(previousPage)} />;
      case 'AppVersion':
        return <AppVersionPage onBack={() => setActivePage(previousPage)} />;
      case 'Notice':
        return <NoticePage onBack={() => setActivePage(previousPage)} />;
      case 'ReaderThemeSelector':
        return <ReaderThemeSelectorPage onBack={() => setActivePage(previousPage)} settings={readerSettings} onUpdateSettings={handleUpdateReaderSettings} />;
      case 'ManageDevices':
        return <ManageDevicesPage onBack={() => setActivePage(previousPage)} />;
      case 'Disclaimer':
        return <DisclaimerPage onBack={() => setActivePage(previousPage)} />;
      default:
        return <HomePage novels={allNovels} onNovelClick={handleNovelSelect} onPageChange={handlePageChange} />;
    }
  };

  const isHomePage = activePage === 'Home';
  const showBottomNav = !['Login', 'Register', 'DeveloperCenter', 'MoreSpotlights', 'MoreNewlyReleased', 'NovelDetail', 'Settings', 'PrivacyPolicy', 'TermsOfUse', 'Help', 'AppVersion', 'Notice', 'ReaderThemeSelector', 'ManageDevices', 'Disclaimer'].includes(activePage);

  return (
    <div className="min-h-screen text-white">
      {novelsError && (
          <div className="fixed top-0 left-0 right-0 bg-red-800/95 backdrop-blur-sm text-white p-3 text-center z-[100] text-sm shadow-lg">
              <div className="max-w-4xl mx-auto flex justify-between items-center">
                <span className="text-left">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  {novelsError}
                </span>
                <button onClick={() => setNovelsError(null)} className="ml-4 font-bold text-lg leading-none">&times;</button>
              </div>
          </div>
      )}

      {activePage === 'NovelDetail' && selectedNovel ? (
          <NovelDetailPage 
            novel={selectedNovel} 
            allNovels={allNovels} 
            onBack={handleBackFromDetail}
            library={library}
            onAddToLibrary={handleAddToLibrary}
            onRemoveFromLibrary={handleRemoveFromLibrary}
            showToast={showToast}
            likedNovels={profile?.likedNovels || []}
            onLikeToggle={handleLikeToggle}
            showLikeCounts={settings.showLikeCounts}
            currentUser={currentUser}
            profile={profile}
            readerSettings={readerSettings}
            onUpdateReaderSettings={handleUpdateReaderSettings}
          /> 
      ) : (
        <>
          {isHomePage && <NavBar />}
          <main
            className={`max-w-7xl mx-auto ${
              !showBottomNav ? '' : 'px-4 sm:px-6 lg:px-8 pb-20'
            } ${
              isHomePage ? 'pt-8' : !showBottomNav ? '' : 'pt-4 sm:pt-8'
            } ${ novelsError ? 'pt-16' : '' }`}
          >
            {renderContent()}
          </main>
          {showBottomNav && <BottomNavBar activePage={activePage} onPageChange={handlePageChange} />}
        </>
      )}

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
};

export default App;
