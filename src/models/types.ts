import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  photoURL: string | null;
  bio: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  followers: string[];
  following: string[];
}

export interface Post {
  id: string;
  userId: string;
  caption: string;
  code: string | null;
  language: string | null;
  imageUrl: string | null;
  likes: string[];
  commentsCount: number;
  createdAt: Timestamp;
  user?: User;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  text: string;
  createdAt: Timestamp;
  user?: User;
}

export interface Reel {
  id: string;
  userId: string;
  caption: string;
  videoUrl: string;
  thumbnail: string | null;
  code: string | null;
  language: string | null;
  likes: string[];
  commentsCount: number;
  createdAt: Timestamp;
  user?: User;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string | null;
  imageUrl: string | null;
  codeSnippet: string | null;
  language: string | null;
  createdAt: Timestamp;
  read: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage: string | null;
  lastMessageTime: Timestamp | null;
  lastMessageSenderId: string | null;
  unreadCount: Record<string, number>;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: any;
  seen: boolean;
}

export interface Conversation {
  id: string;
  users: string[];
}
