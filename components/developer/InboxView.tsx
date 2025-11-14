
import React, { useState, useEffect } from 'react';
import { firebaseConfig } from '../../firebaseConfig';
import SkeletonLine from '../skeletons/SkeletonLine';

interface User {
  idToken: string;
  localId: string;
  email: string;
}

interface InboxViewProps {
  currentUser: User | null;
}

interface NovelRequest {
  id: string;
  query: string;
  timestamp: string;
  userId: string;
  status: 'pending' | 'resolved';
}

const InboxView: React.FC<InboxViewProps> = ({ currentUser }) => {
    const [requests, setRequests] = useState<NovelRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRequests = async () => {
            if (!currentUser) {
                setError("You must be logged in to view requests.");
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/novelRequests?orderBy=timestamp desc`;
                const response = await fetch(firestoreUrl, {
                    headers: { 'Authorization': `Bearer ${currentUser.idToken}` }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData?.error?.message || 'Failed to fetch requests.');
                }

                const data = await response.json();
                const fetchedRequests: NovelRequest[] = data.documents?.map((doc: any) => ({
                    id: doc.name.split('/').pop(),
                    query: doc.fields.query?.stringValue || 'N/A',
                    timestamp: doc.fields.timestamp?.timestampValue || new Date().toISOString(),
                    userId: doc.fields.userId?.stringValue || 'anonymous',
                    status: doc.fields.status?.stringValue || 'pending',
                })) || [];
                setRequests(fetchedRequests);
            } catch (err: any) {
                setError(err.message);
                console.error("Error fetching requests:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRequests();
    }, [currentUser]);
    
    return (
        <div className="text-white">
            <h1 className="text-3xl font-bold">Inbox: Novel Requests</h1>
            <p className="text-neutral-400 mt-1 mb-6">User-submitted requests for novels not found in the library.</p>
            
            {isLoading && (
                <div className="bg-neutral-800 rounded-lg shadow animate-pulse">
                    <ul className="divide-y divide-neutral-700">
                        {[...Array(4)].map((_, i) => (
                            <li key={i} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center">
                                <div className="w-full sm:w-2/3 space-y-2">
                                    <SkeletonLine className="h-6 w-1/2" />
                                    <SkeletonLine className="h-3 w-1/3" />
                                </div>
                                <div className="w-full sm:w-1/3 mt-2 sm:mt-0 space-y-2">
                                    <SkeletonLine className="h-4 w-full sm:w-3/4 ml-auto" />
                                    <SkeletonLine className="h-4 w-full sm:w-1/4 ml-auto" />
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {error && <div className="text-center py-10 text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>}
            
            {!isLoading && !error && (
                <div className="bg-neutral-800 rounded-lg shadow">
                    {requests.length === 0 ? (
                        <p className="text-center py-12 px-6 text-neutral-400">The inbox is empty. No new requests.</p>
                    ) : (
                        <ul className="divide-y divide-neutral-700">
                            {requests.map(req => (
                                <li key={req.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center">
                                    <div>
                                        <p className="font-bold text-lg">{req.query}</p>
                                        <p className="text-xs text-neutral-500 mt-1">User ID: {req.userId}</p>
                                    </div>
                                    <div className="text-sm text-neutral-400 mt-2 sm:mt-0 text-left sm:text-right">
                                        <p>{new Date(req.timestamp).toLocaleString()}</p>
                                        <p className={`capitalize font-semibold mt-1 ${req.status === 'pending' ? 'text-yellow-400' : 'text-green-400'}`}>{req.status}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default InboxView;
