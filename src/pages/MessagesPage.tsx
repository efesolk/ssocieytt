import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { Header } from '../components/layout/Header';
import { db } from '../config/firebase';
import { ChatList } from '../components/chat/ChatList';
import { ChatRoom } from '../components/chat/ChatRoom';
import { VoiceChatRoom } from '../components/chat/VoiceChatRoom';
import { Loading } from '../components/ui/Loading';
import { User, Chat } from '../types';

export function MessagesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [chats, setChats] = useState<Chat[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVoiceChat, setShowVoiceChat] = useState(false);
  const [showUserList, setShowUserList] = useState(false);

  useEffect(() => {
    if (!user && !loading) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;

    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', user.uid));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatsData: Chat[] = [];
      const usersToFetch = new Set<string>();

      snapshot.forEach((doc) => {
        const chatData = doc.data() as Chat;
        chatsData.push({ ...chatData, id: doc.id });
        chatData.participants.forEach((userId) => {
          if (userId !== user.uid) {
            usersToFetch.add(userId);
          }
        });
      });

      const usersData: Record<string, User> = {};

      await Promise.all(
        Array.from(usersToFetch).map(async (userId) => {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            usersData[userId] = userDoc.data() as User;
          }
        })
      );

      setChats(chatsData);
      setUsers(usersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const usersRef = collection(db, 'users');
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({ ...(doc.data() as User), id: doc.id }))
        .filter((u) => u.id !== user.uid);
      setAllUsers(data);
    });

    return () => unsubscribe();
  }, [user]);

  const startChat = async (otherUserId: string) => {
    const existingChat = chats.find(
      (chat) => chat.participants.includes(otherUserId)
    );

    if (existingChat) {
      handleSelectChat(existingChat.id, otherUserId);
      return;
    }

    const chatDoc = await addDoc(collection(db, 'chats'), {
      participants: [user!.uid, otherUserId],
      createdAt: serverTimestamp(),
    });

    handleSelectChat(chatDoc.id, otherUserId);
    setShowUserList(false);
  };

  const handleSelectChat = (chatId: string, userId: string) => {
    setSelectedChatId(chatId);
    setSelectedUserId(userId);
    setShowVoiceChat(false);
  };

  const handleVoiceChat = () => {
    setShowVoiceChat(true);
  };

  if (loading) return <Loading fullScreen text="Loading messages..." />;
  if (!user) return null;

  const selectedUser = selectedUserId ? users[selectedUserId] : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden h-[calc(100vh-16rem)]">
          <div className="grid grid-cols-1 md:grid-cols-3 h-full">
            <div className="col-span-1 h-full md:border-r border-slate-200 dark:border-slate-700 relative">
              <ChatList
                chats={chats}
                users={users}
                currentUserId={user.uid}
                selectedChatId={selectedChatId}
                onSelectChat={handleSelectChat}
              />
              {chats.length === 0 && (
                <div className="absolute bottom-4 left-4">
                  <button
                    onClick={() => setShowUserList(!showUserList)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full shadow"
                  >
                    <span className="text-lg font-bold">+</span>
                    <span>Başla</span>
                  </button>
                  {showUserList && (
                    <div className="mt-2 bg-white shadow-lg rounded-xl p-2 max-h-48 overflow-auto border">
                      {allUsers.map((u) => (
                        <div
                          key={u.id}
                          className="p-2 hover:bg-slate-100 cursor-pointer"
                          onClick={() => startChat(u.id)}
                        >
                          {u.displayName || u.email}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="col-span-2 h-full">
              {selectedUser ? (
                showVoiceChat ? (
                  <VoiceChatRoom currentUser={user} otherUser={selectedUser} />
                ) : (
                  <ChatRoom
                    currentUser={user}
                    otherUser={selectedUser}
                    onVoiceChat={handleVoiceChat}
                  />
                )
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                  <p>Select a conversation to start chatting</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ZEGOCLOUD SDK */}
      <script src="https://unpkg.com/@zegocloud/zego-uikit-prebuilt/zego-uikit-prebuilt.js"></script>
    </div>
  );
}
