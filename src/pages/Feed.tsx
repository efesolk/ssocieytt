import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, startAfter, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { where } from 'firebase/firestore';
import { firestore } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { Post, User } from '../models/types';
import PostCard from '../components/post/PostCard';
import { Loader } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

const POSTS_PER_PAGE = 5;

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView();

  // Initial posts load
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        const postsQuery = query(
          collection(firestore, 'posts'),
          orderBy('createdAt', 'desc'),
          limit(POSTS_PER_PAGE)
        );
        
        const snapshot = await getDocs(postsQuery);
        
        if (snapshot.empty) {
          setPosts([]);
          setHasMore(false);
          return;
        }
        
        // Get last visible document for pagination
        const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
        setLastVisible(lastVisibleDoc);
        
        // Process posts
        const postsData: Post[] = [];
        
        for (const doc of snapshot.docs) {
          const post = { id: doc.id, ...doc.data() } as Post;
          
          // Fetch user data for the post
          const userDoc = await getDocs(
            query(collection(firestore, 'users'), 
            where('uid', '==', post.userId))
          );
          
          if (!userDoc.empty) {
            post.user = { ...userDoc.docs[0].data() } as User;
          }
          
          postsData.push(post);
        }
        
        setPosts(postsData);
        setHasMore(snapshot.docs.length >= POSTS_PER_PAGE);
      } catch (err) {
        console.error('Error fetching posts:', err);
        console.error('Gönderiler alınırken hata oluştu:', error);
        setError('Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Load more posts when user scrolls to the bottom
  useEffect(() => {
    const loadMorePosts = async () => {
      if (inView && !loading && hasMore && lastVisible) {
        try {
          setLoading(true);
          
          const postsQuery = query(
            collection(firestore, 'posts'),
            orderBy('createdAt', 'desc'),
            startAfter(lastVisible),
            limit(POSTS_PER_PAGE)
          );
          
          const snapshot = await getDocs(postsQuery);
          
          if (snapshot.empty) {
            setHasMore(false);
            return;
          }
          
          // Update last visible document
          const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
          setLastVisible(lastVisibleDoc);
          
          // Process new posts
          const newPosts: Post[] = [];
          
          for (const doc of snapshot.docs) {
            const post = { id: doc.id, ...doc.data() } as Post;
            
            // Fetch user data for the post
            const userDoc = await getDocs(
              query(collection(firestore, 'users'), 
              where('uid', '==', post.userId))
            );
            
            if (!userDoc.empty) {
              post.user = { ...userDoc.docs[0].data() } as User;
            }
            
            newPosts.push(post);
          }
          
          setPosts(prevPosts => [...prevPosts, ...newPosts]);
          setHasMore(snapshot.docs.length >= POSTS_PER_PAGE);
        } catch (err) {
          console.error('Error loading more posts:', err);
          console.error('Gönderiler alınırken hata oluştu:', error);
        setError('Failed to load more posts');
        } finally {
          setLoading(false);
        }
      }
    };

    loadMorePosts();
  }, [inView, loading, hasMore, lastVisible]);

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
    <div className="container mx-auto px-4 py-6 max-w-xl">
      {posts.length === 0 && !loading ? (
        <div className="bg-dark-700 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Welcome to SSocieyt!</h2>
          <p className="text-gray-400 mb-4">
            No posts yet. Start by following some users or create your first post!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
          
          {/* Load more trigger */}
          {hasMore && (
            <div ref={ref} className="py-4 flex justify-center">
              {loading && <Loader className="animate-spin h-6 w-6 text-secondary-500" />}
            </div>
          )}
          
          {!hasMore && posts.length > 0 && (
            <div className="py-4 text-center text-gray-500">
              No more posts to load
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Feed;