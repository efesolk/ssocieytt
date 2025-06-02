import React from 'react';
import { Link } from 'react-router-dom';
import { User as UserIcon, Lock } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { User } from '../../types';

interface UserCardProps {
  user: User;
  currentUser: User | null;
  onFollow: (userId: string) => void;
  onUnfollow: (userId: string) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  currentUser, 
  onFollow, 
  onUnfollow 
}) => {
  const isCurrentUser = currentUser?.uid === user.uid;
  const isFollowing = currentUser?.following.includes(user.uid) || false;
  
  const handleFollowToggle = () => {
    if (!currentUser) return;
    
    if (isFollowing) {
      onUnfollow(user.uid);
    } else {
      onFollow(user.uid);
    }
  };
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <Link to={`/profile/${user.uid}`}>
            <Avatar src={user.photoURL} alt={user.displayName} size="md" />
          </Link>
          
          <div className="flex-1 min-w-0">
            <Link to={`/profile/${user.uid}`} className="flex items-center">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {user.displayName}
              </h3>
              {user.isPrivate && (
                <Lock className="h-3 w-3 text-slate-500 dark:text-slate-400 ml-1" />
              )}
            </Link>
            
            <div className="flex items-center mt-1 text-xs text-slate-500 dark:text-slate-400">
              <UserIcon className="h-3 w-3 mr-1" />
              <span>
                {user.followers.length} {user.followers.length === 1 ? 'Player' : 'Players'}
              </span>
            </div>
            
            {user.bio && (
              <p className="mt-2 text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                {user.bio}
              </p>
            )}
          </div>
          
          {!isCurrentUser && currentUser && (
            <Button
              variant={isFollowing ? 'outline' : 'primary'}
              size="sm"
              onClick={handleFollowToggle}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};