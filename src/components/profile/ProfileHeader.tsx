import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, Link as LinkIcon, Users, User as UserIcon, Shield } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { getTrackerLink } from '../../lib/utils';
import { User } from '../../types';

interface ProfileHeaderProps {
  user: User;
  currentUser: User | null;
  isOwnProfile: boolean;
  onFollow: (userId: string) => void;
  onUnfollow: (userId: string) => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  currentUser,
  isOwnProfile,
  onFollow,
  onUnfollow,
}) => {
  const isFollowing = currentUser?.following.includes(user.uid) || false;
  const canViewProfile = !user.isPrivate || isOwnProfile || isFollowing;
  
  const handleFollowToggle = () => {
    if (!currentUser) return;
    
    if (isFollowing) {
      onUnfollow(user.uid);
    } else {
      onFollow(user.uid);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden mb-6">
      {/* Cover Photo */}
      <div className="h-40 bg-gradient-to-r from-red-600 to-blue-700 relative" />
      
      {/* Profile Info */}
      <div className="px-6 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end -mt-16 mb-4 gap-4">
          <Avatar
            src={user.photoURL}
            alt={user.displayName}
            size="xl"
            className="ring-4 ring-white dark:ring-slate-900"
          />
          
          <div className="flex-1 mt-4 sm:mt-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {user.displayName}
                  </h1>
                  {user.isPrivate && (
                    <Shield className="h-4 w-4 text-slate-500 dark:text-slate-400 ml-2" />
                  )}
                </div>
                <div className="flex mt-1 space-x-4">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-slate-500 dark:text-slate-400 mr-1" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-medium">{user.followers.length}</span> Players
                    </span>
                  </div>
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 text-slate-500 dark:text-slate-400 mr-1" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-medium">{user.following.length}</span> Following
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {isOwnProfile ? (
                  <Link to="/settings/profile">
                    <Button
                      variant="outline"
                      leftIcon={<Settings className="h-4 w-4" />}
                    >
                      Edit Profile
                    </Button>
                  </Link>
                ) : currentUser ? (
                  <Button
                    variant={isFollowing ? 'outline' : 'primary'}
                    onClick={handleFollowToggle}
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        
        {/* Bio */}
        {user.bio && (
          <p className="text-slate-700 dark:text-slate-300 mt-4">{user.bio}</p>
        )}
        
        {/* Game Usernames */}
        {canViewProfile && user.gameUsernames && Object.keys(user.gameUsernames).length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-medium text-slate-900 dark:text-white">Game Profiles</h3>
            <div className="space-y-1">
              {user.gameUsernames.valorant && (
                <a
                  href={getTrackerLink(user.gameUsernames.valorant)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-500"
                >
                  <LinkIcon className="h-3 w-3 mr-2" />
                  <span className="font-medium mr-2">Valorant:</span>
                  {user.gameUsernames.valorant}
                </a>
              )}
              
              {user.gameUsernames.csgo && (
                <a
                  href={`https://tracker.gg/csgo/profile/steam/${encodeURIComponent(user.gameUsernames.csgo)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-500"
                >
                  <LinkIcon className="h-3 w-3 mr-2" />
                  <span className="font-medium mr-2">CS:GO:</span>
                  {user.gameUsernames.csgo}
                </a>
              )}
              
              {user.gameUsernames.apex && (
                <a
                  href={`https://tracker.gg/apex/profile/origin/${encodeURIComponent(user.gameUsernames.apex)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-500"
                >
                  <LinkIcon className="h-3 w-3 mr-2" />
                  <span className="font-medium mr-2">Apex:</span>
                  {user.gameUsernames.apex}
                </a>
              )}
              
              {user.gameUsernames.fortnite && (
                <a
                  href={`https://tracker.gg/fortnite/profile/all/${encodeURIComponent(user.gameUsernames.fortnite)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-500"
                >
                  <LinkIcon className="h-3 w-3 mr-2" />
                  <span className="font-medium mr-2">Fortnite:</span>
                  {user.gameUsernames.fortnite}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};