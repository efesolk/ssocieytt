import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase/config';
import { Post, Comment, User } from '../models/types';
import { useAuth } from '../hooks/useAuth';
import { addComment, deleteComment } from '../services/PostService';
import { getUserById } from '../services/UserService';
import { ArrowLeft, Send, Loader, Trash2, User as UserIcon } from 'lucide-react';
import PostCard from '../components/post/PostCard';

const PostDetail = () => {
  const { postId } = useParams<{ postId: string }>();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPostAndComments = async () => {
      if (!postId) return;

      try {
        setLoading(true);
        
        // Fetch post
        const postDoc = await getDoc(doc(firestore, 'posts', postId));
        if (!postDoc.exists()) {
          setError('Post not found');
          return;
        }

        const postData = { id: postDoc.id, ...postDoc.data() } as Post;
        
        // Fetch post author
        const postUser = await getUserById(postData.userId);
        if (postUser) {
          postData.user = postUser;
        }

        setPost(postData);

        // Fetch comments
        const commentsSnapshot = await getDoc(doc(firestore, 'comments', postId));
        const commentsData = commentsSnapshot.data()?.comments || [];
        
        // Fetch user data for each comment
        const commentsWithUsers = await Promise.all(
          commentsData.map(async (comment: Comment) => {
            const commentUser = await getUserById(comment.userId);
            return { ...comment, user: commentUser };
          })
        );

        setComments(commentsWithUsers);
      } catch (err) {
        console.error('Error fetching post details:', err);
        setError('Failed to load post details');
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndComments();
  }, [postId]);

  const handleAddComment = async () => {
    if (!user || !post || !newComment.trim()) return;

    try {
      setSubmitting(true);
      
      const commentId = await addComment({
        postId: post.id,
        userId: user.uid,
        text: newComment.trim()
      });

      const commentUser = await getUserById(user.uid);
      
      setComments(prev => [{
        id: commentId,
        postId: post.id,
        userId: user.uid,
        text: newComment.trim(),
        createdAt: new Date(),
        user: commentUser
      }, ...prev]);

      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user || !post) return;

    try {
      await deleteComment(commentId, post.id);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader className="animate-spin h-8 w-8 text-secondary-500" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-900/30 border border-red-800 rounded-md p-4 text-red-200">
          {error || 'Failed to load post'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <Link to="/" className="flex items-center text-gray-400 hover:text-white">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Feed
        </Link>
      </div>

      <PostCard post={post} />

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Comments</h2>

        <div className="mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
            />
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim() || submitting}
              className="btn btn-primary"
            >
              {submitting ? (
                <Loader className="animate-spin h-4 w-4" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="bg-dark-700 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-dark-600">
                    {comment.user?.photoURL ? (
                      <img
                        src={comment.user.photoURL}
                        alt={comment.user.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <Link
                      to={`/profile/${comment.userId}`}
                      className="font-medium hover:text-secondary-500"
                    >
                      {comment.user?.displayName || 'User'}
                    </Link>
                    <p className="text-sm text-gray-400">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {user?.uid === comment.userId && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <p className="mt-2">{comment.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;