import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getLikedPosts } from '../services/PostService';
import { Post } from '../models/types';
import PostCard from '../components/post/PostCard';
import { Loader, Heart } from 'lucide-react';

const LikedPosts = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLikedPosts = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const likedPosts = await getLikedPosts(user.uid);
        setPosts(likedPosts);
      } catch (err) {
        console.error('Error fetching liked posts:', err);
        setError('Failed to load liked posts');
      } finally {
        setLoading(false);
      }
    };

    fetchLikedPosts();
  }, [user]);

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
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Liked Posts</h1>
      
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <Heart size={48} className="mx-auto mb-4 text-gray-500" />
          <h3 className="text-xl font-semibold mb-2">No Liked Posts Yet</h3>
          <p className="text-gray-400">
            Posts you like will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LikedPosts;