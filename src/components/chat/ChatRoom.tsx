import React, { useState, useEffect, useRef } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { Send, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../../config/firebase';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { User, Message } from '../../types';
import { generateRoomId } from '../../lib/utils';

interface ChatRoomProps {
  currentUser: User;
  otherUser: User;
  onVoiceChat: () => void;
}

// Zaman formatı için güvenli helper fonksiyonu
function formatTime(timestamp: any): string {
  const date =
    timestamp instanceof Timestamp
      ? timestamp.toDate()
      : new Date(timestamp);

  if (isNaN(date.getTime())) return 'Invalid time';

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const ChatRoom: React.FC<ChatRoomProps> = ({
  currentUser,
  otherUser,
  onVoiceChat,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const roomId = generateRoomId(currentUser.uid, otherUser.uid);

  useEffect(() => {
    const messagesRef = collection(db, 'chats', roomId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData: Message[] = [];

      snapshot.forEach((doc) => {
        messagesData.push({ id: doc.id, ...doc.data() } as Message);
      });

      setMessages(messagesData);
      setLoading(false);

      // Scroll to bottom
      setTimeout(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, [roomId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    try {
      const messagesRef = collection(db, 'chats', roomId, 'messages');
      await addDoc(messagesRef, {
        chatId: roomId,
        senderId: currentUser.uid,
        content: newMessage,
        createdAt: serverTimestamp(),
        read: false,
      });

      setNewMessage('');

      // Scroll to bottom
      endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <Link to={`/profile/${otherUser.uid}`} className="flex items-center">
          <Avatar src={otherUser.photoURL} alt={otherUser.displayName} size="sm" />
          <span className="ml-3 font-medium text-slate-900 dark:text-white">
            {otherUser.displayName}
          </span>
        </Link>

        <Button
          size="sm"
          leftIcon={<Phone className="h-4 w-4" />}
          onClick={onVoiceChat}
        >
          Voice Chat
        </Button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center">
            <p className="text-slate-500 dark:text-slate-400">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-slate-500 dark:text-slate-400">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.senderId === currentUser.uid;
            const senderName = isCurrentUser ? 'Sen' : otherUser.displayName;

            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isCurrentUser && (
                  <Avatar
                    src={otherUser.photoURL}
                    alt={otherUser.displayName}
                    size="xs"
                    className="mr-2 self-end"
                  />
                )}

                <div
                  className={`max-w-[75%] px-4 py-2 rounded-lg ${
                    isCurrentUser
                      ? 'bg-red-600 text-white rounded-br-none'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  <div className="flex justify-between text-xs mt-1 opacity-70">
                    <span>{senderName}</span>
                    <span>{formatTime(message.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="border-t border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 text-slate-900 dark:text-white placeholder:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 rounded-full bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};
