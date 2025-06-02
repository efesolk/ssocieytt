import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUsers } from '../hooks/useUsers';
import { usePosts } from '../hooks/usePosts';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { PostCard } from '../components/posts/PostCard';
import { Loading } from '../components/ui/Loading';
import { Shield } from 'lucide-react';
import { User } from '../types';

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const { getUserById, followUser, unfollowUser } = useUsers();

  const {
    posts,
    loading: postsLoading,
    error: postsError,
    likePost,
    unlikePost,
    deletePost,
    addComment,
  } = usePosts(userId || '');

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setError("Kullanıcı ID'si eksik.");
        setLoading(false);
        return;
      }

      try {
        const user = await getUserById(userId);
        if (!user) {
          setError("Kullanıcı bulunamadı.");
        } else {
          setProfileUser(user);
        }
      } catch (err: any) {
        setError(err.message || "Bilinmeyen hata.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleFollow = (targetUserId: string) => {
    if (!currentUser) return;
    followUser(currentUser.uid, targetUserId);
  };

  const handleUnfollow = (targetUserId: string) => {
    if (!currentUser) return;
    unfollowUser(currentUser.uid, targetUserId);
  };

  const handleLikePost = (postId: string) => {
    if (!currentUser) return;
    likePost(postId, currentUser.uid);
  };

  const handleUnlikePost = (postId: string) => {
    if (!currentUser) return;
    unlikePost(postId, currentUser.uid);
  };

  const handleDeletePost = (postId: string) => {
    deletePost(postId);
  };

  const handleAddComment = (postId: string, content: string) => {
    if (!currentUser) return;
    addComment(
      postId,
      currentUser.uid,
      currentUser.displayName,
      currentUser.photoURL,
      content
    );
  };

  if (loading) {
    return <Loading fullScreen text="Profil yükleniyor..." />;
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
          <div className="text-center py-12">
            <h2 className="text-xl font-medium text-slate-900 dark:text-white mb-2">
              {error || "Kullanıcı bulunamadı"}
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Profil görüntülenemedi veya kullanıcı silinmiş olabilir.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isOwnProfile = currentUser?.uid === profileUser.uid;
  const isFollowing = currentUser?.following?.includes(profileUser.uid) || false;
  const canViewProfile = !profileUser.isPrivate || isOwnProfile || isFollowing;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 md:py-8 max-w-3xl">
        <ProfileHeader
          user={profileUser}
          currentUser={currentUser}
          isOwnProfile={isOwnProfile}
          onFollow={handleFollow}
          onUnfollow={handleUnfollow}
        />

        {!canViewProfile ? (
          <div className="mt-8 text-center p-8 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <Shield className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-slate-900 dark:text-white mb-2">
              Bu hesap gizli
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Paylaşımlarını görmek için takip etmelisin.
            </p>
          </div>
        ) : (
          <>
            {postsError && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                {postsError}
              </div>
            )}

            {postsLoading ? (
              <Loading text="Gönderiler yükleniyor..." className="mt-8" />
            ) : posts.length === 0 ? (
              <div className="mt-8 text-center p-8 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-medium text-slate-900 dark:text-white mb-2">
                  Henüz gönderi yok
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  {isOwnProfile
                    ? "Henüz hiçbir gönderi paylaşmadın."
                    : `${profileUser.displayName} henüz gönderi paylaşmadı.`}
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    onLike={handleLikePost}
                    onUnlike={handleUnlikePost}
                    onDelete={handleDeletePost}
                    onAddComment={handleAddComment}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
