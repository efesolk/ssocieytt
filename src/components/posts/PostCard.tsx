import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Trash2, Share2 } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Card, CardContent, CardFooter } from '../ui/Card';
import { formatRelativeTime } from '../../lib/utils';
import { Post, User } from '../../types';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';

interface PostCardProps {
  post: Post;
  currentUser: User | null;
  onLike: (postId: string) => void;
  onUnlike: (postId: string) => void;
  onDelete: (postId: string) => void;
  onAddComment: (postId: string, content: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  onLike,
  onUnlike,
  onDelete,
  onAddComment,
}) => {
  const [showComments, setShowComments] = useState(false);

  const isLiked = currentUser ? (post.likes ?? []).includes(currentUser.uid) : false;
  const isAuthor = currentUser && post.authorId === currentUser.uid;

  const handleLikeToggle = () => {
    if (!currentUser) return;
    isLiked ? onUnlike(post.id) : onLike(post.id);
  };

  const handleCommentSubmit = (content: string) => {
    if (!currentUser) return;
    onAddComment(post.id, content);
  };

  const createdAtDate = post.createdAt instanceof Date
    ? post.createdAt
    : new Date(post.createdAt);

  return (
    <Card className="mb-4 overflow-hidden">
      <div className="px-6 py-4 flex items-center justify-between">
        <Link to={`/profile/${post.authorId}`} className="flex items-center">
          <Avatar src={post.authorPhotoURL} alt={post.authorName} size="sm" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-slate-900 dark:text-white">
              {post.authorName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isNaN(createdAtDate.getTime()) ? 'Invalid date' : formatRelativeTime(createdAtDate)}
            </p>
          </div>
        </Link>

        {isAuthor && (
          <button
            onClick={() => onDelete(post.id)}
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="Delete post"
          >
            <Trash2 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          </button>
        )}
      </div>

      <CardContent className="pb-0">
        <p className="text-slate-900 dark:text-white whitespace-pre-line">
          {post.content}
        </p>

        {post.gameTag && (
          <span className="inline-block bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-full px-3 py-1 text-xs font-medium mt-2">
            #{post.gameTag}
          </span>
        )}

        {post.imageURL && (
          <div className="mt-3 rounded-md overflow-hidden">
            <img
              src={post.imageURL}
              alt="Post attachment"
              className="w-full h-auto object-cover"
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t-0 flex flex-col items-stretch">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLikeToggle}
              className="flex items-center space-x-1"
              disabled={!currentUser}
            >
              <Heart
                className={`h-5 w-5 ${
                  isLiked
                    ? 'fill-red-500 text-red-500'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {(post.likes ?? []).length}
              </span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1"
            >
              <MessageCircle className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {(post.comments ?? []).length}
              </span>
            </button>

            <button className="flex items-center space-x-1">
              <Share2 className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            </button>
          </div>
        </div>

        {showComments && (
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
            <CommentList comments={post.comments ?? []} />
            {currentUser && (
              <CommentForm onSubmit={handleCommentSubmit} />
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
