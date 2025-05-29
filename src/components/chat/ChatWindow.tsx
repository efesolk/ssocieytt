
import { useEffect, useState } from "react";
import { sendMessage, listenToMessages } from "../../services/MessageService";
import { Message } from "../../models/types";
import MessageInput from "./MessageInput";

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
}

const ChatWindow = ({ conversationId, currentUserId }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const unsubscribe = listenToMessages(conversationId, setMessages);
    return () => unsubscribe();
  }, [conversationId]);

  return (
    <div className="flex flex-col border rounded-2xl shadow-md p-4 h-[500px] overflow-y-auto">
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={\`p-2 rounded-xl max-w-[70%] \${msg.senderId === currentUserId ? "bg-blue-500 text-white self-end ml-auto" : "bg-gray-200 text-black"}\`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <MessageInput
        onSend={(text) => sendMessage(conversationId, currentUserId, text)}
      />
    </div>
  );
};

export default ChatWindow;
