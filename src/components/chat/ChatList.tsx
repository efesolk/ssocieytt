import React, { useState, useEffect } from 'react';
import { formatRelativeTime } from '../../lib/utils';
import { Avatar } from '../ui/Avatar';
import { User, Chat } from '../../types';
import { collection, query, where, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface ChatListProps {
  chats: Chat[];
  users: Record<string, User>;
  currentUserId: string;
  selectedChatId: string | null;
  onSelectChat: (chatId: string, userId: string) => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  users,
  currentUserId,
  selectedChatId,
  onSelectChat,
}) => {
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch followed users (you can adapt this to your actual follow logic)
  useEffect(() => {
    const fetchFollowedUsers = async () => {
      try {
        const currentUserDoc = await getDoc(doc(db, 'users', currentUserId));
        const currentUserData = currentUserDoc.exists() ? currentUserDoc.data() : null;

        const followedIds: string[] = currentUserData?.following || [];

        if (!followedIds.length) return;

        const q = query(collection(db, 'users'), where('__name__', 'in', followedIds.slice(0, 10))); // Firestore max 10 'in' items
        const querySnapshot = await getDocs(q);

        const users: User[] = [];
        querySnapshot.forEach((doc) => {
          const user = doc.data() as User;
          users.push({ ...user, uid: doc.id });
        });

        setSuggestedUsers(users);
      } catch (err) {
        console.error('Error fetching followed users', err);
      }
    };

    fetchFollowedUsers();
  }, [currentUserId]);

  // Start chat with selected user
  const handleStartChat = async (otherUser: User) => {
    const chatId = [currentUserId, otherUser.uid].sort().join('_');

    const chatRef = doc(db, 'chats', chatId);
    const chatSnap = await getDoc(chatRef);

    if (!chatSnap.exists()) {
      await setDoc(chatRef, {
        participants: [currentUserId, otherUser.uid],
        lastMessage: '',
        lastMessageTime: null,
        unreadCount: {
          [currentUserId]: 0,
          [otherUser.uid]: 0,
        },
      });
    }

    onSelectChat(chatId, otherUser.uid);
    setShowSuggestions(false);
  };

  return (
    <div className="border-r border-slate-200 dark:border-slate-700 h-full overflow-y-auto">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Messages</h2>
        <button
          className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:underline"
          onClick={() => setShowSuggestions(!showSuggestions)}
        >
          <span>+</span>
          <span>Başla</span>
        </button>
      </div>

      {showSuggestions && (
        <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">Takip Ettiklerin:</p>
          {suggestedUsers.length > 0 ? (
            suggestedUsers.map((user) => (
              <div
                key={user.uid}
                className="flex items-center space-x-2 mb-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded"
                onClick={() => handleStartChat(user)}
              >
                <Avatar src={user.photoURL} alt={user.displayName} size="sm" />
                <p className="text-sm text-slate-800 dark:text-white">{user.displayName}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">Takip ettiğin kimse yok.</p>
          )}
        </div>
      )}

      {chats.length === 0 ? (
        <div className="p-4 text-center text-slate-500 dark:text-slate-400">
          No conversations yet
        </div>
      ) : (
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {chats.map((chat) => {
            const otherUserId = chat.participants.find((id) => id !== currentUserId) || '';
            const otherUser = users[otherUserId];

            if (!otherUser) return null;

            const unreadCount = chat.unreadCount?.[currentUserId] || 0;

            return (
              <div
                key={chat.id}
                className={`p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 ${
                  selectedChatId === chat.id ? 'bg-slate-100 dark:bg-slate-800' : ''
                }`}
                onClick={() => onSelectChat(chat.id, otherUserId)}
              >
                <div className="flex items-center space-x-3">
                  <Avatar src={otherUser.photoURL} alt={otherUser.displayName} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {otherUser.displayName}
                      </h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {chat.lastMessageTime ? formatRelativeTime(chat.lastMessageTime) : ''}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-sm text-slate-600 dark:text-slate-300 truncate">
                        {chat.lastMessage || 'Yeni sohbet'}
                      </p>
                      {unreadCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
