import { 
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  arrayUnion,
  arrayRemove,
  serverTimestamp
} from 'firebase/firestore';
import { firestore } from '../firebase/config';
import { Post, Comment } from '../models/types';

export const createPost = async (post: Omit<Post, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(firestore, 'posts'), {
      ...post,
      createdAt: serverTimestamp(),
      isDeleted: false
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

export const deletePost = async (postId: string): Promise<void> => {
  try {
    await updateDoc(doc(firestore, 'posts', postId), {
      isDeleted: true,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

export const likePost = async (postId: string, userId: string): Promise<void> => {
  try {
    await updateDoc(doc(firestore, 'posts', postId), {
      likes: arrayUnion(userId)
    });
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

export const unlikePost = async (postId: string, userId: string): Promise<void> => {
  try {
    await updateDoc(doc(firestore, 'posts', postId), {
      likes: arrayRemove(userId)
    });
  } catch (error) {
    console.error('Error unliking post:', error);
    throw error;
  }
};

export const addComment = async (comment: Omit<Comment, 'id' | 'createdAt'>): Promise<string> => {
  try {
    // Add the comment
    const commentRef = await addDoc(collection(firestore, 'comments'), {
      ...comment,
      createdAt: serverTimestamp()
    });

    // Update post's comment count
    const postRef = doc(firestore, 'posts', comment.postId);
    await updateDoc(postRef, {
      commentsCount: (await getDoc(postRef)).data()?.commentsCount + 1 || 1
    });

    return commentRef.id;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const deleteComment = async (commentId: string, postId: string): Promise<void> => {
  try {
    // Delete the comment
    await deleteDoc(doc(firestore, 'comments', commentId));

    // Update post's comment count
    const postRef = doc(firestore, 'posts', postId);
    await updateDoc(postRef, {
      commentsCount: (await getDoc(postRef)).data()?.commentsCount - 1 || 0
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

export const getLikedPosts = async (userId: string): Promise<Post[]> => {
  try {
    const q = query(
      collection(firestore, 'posts'),
      where('likes', 'array-contains', userId),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Post);
  } catch (error) {
    console.error('Error getting liked posts:', error);
    throw error;
  }
};

export const getPostComments = async (postId: string): Promise<Comment[]> => {
  try {
    const q = query(
      collection(firestore, 'comments'),
      where('postId', '==', postId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Comment);
  } catch (error) {
    console.error('Error getting post comments:', error);
    throw error;
  }
};