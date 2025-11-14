import React, { useState, useEffect } from 'react';
import { firebaseConfig } from '../../firebaseConfig';
import SkeletonLine from '../skeletons/SkeletonLine';

interface User {
  idToken: string;
  localId: string;
  email: string;
}

interface NoticeViewProps {
  currentUser: User | null;
}

interface Notice {
  id: string;
  title: string;
  content: string;
  timestamp: string;
}

const NoticeForm: React.FC<{ onSave: (title: string, content: string) => void, onCancel: () => void, isSaving: boolean }> = ({ onSave, onCancel, isSaving }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSave = () => {
        if (title.trim() && content.trim()) {
            onSave(title, content);
        }
    }

    return (
        <div className="bg-neutral-800 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">New Announcement</h2>
            <div className="space-y-4">
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="w-full bg-neutral-700 rounded-lg p-2 border border-neutral-600 focus:ring-primary focus:border-primary"/>
                <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Content (HTML supported)" rows={5} className="w-full bg-neutral-700 rounded-lg p-2 border border-neutral-600 focus:ring-primary focus:border-primary"></textarea>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
                <button onClick={onCancel} className="py-2 px-4 bg-neutral-600 text-white font-semibold rounded-lg hover:bg-neutral-500 transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={isSaving || !title.trim() || !content.trim()} className="py-2 px-4 bg-primary text-black font-bold rounded-lg hover:bg-green-400 transition-colors disabled:bg-primary/50">
                    {isSaving ? 'Sending...' : 'Send'}
                </button>
            </div>
        </div>
    )
}

const NoticeView: React.FC<NoticeViewProps> = ({ currentUser }) => {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

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
    
    useEffect(() => {
        fetchNotices();
    }, []);
    
    const handleSaveNotice = async (title: string, content: string) => {
        if (!currentUser) {
            alert("Authentication error.");
            return;
        }
        setIsSaving(true);
        try {
            const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/notices`;
            const body = { fields: {
                title: { stringValue: title },
                content: { stringValue: content },
                timestamp: { timestampValue: new Date().toISOString() },
            }};
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${currentUser.idToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!response.ok) throw new Error("Failed to save notice.");
            setIsFormVisible(false);
            fetchNotices();
        } catch (err) {
            alert("Could not save announcement.");
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDeleteNotice = async (id: string) => {
        if (!currentUser || !window.confirm("Delete this announcement permanently?")) return;
        try {
            const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/notices/${id}`;
            const response = await fetch(url, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${currentUser.idToken}` }
            });
            if (!response.ok) throw new Error("Failed to delete.");
            setNotices(notices.filter(n => n.id !== id));
        } catch (err) {
            alert("Could not delete announcement.");
        }
    }
    
    return (
        <div className="text-white">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Notice Management</h1>
                    <p className="text-neutral-400 mt-1">Create and manage in-app announcements.</p>
                </div>
                {!isFormVisible && (
                    <button onClick={() => setIsFormVisible(true)} className="bg-primary text-black font-bold py-2 px-4 rounded-lg hover:bg-green-400 transition-colors">
                        Create Notice
                    </button>
                )}
            </div>
            
            {isFormVisible && <NoticeForm onSave={handleSaveNotice} onCancel={() => setIsFormVisible(false)} isSaving={isSaving} />}
            
            {isLoading && <div className="text-center py-10"><i className="fas fa-spinner fa-spin text-2xl text-primary"></i></div>}
            {error && <p className="text-red-400">{error}</p>}
            
            <div className="space-y-4">
                {!isLoading && !error && notices.map(notice => (
                    <div key={notice.id} className="bg-neutral-800 p-4 rounded-lg flex justify-between items-start">
                        <div>
                            <p className="font-bold text-white">{notice.title}</p>
                            <p className="text-sm text-neutral-500">{new Date(notice.timestamp).toLocaleString()}</p>
                        </div>
                        <button onClick={() => handleDeleteNotice(notice.id)} className="text-red-500 hover:text-red-400 p-2 -mr-2"><i className="fas fa-trash"></i></button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default NoticeView;
