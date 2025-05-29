
import { useState } from "react";

interface MessageInputProps {
  onSend: (text: string) => void;
}

const MessageInput = ({ onSend }: MessageInputProps) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim()) {
      onSend(text);
      setText("");
    }
  };

  return (
    <div className="flex gap-2 mt-4">
      <input
        className="flex-1 p-2 border rounded-lg"
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Mesajınızı yazın..."
      />
      <button
        onClick={handleSend}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        Gönder
      </button>
    </div>
  );
};

export default MessageInput;
