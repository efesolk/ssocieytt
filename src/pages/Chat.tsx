import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { firestore } from '../firebase/config';
import { Message, User } from '../models/types';
import { 
  ArrowLeft, 
  Send, 
  Image as ImageIcon, 
  Code,
  User as UserIcon,
  Loader
} from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const Chat = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!chatId || !user) return;

    const fetchOtherUser = async () => {
      try {
        const chatDoc = await getDocs(query(
          collection(firestore, 'chats'),
          where('id', '==', chatId)
        ));

        if (!chatDoc.empty) {
          const chatData = chatDoc.docs[0].data();
          const otherUserId = chatData.participants.find((id: string) => id !== user.uid);

          const userDoc = await getDocs(query(
            collection(firestore, 'users'),
            where('uid', '==', otherUserId)
          ));

          if (!userDoc.empty) {
            setOtherUser(userDoc.docs[0].data() as User);
          }
        }
      } catch (err) {
        console.error('Error fetching other user:', err);
      }
    };

    fetchOtherUser();

    // Subscribe to messages
    const unsubscribe = onSnapshot(
      query(
        collection(firestore, 'messages'),
        where('chatId', '==', chatId),
        orderBy('createdAt', 'asc')
      ),
      (snapshot) => {
        const newMessages: Message[] = [];
        snapshot.forEach((doc) => {
          newMessages.push({ id: doc.id, ...doc.data() } as Message);
        });
        setMessages(newMessages);
        setLoading(false);
        scrollToBottom();
      },
      (err) => {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [chatId, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!user || !chatId || (!newMessage.trim() && !code.trim())) return;

    try {
      await addDoc(collection(firestore, 'messages'), {
        chatId,
        senderId: user.uid,
        text: newMessage.trim() || null,
        codeSnippet: code.trim() || null,
        language: code.trim() ? language : null,
        createdAt: serverTimestamp(),
        read: false
      });

      setNewMessage('');
      setCode('');
      setShowCodeInput(false);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    // TODO: Implement image upload
    console.log('Image upload not implemented yet', file);
  };

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'cpp', label: 'C++' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'sql', label: 'SQL' },
    { value: 'bash', label: 'Bash' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader className="animate-spin h-8 w-8 text-secondary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-900/30 border border-red-800 rounded-md p-4 text-red-200">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl h-[calc(100vh-4rem)]">
      {/* Chat header */}
      <div className="flex items-center mb-4">
        <Link to="/messages" className="mr-4">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        {otherUser ? (
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-dark-600">
              {otherUser.photoURL ? (
                <img
                  src={otherUser.photoURL}
                  alt={otherUser.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
              )}
            </div>
            <div className="ml-3">
              <h2 className="font-medium">{otherUser.displayName}</h2>
              <p className="text-sm text-gray-400">@{otherUser.username}</p>
            </div>
          </div>
        ) : (
          <div className="animate-pulse flex items-center">
            <div className="w-10 h-10 rounded-full bg-dark-600"></div>
            <div className="ml-3">
              <div className="h-4 w-24 bg-dark-600 rounded"></div>
              <div className="h-3 w-16 bg-dark-600 rounded mt-2"></div>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.senderId === user?.uid ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.senderId === user?.uid
                  ? 'bg-secondary-600 text-white'
                  : 'bg-dark-700'
              }`}
            >
              {message.text && <p className="break-words">{message.text}</p>}
              
              {message.codeSnippet && (
                <div className="mt-2 rounded-md overflow-hidden">
                  <SyntaxHighlighter
                    language={message.language || 'javascript'}
                    style={atomOneDark}
                    customStyle={{ margin: 0 }}
                  >
                    {message.codeSnippet}
                  </SyntaxHighlighter>
                </div>
              )}

              {message.imageUrl && (
                <img
                  src={message.imageUrl}
                  alt="Message attachment"
                  className="max-w-full rounded-md mt-2"
                />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="border-t border-dark-700 pt-4">
        {showCodeInput && (
          <div className="mb-4">
            <div className="flex space-x-2 mb-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-dark-700 border border-dark-600 rounded-md px-3 py-2"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowCodeInput(false)}
                className="text-gray-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
              className="w-full h-32 bg-dark-700 border border-dark-600 rounded-md px-3 py-2 font-mono resize-none"
            />
          </div>
        )}

        <div className="flex items-center space-x-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-dark-700"
          >
            <ImageIcon size={20} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          
          <button
            onClick={() => setShowCodeInput(!showCodeInput)}
            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-dark-700"
          >
            <Code size={20} />
          </button>
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-dark-700 border border-dark-600 rounded-full px-4 py-2"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() && !code.trim()}
            className="p-2 text-secondary-500 hover:text-secondary-400 rounded-full hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;