
import {
  collection,
  doc,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { firestore } from "../firebase/config";

export const sendMessage = async (
  conversationId: string,
  senderId: string,
  text: string
) => {
  try {
    const messagesRef = collection(
      firestore,
      "conversations",
      conversationId,
      "messages"
    );
    await addDoc(messagesRef, {
      senderId,
      text,
      timestamp: serverTimestamp(),
      seen: false,
    });
  } catch (error) {
    console.error("Mesaj gönderme hatası:", error);
  }
};

export const listenToMessages = (
  conversationId: string,
  callback: (messages: any[]) => void
) => {
  const messagesRef = collection(
    firestore,
    "conversations",
    conversationId,
    "messages"
  );
  const q = query(messagesRef, orderBy("timestamp", "asc"));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(messages);
  });
};
