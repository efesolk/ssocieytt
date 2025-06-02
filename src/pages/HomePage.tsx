import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePosts } from '../hooks/usePosts';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { PostForm } from '../components/posts/PostForm';
import { PostCard } from '../components/posts/PostCard';
import { Loading } from '../components/ui/Loading';

export function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    posts,
    loading,
    error,
    addPost,
    likePost,
    unlikePost,
    deletePost,
    addComment,
  } = usePosts();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !loading) {
      navigate('/login');
    }
  }, [user, loading, navigate]);
  
  const handlePostSubmit = async (content: string, image?: File, gameTag?: string) => {
    if (!user) return;
    
    await addPost(
      user.uid,
      user.displayName,
      user.photoURL,
      content,
      image,
      gameTag
    );
  };
  
  const handleLikePost = (postId: string) => {
    if (!user) return;
    likePost(postId, user.uid);
  };
  
  const handleUnlikePost = (postId: string) => {
    if (!user) return;
    unlikePost(postId, user.uid);
  };
  
  const handleDeletePost = (postId: string) => {
    deletePost(postId);
  };
  
  const handleAddComment = (postId: string, content: string) => {
    if (!user) return;
    
    addComment(
      postId,
      user.uid,
      user.displayName,
      user.photoURL,
      content
    );
  };
  
  if (loading && !posts.length) {
    return <Loading fullScreen text="Loading feed..." />;
  }
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8 max-w-3xl">
        {user && <PostForm currentUser={user} onSubmit={handlePostSubmit} />}
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Welcome to GamersConnect!
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Start sharing your gaming moments or follow other players to see their posts.
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={user}
                onLike={handleLikePost}
                onUnlike={handleUnlikePost}
                onDelete={handleDeletePost}
                onAddComment={handleAddComment}
              />
            ))
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}