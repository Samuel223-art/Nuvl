
import React, { useState, useEffect, useMemo } from 'react';
import { Novel } from '../data/novels';
import NovelGrid from '../components/NovelGrid';
import { firebaseConfig } from '../firebaseConfig';
import SkeletonLine from '../components/skeletons/SkeletonLine';

interface User {
  idToken: string;
  localId: string;
  email: string;
}

interface SearchPageProps {
    novels: Novel[];
    onNovelClick: (novel: Novel) => void;
    currentUser: User | null;
    showToast: (message: string, type?: 'success' | 'error') => void;
}

const getRecentSearches = (): string[] => {
  try {
    const item = localStorage.getItem('eTaleRecentSearches');
    return item ? JSON.parse(item) : [];
  } catch (e) {
    console.warn("Could not parse recent searches from localStorage", e);
    return [];
  }
};

const saveRecentSearches = (searches: string[]) => {
  try {
    localStorage.setItem('eTaleRecentSearches', JSON.stringify(searches));
  } catch (e) {
    console.error("Could not save recent searches to localStorage", e);
  }
};


const SearchPage: React.FC<SearchPageProps> = ({ novels, onNovelClick, currentUser, showToast }) => {
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Novel[] | null>(null);
    const [recentSearches, setRecentSearches] = useState<string[]>(getRecentSearches());
    const [popularSearches, setPopularSearches] = useState<string[]>([]);
    const [isLoadingPopular, setIsLoadingPopular] = useState(true);

    useEffect(() => {
        const fetchPopularSearches = async () => {
            setIsLoadingPopular(true);
            try {
                const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/searchAnalytics?key=${firebaseConfig.apiKey}&orderBy=timestamp desc&pageSize=100`;

                const response = await fetch(firestoreUrl);
                if (!response.ok) {
                    console.warn('Could not fetch popular searches. Collection might not exist yet.');
                    setPopularSearches([]);
                    return;
                }
                const data = await response.json();
                const queries = data.documents?.map((doc: any) => doc.fields.query?.stringValue?.toLowerCase().trim()) || [];
                
                const queryCounts: { [key: string]: number } = {};
                queries.forEach((q: string) => {
                    if (q) {
                       queryCounts[q] = (queryCounts[q] || 0) + 1;
                    }
                });

                const sortedQueries = Object.keys(queryCounts)
                    .sort((a, b) => queryCounts[b] - queryCounts[a])
                    .slice(0, 5);
                
                setPopularSearches(sortedQueries);

            } catch (error) {
                console.error("Error fetching popular searches:", error);
            } finally {
                setIsLoadingPopular(false);
            }
        };

        fetchPopularSearches();
    }, []);

    const recommendations = useMemo(() => {
        const thirtyFiveDaysAgo = Date.now() - (35 * 24 * 60 * 60 * 1000);
        
        const calculateViews = (novel: Novel): number => {
            return (parseInt(novel.id.replace(/\D/g, '').slice(0, 5), 10) * 123) % 1000000;
        };

        return novels
            .filter(n => parseInt(n.id) > thirtyFiveDaysAgo)
            .sort((a, b) => calculateViews(b) - calculateViews(a))
            .slice(0, 6);
    }, [novels]);

    const handleSearch = (searchQuery: string) => {
        const trimmedQuery = searchQuery.trim();
        setQuery(trimmedQuery);

        if (!trimmedQuery) {
            setSearchResults(null);
            return;
        }

        const lowerCaseQuery = trimmedQuery.toLowerCase();
        const updatedRecent = [lowerCaseQuery, ...recentSearches.filter(s => s !== lowerCaseQuery)].slice(0, 5);
        setRecentSearches(updatedRecent);
        saveRecentSearches(updatedRecent);
        
        logSearchQuery(trimmedQuery);

        const results = novels.filter(novel => 
            novel.title.toLowerCase().includes(lowerCaseQuery) ||
            novel.author?.toLowerCase().includes(lowerCaseQuery) ||
            novel.genre?.toLowerCase().includes(lowerCaseQuery) ||
            novel.tag?.toLowerCase().includes(lowerCaseQuery)
        );
        setSearchResults(results);
    };
    
    const logSearchQuery = async (searchQuery: string) => {
        try {
            const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/searchAnalytics`;
            await fetch(firestoreUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fields: {
                        query: { stringValue: searchQuery },
                        timestamp: { timestampValue: new Date().toISOString() },
                        userId: { stringValue: currentUser?.localId || 'anonymous' }
                    }
                })
            });
        } catch (error) {
            console.error("Failed to log search query:", error);
        }
    };

    const handleRequestNovel = async () => {
        if (!query.trim()) return;
        
        if (!currentUser) {
            showToast('Please log in to request a novel.', 'error');
            return;
        }

        try {
            const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/novelRequests`;
            const response = await fetch(firestoreUrl, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${currentUser.idToken}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    fields: {
                        query: { stringValue: query },
                        timestamp: { timestampValue: new Date().toISOString() },
                        userId: { stringValue: currentUser.localId },
                        status: { stringValue: 'pending' }
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send request.');
            }
            showToast('Your request has been sent to the developers!', 'success');
        } catch (error) {
            console.error("Failed to request novel:", error);
            showToast('Could not send your request. Please try again.', 'error');
        }
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        saveRecentSearches([]);
    };
    
    const SearchChip: React.FC<{text: string}> = ({ text }) => (
        <button
            onClick={() => handleSearch(text)}
            className="bg-neutral-800 text-neutral-300 px-4 py-2 rounded-full text-sm hover:bg-neutral-700 hover:text-white transition-colors whitespace-nowrap"
        >
            {text}
        </button>
    );

    const renderInitialView = () => (
        <>
            {recentSearches.length > 0 && (
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white">Recent Searches</h2>
                        <button onClick={clearRecentSearches} className="text-sm text-neutral-500 hover:text-white">Clear</button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {recentSearches.map((term, index) => <SearchChip key={index} text={term} />)}
                    </div>
                </section>
            )}

            <section>
                <h2 className="text-xl font-bold text-white mb-4">Popular Searches</h2>
                {isLoadingPopular ? (
                    <div className="flex flex-wrap gap-3">
                        <SkeletonLine className="h-10 w-24 rounded-full" />
                        <SkeletonLine className="h-10 w-32 rounded-full" />
                        <SkeletonLine className="h-10 w-28 rounded-full" />
                        <SkeletonLine className="h-10 w-20 rounded-full" />
                    </div>
                ) : popularSearches.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                        {popularSearches.map((term, index) => <SearchChip key={index} text={term} />)}
                    </div>
                ) : (
                    <p className="text-neutral-500 text-sm">No popular searches yet.</p>
                )}
            </section>

            {recommendations.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold text-white mb-4">You Might Like</h2>
                    <NovelGrid novels={recommendations} onNovelClick={onNovelClick} />
                </section>
            )}
        </>
    );

    const renderResultsView = () => (
        <>
            {searchResults && searchResults.length > 0 ? (
                <section>
                    <h2 className="text-xl font-bold text-white mb-4">
                        Results for "{query}"
                    </h2>
                    <NovelGrid novels={searchResults} onNovelClick={onNovelClick} />
                </section>
            ) : (
                <div className="text-center py-20 px-6 bg-neutral-800/50 rounded-lg">
                    <i className="fas fa-search text-5xl text-neutral-600 mb-6"></i>
                    <h2 className="text-2xl font-bold text-white mb-2">No results for "{query}"</h2>
                    <p className="text-neutral-400 max-w-sm mx-auto mb-8">We couldn't find what you're looking for. Try another search or request this novel from our team.</p>
                    <button
                        onClick={handleRequestNovel}
                        className="bg-primary text-black font-bold py-3 px-6 rounded-full hover:bg-green-400 transition-colors"
                    >
                        Request This Novel
                    </button>
                </div>
            )}
        </>
    );


    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">Search</h1>
                <form onSubmit={(e) => { e.preventDefault(); handleSearch(query); }} className="relative mt-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-search text-neutral-500"></i>
                    </div>
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onBlur={() => handleSearch(query)}
                        className="block w-full bg-neutral-800 border border-transparent rounded-lg py-3 pl-10 pr-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="Series, creators, categories, and more"
                        aria-label="Search for series, creators, categories, and more"
                    />
                </form>
            </div>
            
            {searchResults === null ? renderInitialView() : renderResultsView()}
        </div>
    );
};

export default SearchPage;
