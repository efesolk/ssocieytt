import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, MessageSquare, Settings, Users, Calendar, MapPin } from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs, orderBy, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import PostCard from '../components/feed/PostCard';
import Loading from '../components/ui/Loading';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [tab, setTab] = useState('posts');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;

      try {
        const profileDoc = await getDoc(doc(db, 'users', id));
        
        if (profileDoc.exists()) {
          const profileData = profileDoc.data();
          setProfile(profileData);
          setFollowerCount(profileData.followers?.length || 0);
          setFollowingCount(profileData.following?.length || 0);
          
          if (user) {
            setIsFollowing(profileData.followers?.includes(user.uid) || false);
          }
        }

        // Fetch user's posts
        const q = query(
          collection(db, 'posts'),
          where('author.id', '==', id),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedPosts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setPosts(fetchedPosts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, user]);

  const handleFollow = async () => {
    if (!user || !id || user.uid === id) return;

    try {
      const userRef = doc(db, 'users', id);
      const currentUserRef = doc(db, 'users', user.uid);

      if (isFollowing) {
        // Unfollow
        await updateDoc(userRef, {
          followers: arrayRemove(user.uid)
        });
        await updateDoc(currentUserRef, {
          following: arrayRemove(id)
        });
        setFollowerCount(prev => prev - 1);
        toast.success('Unfollowed successfully');
      } else {
        // Follow
        await updateDoc(userRef, {
          followers: arrayUnion(user.uid)
        });
        await updateDoc(currentUserRef, {
          following: arrayUnion(id)
        });
        setFollowerCount(prev => prev + 1);
        
        // Create notification for the followed user
        const notificationData = {
          userId: id,
          type: 'follow',
          from: {
            id: user.uid,
            username: user.displayName || user.email?.split('@')[0],
            displayName: user.displayName || user.email?.split('@')[0],
            photoURL: user.photoURL || ''
          },
          content: `${user.displayName || user.email?.split('@')[0]} started following you`,
          resourceId: '',
          createdAt: new Date(),
          read: false
        };
        
        await addDoc(collection(db, 'notifications'), notificationData);
        toast.success('Following successfully');
      }

      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error updating follow status:', error);
      toast.error('Failed to update follow status');
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <p>User not found</p>
        <Link to="/" className="text-purple-500 hover:underline">Go back home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className={`rounded-xl shadow-md overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} mb-6`}>
        {/* Cover Photo */}
        <div className="h-32 bg-gradient-to-r from-purple-500 to-pink-500 relative">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        </div>
        
        <div className="px-6 py-4 relative">
          <div className="flex flex-col md:flex-row">
            {/* Profile Picture */}
            <div className="md:mr-6 flex flex-col items-center md:items-start">
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-purple-500 flex items-center justify-center -mt-16 shadow-xl">
                {profile.photoURL ? (
                  <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-white" />
                )}
              </div>
            </div>
            
            <div className="flex-1 mt-4 md:mt-0">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{profile.displayName}</h1>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>@{profile.username}</p>
                  {profile.createdAt && (
                    <div className={`flex items-center mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Calendar size={16} className="mr-1" />
                      <span className="text-sm">
                        Joined {new Date(profile.createdAt.toDate()).toLocaleDateString('en-US', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 md:mt-0 flex flex-col md:items-end space-y-2">
                  {user?.uid === profile.uid ? (
                    <Link 
                      to="/settings" 
                      className="px-6 py-2 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 font-medium flex items-center justify-center transition"
                    >
                      <Settings size={18} className="mr-2" />
                      Edit Profile
                    </Link>
                  ) : (
                    <div className="flex space-x-2">
                      <button 
                        onClick={handleFollow}
                        className={`px-6 py-2 rounded-lg font-medium transition ${
                          isFollowing 
                            ? 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                      >
                        <Users size={18} className="mr-2 inline" />
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                      
                      <Link 
                        to={`/messages/${profile.uid}`}
                        className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 font-medium flex items-center justify-center transition"
                      >
                        <MessageSquare size={18} className="mr-2" />
                        Message
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              
              {profile.bio && (
                <p className="mt-4">{profile.bio}</p>
              )}
              
              {/* Stats */}
              <div className="flex justify-start space-x-6 mt-4">
                <div className="text-center">
                  <div className="text-xl font-bold">{followerCount}</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{followingCount}</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Following</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{posts.length}</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Posts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Profile Tabs */}
        <div className={`flex border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={() => setTab('posts')}
            className={`flex-1 py-4 font-medium text-center ${
              tab === 'posts'
                ? 'text-purple-500 border-b-2 border-purple-500'
                : darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setTab('media')}
            className={`flex-1 py-4 font-medium text-center ${
              tab === 'media'
                ? 'text-purple-500 border-b-2 border-purple-500'
                : darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Media
          </button>
          <button
            onClick={() => setTab('likes')}
            className={`flex-1 py-4 font-medium text-center ${
              tab === 'likes'
                ? 'text-purple-500 border-b-2 border-purple-500'
                : darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Likes
          </button>
        </div>
      </div>
      
      {/* Content based on selected tab */}
      <div className="space-y-6">
        {tab === 'posts' && (
          posts.length > 0 ? (
            posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className={`p-8 text-center rounded-xl shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No posts yet
              </p>
            </div>
          )
        )}
        
        {tab === 'media' && (
          <div className={`p-8 text-center rounded-xl shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Media content will be displayed here
            </p>
          </div>
        )}
        
        {tab === 'likes' && (
          <div className={`p-8 text-center rounded-xl shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Liked posts will be displayed here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;