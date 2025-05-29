import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageSquare, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import { Post } from '../../models/types';
import { useAuth } from '../../hooks/useAuth';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.likes.includes(user?.uid || ''));
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [showComments, setShowComments] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
    // TODO: Update like in Firestore
  };

  const getFormattedDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate();
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div className="card overflow-hidden">
      {/* Post header */}
      <div className="p-4 flex items-center justify-between">
        <Link to={`/profile/${post.userId}`} className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-dark-600 overflow-hidden">
            {post.user?.photoURL ? (
              <img 
                src={post.user.photoURL} 
                alt={post.user.displayName} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg font-semibold">
                {post.user?.displayName.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div className="ml-3">
            <h3 className="font-medium">{post.user?.displayName || 'User'}</h3>
            <p className="text-sm text-gray-400">@{post.user?.username || 'username'}</p>
          </div>
        </Link>
        <button className="text-gray-400 hover:text-white">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Post image */}
      {post.imageUrl && (
        <div className="w-full bg-dark-900">
          <img 
            src={post.imageUrl} 
            alt="Post" 
            className="w-full object-cover max-h-[500px]"
          />
        </div>
      )}

      {/* Post code */}
      {post.code && (
        <div className="border-t border-dark-700">
          <SyntaxHighlighter
            language={post.language || 'javascript'}
            style={atomOneDark}
            customStyle={{ margin: 0, padding: '16px' }}
          >
            {post.code}
          </SyntaxHighlighter>
        </div>
      )}

      {/* Post actions */}
      <div className="p-4 border-t border-dark-700">
        <div className="flex justify-between mb-3">
          <div className="flex space-x-4">
            <button 
              onClick={handleLike}
              className={`flex items-center ${liked ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}
            >
              <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
            </button>
            <button 
              onClick={() => setShowComments(!showComments)}
              className="text-gray-400 hover:text-white flex items-center"
            >
              <MessageSquare size={20} />
            </button>
            <button className="text-gray-400 hover:text-white flex items-center">
              <Share2 size={20} />
            </button>
          </div>
          <button className="text-gray-400 hover:text-white flex items-center">
            <Bookmark size={20} />
          </button>
        </div>

        {/* Likes count */}
        <div className="mb-2">
          <p className="text-sm font-medium">
            {likesCount} {likesCount === 1 ? 'like' : 'likes'}
          </p>
        </div>

        {/* Caption */}
        <div className="mb-2">
          <p>
            <Link to={`/profile/${post.userId}`} className="font-medium mr-2">
              {post.user?.username || 'username'}
            </Link>
            {post.caption}
          </p>
        </div>

        {/* Comments */}
        {post.commentsCount > 0 && (
          <Link to={`/post/${post.id}`} className="text-gray-400 text-sm">
            View all {post.commentsCount} comments
          </Link>
        )}

        {/* Timestamp */}
        <p className="text-gray-500 text-xs mt-2">
          {getFormattedDate(post.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default PostCard;