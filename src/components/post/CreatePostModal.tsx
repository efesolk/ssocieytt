import { useState, ChangeEvent, FormEvent } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { X, Code, Image, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { firestore, storage } from '../../firebase/config';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { v4 as uuidv4 } from 'uuid';

interface CreatePostModalProps {
  onClose: () => void;
}

const CreatePostModal = ({ onClose }: CreatePostModalProps) => {
  const { user } = useAuth();
  const [caption, setCaption] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      let imageUrl = null;
      
      // Upload image if provided
      if (image) {
        const storageRef = ref(storage, `posts/${user.uid}/${uuidv4()}`);
        const uploadTask = uploadBytesResumable(storageRef, image);
        
        // Wait for upload to complete
        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            () => {},
            (error) => {
              reject(error);
            },
            async () => {
              imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      }
      
      // Create post document
      await addDoc(collection(firestore, 'posts'), {
        userId: user.uid,
        caption,
        code: code.trim() || null,
        language: code.trim() ? language : null,
        imageUrl,
        likes: [],
        commentsCount: 0,
        createdAt: serverTimestamp(),
      });
      
      onClose();
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-dark-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-4 border-b border-dark-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Create Post</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="m-4 p-3 bg-red-900/30 border border-red-800 rounded-md text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4">
          <div className="input-group">
            <label htmlFor="caption" className="input-label">
              Caption
            </label>
            <textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full min-h-[80px] resize-y"
              placeholder="Write a caption..."
              required
            ></textarea>
          </div>

          <div className="input-group">
            <label htmlFor="code" className="input-label flex items-center">
              <Code className="h-4 w-4 mr-2" />
              Code (optional)
            </label>
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
            </div>
            <textarea
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full min-h-[150px] font-mono resize-y"
              placeholder="// Paste your code here"
            ></textarea>

            {code && (
              <div className="mt-4 rounded-md overflow-hidden">
                <div className="bg-dark-900 text-xs px-4 py-2 text-gray-400">Preview</div>
                <SyntaxHighlighter
                  language={language}
                  style={atomOneDark}
                  className="text-sm"
                  customStyle={{ margin: 0, maxHeight: '300px' }}
                >
                  {code}
                </SyntaxHighlighter>
              </div>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="image" className="input-label flex items-center">
              <Image className="h-4 w-4 mr-2" />
              Image (optional)
            </label>
            <div className="flex items-center space-x-2">
              <label className="btn btn-outline cursor-pointer">
                <span>Select Image</span>
                <input
                  type="file"
                  id="image"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </label>
              {image && (
                <span className="text-sm text-gray-400">
                  {image.name} ({Math.round(image.size / 1024)} KB)
                </span>
              )}
            </div>

            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-[300px] rounded-md object-contain bg-dark-900"
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline mr-2"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                  Posting...
                </span>
              ) : (
                'Share'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreatePostModal;