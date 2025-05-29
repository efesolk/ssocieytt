
import { useEffect, useRef, useState } from "react";
import { sendMessage, listenToMessages } from "../../services/MessageService";
import { Message } from "../../models/types";
import { useAuth } from "../../hooks/useAuth";

interface ChatProps {
  conversationId: string;
}

const Chat = ({ conversationId }: ChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsubscribe = listenToMessages(conversationId, setMessages);
    return () => unsubscribe();
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && user?.id) {
      await sendMessage(conversationId, user.id, newMessage);
      setNewMessage("");
    }
  };

  return (
    <div className="flex flex-col h-[500px] border rounded-xl p-4 overflow-hidden">
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 rounded-md max-w-xs ${
              msg.senderId === user?.id ? "bg-blue-500 text-white ml-auto" : "bg-gray-200"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex mt-2 gap-2">
        <input
          type="text"
          className="flex-1 border rounded-md px-3 py-1"
          placeholder="Mesaj yaz..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button onClick={handleSendMessage} className="bg-blue-600 text-white px-4 py-1 rounded-md">
          Gönder
        </button>
      </div>
    </div>
  );
};

export default Chat;
