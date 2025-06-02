import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../ui/Avatar';
import { formatRelativeTime } from '../../lib/utils';
import { Comment } from '../../types';

interface CommentListProps {
  comments: Comment[];
}

export const CommentList: React.FC<CommentListProps> = ({ comments }) => {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400 py-2">
        No comments yet. Be the first to comment!
      </p>
    );
  }

  return (
    <div className="space-y-3 mb-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex space-x-3">
          <Link to={`/profile/${comment.authorId}`}>
            <Avatar src={comment.authorPhotoURL} alt={comment.authorName} size="xs" />
          </Link>
          
          <div className="flex-1">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
              <div className="flex items-center space-x-2">
                <Link to={`/profile/${comment.authorId}`} className="font-medium text-slate-900 dark:text-white text-sm hover:underline">
                  {comment.authorName}
                </Link>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {formatRelativeTime(comment.createdAt)}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{comment.content}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};