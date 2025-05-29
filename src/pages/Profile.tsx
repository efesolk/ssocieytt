import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../hooks/useUser';
import { 
  Settings, 
  Grid, 
  Bookmark, 
  Film,
  Heart,
  Loader,
  LinkIcon,
  Code,
  MessageSquare,
  User as UserIcon
} from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { firestore } from '../firebase/config';
import { followUser, unfollowUser } from '../services/UserService';

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const { user, loading, error } = useUser(userId);
  
  const [posts, setPosts] = useState<any[]>([]);
  const [reels, setReels] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(true);

  const isOwnProfile = currentUser?.uid === userId;

  useEffect(() => {
    if (user && currentUser) {
      setIsFollowing(user.followers?.includes(currentUser.uid));
    }
  }, [user, currentUser]);

  useEffect(() => {
    const fetchUserContent = async () => {
      if (!userId) return;
      
      try {
        setPostsLoading(true);
        
        // Fetch posts
        const postsQuery = query(
          collection(firestore, 'posts'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        const postsSnapshot = await getDocs(postsQuery);
        const postsData = postsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPosts(postsData);
        
        // Fetch reels
        const reelsQuery = query(
          collection(firestore, 'reels'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        const reelsSnapshot = await getDocs(reelsQuery);
        const reelsData = reelsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setReels(reelsData);
      } catch (err) {
        console.error('Error fetching user content:', err);
      } finally {
        setPostsLoading(false);
      }
    };
    
    fetchUserContent();
  }, [userId]);

  const handleFollow = async () => {
    if (!currentUser || !userId) return;
    
    try {
      setFollowLoading(true);
      
      if (isFollowing) {
        await unfollowUser(currentUser.uid, userId);
      } else {
        await followUser(currentUser.uid, userId);
      }
      
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error('Error updating follow status:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader className="animate-spin h-8 w-8 text-secondary-500" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-900/30 border border-red-800 rounded-md p-4 text-red-200">
          Failed to load user profile
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      {/* Profile header */}
      <div className="mb-8">
        <div className="flex items-center">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-dark-600 border-2 border-dark-500">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <UserIcon size={40} className="text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="ml-6">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-2xl font-bold">{user.displayName}</h1>
              {isOwnProfile ? (
                <Link to="/edit-profile" className="btn btn-outline text-sm py-1 px-3">
                  <Settings size={16} className="mr-1" /> Edit
                </Link>
              ) : (
                <button 
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`btn text-sm py-1 px-3 ${isFollowing ? 'btn-outline' : 'btn-primary'}`}
                >
                  {followLoading ? (
                    <Loader size={16} className="animate-spin" />
                  ) : isFollowing ? (
                    'Unfollow'
                  ) : (
                    'Follow'
                  )}
                </button>
              )}
            </div>
            
            <p className="text-gray-400 mb-2">@{user.username}</p>
            
            <div className="flex space-x-4">
              <div>
                <span className="font-bold">{posts.length}</span>{' '}
                <span className="text-gray-400">posts</span>
              </div>
              <div>
                <span className="font-bold">{user.followers?.length || 0}</span>{' '}
                <span className="text-gray-400">followers</span>
              </div>
              <div>
                <span className="font-bold">{user.following?.length || 0}</span>{' '}
                <span className="text-gray-400">following</span>
              </div>
            </div>
          </div>
        </div>
        
        {user.bio && (
          <p className="mt-4 text-gray-200">{user.bio}</p>
        )}
      </div>
      
      {/* Tabs */}
      <div className="border-t border-dark-700">
        <div className="flex">
          <button
            className={`flex-1 py-3 flex justify-center items-center ${
              activeTab === 'posts' ? 'border-b-2 border-white' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('posts')}
          >
            <Grid size={16} className="mr-2" /> Posts
          </button>
          <button
            className={`flex-1 py-3 flex justify-center items-center ${
              activeTab === 'reels' ? 'border-b-2 border-white' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('reels')}
          >
            <Film size={16} className="mr-2" /> Reels
          </button>
          {isOwnProfile && (
            <button
              className={`flex-1 py-3 flex justify-center items-center ${
                activeTab === 'saved' ? 'border-b-2 border-white' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('saved')}
            >
              <Bookmark size={16} className="mr-2" /> Saved
            </button>
          )}
          {isOwnProfile && (
            <button
              className={`flex-1 py-3 flex justify-center items-center ${
                activeTab === 'liked' ? 'border-b-2 border-white' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('liked')}
            >
              <Heart size={16} className="mr-2" /> Liked
            </button>
          )}
        </div>
      </div>
      
      {/* Content */}
      {postsLoading ? (
        <div className="flex justify-center py-12">
          <Loader className="animate-spin h-8 w-8 text-secondary-500" />
        </div>
      ) : (
        <div className="py-4">
          {activeTab === 'posts' && (
            <>
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mb-4 flex justify-center">
                    <Grid size={48} className="text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Posts Yet</h3>
                  <p className="text-gray-500">
                    {isOwnProfile 
                      ? "When you share code or images, they'll appear here."
                      : "This user hasn't posted anything yet."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1">
                  {posts.map(post => (
                    <Link 
                      key={post.id} 
                      to={`/post/${post.id}`}
                      className="aspect-square bg-dark-700 relative overflow-hidden group"
                    >
                      {post.imageUrl ? (
                        <img 
                          src={post.imageUrl} 
                          alt="Post" 
                          className="w-full h-full object-cover"
                        />
                      ) : post.code ? (
                        <div className="w-full h-full flex items-center justify-center bg-dark-900 overflow-hidden">
                          <Code size={30} className="text-secondary-500" />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-dark-800">
                          <LinkIcon size={30} className="text-gray-500" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Heart size={16} className="text-white" />
                            <span className="ml-1 text-white">{post.likes?.length || 0}</span>
                          </div>
                          <div className="flex items-center">
                            <MessageSquare size={16} className="text-white" />
                            <span className="ml-1 text-white">{post.commentsCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
          
          {activeTab === 'reels' && (
            <>
              {reels.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mb-4 flex justify-center">
                    <Film size={48} className="text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Reels Yet</h3>
                  <p className="text-gray-500">
                    {isOwnProfile 
                      ? "When you share reels, they'll appear here."
                      : "This user hasn't posted any reels yet."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1">
                  {reels.map(reel => (
                    <Link 
                      key={reel.id} 
                      to={`/reel/${reel.id}`}
                      className="aspect-[9/16] bg-dark-700 relative overflow-hidden group"
                    >
                      {/* Reel thumbnail/preview */}
                      {reel.thumbnail ? (
                        <img 
                          src={reel.thumbnail} 
                          alt="Reel" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-dark-800">
                          <Film size={30} className="text-gray-500" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Heart size={16} className="text-white" />
                            <span className="ml-1 text-white">{reel.likes?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
          
          {activeTab === 'saved' && isOwnProfile && (
            <div className="text-center py-12">
              <div className="mb-4 flex justify-center">
                <Bookmark size={48} className="text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Saved Items</h3>
              <p className="text-gray-500">
                Save posts and reels to view them later
              </p>
            </div>
          )}
          
          {activeTab === 'liked' && isOwnProfile && (
            <div className="text-center py-12">
              <div className="mb-4 flex justify-center">
                <Heart size={48} className="text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Liked Items</h3>
              <p className="text-gray-500">
                Posts and reels you've liked will appear here
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;