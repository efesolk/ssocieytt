import React, { useContext, createContext } from 'react';
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { formatDistanceToNow } from 'date-fns';
import { BellIcon } from 'lucide-react';

interface User {
  uid: string;
  // Add other user properties as needed
}

interface AuthContextType {
  currentUser: User | null;
}

const AuthContext = createContext<AuthContextType>({ currentUser: null });

export const useAuth = () => useContext(AuthContext);

interface Notification {
  id: string;
  type: 'like' | 'comment';
  postId: string;
  senderId: string;
  senderName: string;
  senderPhotoURL: string;
  createdAt: string;
  content?: string;
}

export default function NotificationsPage() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('receiverId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Notification[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Notification, 'id'>),
      }));
      setNotifications(data);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
        <BellIcon className="w-6 h-6" /> Bildirimler
      </h1>
      {notifications.length === 0 ? (
        <p className="text-gray-500">yakında...</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notif) => (
            <li
              key={notif.id}
              className="border p-3 rounded-xl shadow-sm bg-white hover:bg-gray-50"
            >
              <div className="flex items-start gap-3">
                <img
                  src={notif.senderPhotoURL}
                  alt={notif.senderName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm">
                    <span className="font-semibold">{notif.senderName}</span>
                    {notif.type === 'like' ? ' gönderini beğendi.' : ' yorum yaptı:'}
                  </p>
                  {notif.type === 'comment' && notif.content && (
                    <p className="text-sm text-gray-600 mt-1">"{notif.content}"</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(notif.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
