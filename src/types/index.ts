export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  createdAt: Date | string;
  bio?: string;
  isPrivate: boolean;
  gameUsernames?: {
    valorant?: string;
    csgo?: string;
    apex?: string;
    fortnite?: string;
  };
  followers: string[];
  following: string[];
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoURL: string;
  content: string;
  imageURL?: string;
  gameTag?: string;
  createdAt: Date | string;
  likes: string[];
  comments: Comment[];
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoURL: string;
  content: string;
  createdAt: Date | string;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: Date | string;
  unreadCount: {
    [userId: string]: number;
  };
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: Date | string;
  read: boolean;
}