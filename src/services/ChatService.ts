import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { firestore } from '../firebase/config';
import { Chat, Message } from '../models/types';

export const createChat = async (participants: string[]): Promise<string> => {
  try {
    const chatRef = await addDoc(collection(firestore, 'chats'), {
      participants,
      createdAt: serverTimestamp(),
      lastMessage: null
    });
    return chatRef.id;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
};

export const sendMessage = async (
  chatId: string,
  senderId: string,
  text: string
): Promise<void> => {
  try {
    // Add message
    await addDoc(collection(firestore, 'messages'), {
      chatId,
      senderId,
      text,
      createdAt: serverTimestamp(),
      read: false
    });

    // Update chat's last message
    await updateDoc(doc(firestore, 'chats', chatId), {
      lastMessage: {
        text,
        senderId,
        timestamp: serverTimestamp()
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getUserChats = async (userId: string): Promise<Chat[]> => {
  try {
    const q = query(
      collection(firestore, 'chats'),
      where('participants', 'array-contains', userId),
      orderBy('lastMessage.timestamp', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Chat);
  } catch (error) {
    console.error('Error getting user chats:', error);
    throw error;
  }
};

export const subscribeToMessages = (
  chatId: string,
  callback: (messages: Message[]) => void
) => {
  const q = query(
    collection(firestore, 'messages'),
    where('chatId', '==', chatId),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Message[];
    callback(messages);
  });
};

export const markMessagesAsRead = async (
  chatId: string,
  userId: string
): Promise<void> => {
  try {
    const q = query(
      collection(firestore, 'messages'),
      where('chatId', '==', chatId),
      where('senderId', '!=', userId),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    const batch = firestore.batch();
    
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};