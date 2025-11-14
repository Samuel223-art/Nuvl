import React, { useState, useEffect } from 'react';
import { firebaseConfig } from '../firebaseConfig';
import SkeletonLine from '../components/skeletons/SkeletonLine';

interface Notice {
  id: string;
  title: string;
  content: string;
  timestamp: string;
}

// Common header for static pages
const StaticPageHeader: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
  <header className="sticky top-0 z-10 bg-neutral-900">
    <div className="relative flex items-center justify-center py-4 px-4">
      <button onClick={onBack} className="absolute left-4 text-white" aria-label="Go back">
        <i className="fas fa-chevron-left text-2xl"></i>
      </button>
      <h1 className="text-xl font-bold text-white">{title}</h1>
    </div>
  </header>
);

const NoticeItem: React.FC<{ notice: Notice }> = ({ notice }) => {
    const [isOpen, setIsOpen] = useState(false);

    const formattedDate = new Date(notice.timestamp).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div className="bg-neutral-800 rounded-lg">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left p-4">
                <div>
                    <h2 className="font-bold text-white text-lg">{notice.title}</h2>
                    <p className="text-sm text-neutral-400 mt-1">{formattedDate}</p>
                </div>
                <i className={`fas fa-chevron-down text-neutral-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
            </button>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                <div className="px-4 pb-4 prose prose-invert max-w-none text-neutral-300" dangerouslySetInnerHTML={{ __html: notice.content }} />
            </div>
        </div>
    );
};


const NoticePage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotices = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/notices?key=${firebaseConfig.apiKey}&orderBy=timestamp desc`;
        const response = await fetch(firestoreUrl);
        if (!response.ok) throw new Error("Failed to fetch announcements.");
        const data = await response.json();
        const fetchedNotices: Notice[] = data.documents?.map((doc: any) => ({
          id: doc.name.split('/').pop(),
          title: doc.fields.title?.stringValue || 'No Title',
          content: doc.fields.content?.stringValue || '',
          timestamp: doc.fields.timestamp?.timestampValue || new Date().toISOString(),
        })) || [];
        setNotices(fetchedNotices);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotices();
  }, []);
  
  return (
    <div>
      <StaticPageHeader title="Notice" onBack={onBack} />
      <main className="px-4 py-6 space-y-4">
        {isLoading && [...Array(3)].map((_, i) => (
            <div key={i} className="bg-neutral-800 rounded-lg p-4 animate-pulse">
                <SkeletonLine className="h-6 w-3/4 mb-2" />
                <SkeletonLine className="h-4 w-1/3" />
            </div>
        ))}
        {error && <div className="text-center text-red-400">{error}</div>}
        {!isLoading && !error && notices.length === 0 && (
          <div className="text-center py-20 text-neutral-500">
            <i className="fas fa-bullhorn text-4xl mb-4"></i>
            <p>No announcements right now.</p>
          </div>
        )}
        {!isLoading && !error && notices.map(notice => <NoticeItem key={notice.id} notice={notice} />)}
      </main>
    </div>
  );
};

export default NoticePage;
