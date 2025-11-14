
export interface Chapter {
  id: string; // Firestore document ID
  chapterNumber: number;
  title: string;
  status: 'published' | 'draft' | 'trashed';
  content?: string;
}

export interface Novel {
  id: string;
  title: string;
  author?: string;
  coverUrl: string;
  subtitle?: string;
  tag?: string;
  genre?: string;
  hasVideo?: boolean;
  imageUrls?: string[];
  description?: string;
  progress?: number; // 0-100
  status?: 'Ongoing' | 'Completed' | 'Hiatus';
  likes?: number;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  timestamp: string; // ISO string
  text: string;
  likes: number;
  dislikes: number;
  parentId?: string | null;
  replies?: Comment[];
  likedBy: string[];
  dislikedBy: string[];
  replyCount?: number;
  isSpoiler?: boolean;
}
