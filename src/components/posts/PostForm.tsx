import React, { useState, useRef } from 'react';
import { Image, X } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { User } from '../../types';

interface PostFormProps {
  currentUser: User;
  onSubmit: (content: string, image?: File, gameTag?: string) => Promise<void>;
}

export const PostForm: React.FC<PostFormProps> = ({ currentUser, onSubmit }) => {
  const [content, setContent] = useState('');
  const [gameTag, setGameTag] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && !image) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(content, image || undefined, gameTag || undefined);
      setContent('');
      setGameTag('');
      clearImage();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <div className="flex space-x-4">
            <Avatar
              src={currentUser.photoURL}
              alt={currentUser.displayName}
              size="md"
            />
            
            <div className="flex-1">
              <textarea
                placeholder="Share your gaming moments..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3 text-slate-900 dark:text-white placeholder:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none min-h-[100px]"
              />
              
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="Game tag (optional)"
                  value={gameTag}
                  onChange={(e) => setGameTag(e.target.value)}
                  className="px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                
                <div className="flex-1 flex justify-end space-x-2">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    id="post-image"
                  />
                  
                  <label
                    htmlFor="post-image"
                    className="inline-flex items-center justify-center p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    <Image className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                  </label>
                  
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    disabled={isSubmitting || (!content.trim() && !image)}
                  >
                    Post
                  </Button>
                </div>
              </div>
              
              {imagePreview && (
                <div className="mt-3 relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-auto max-h-[300px] object-contain rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 p-1 rounded-full bg-slate-800/70 text-white hover:bg-slate-900/70"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};