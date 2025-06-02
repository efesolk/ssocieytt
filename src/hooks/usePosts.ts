import { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  arrayUnion,
  arrayRemove,
  where
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Post, Comment } from '../types';

export function usePosts(userId?: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);

        const postsQuery = userId
          ? query(
              collection(db, 'posts'),
              where('authorId', '==', userId),
              orderBy('createdAt', 'desc'),
              limit(20)
            )
          : query(
              collection(db, 'posts'),
              orderBy('createdAt', 'desc'),
              limit(20)
            );

        const querySnapshot = await getDocs(postsQuery);
        const postsData: Post[] = [];

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();

          postsData.push({
            id: docSnap.id,
            ...data,
            likes: Array.isArray(data.likes) ? data.likes : [],
            comments: Array.isArray(data.comments) ? data.comments : [],
            createdAt: new Date(data.createdAt)
          } as Post);
        });

        setPosts(postsData);
      } catch (err: any) {
        setError(err.message || 'Error fetching posts.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [userId]);

  const addPost = async (
    authorId: string,
    authorName: string,
    authorPhotoURL: string,
    content: string,
    image?: File,
    gameTag?: string
  ) => {
    try {
      setError(null);
      let imageURL = '';

      if (image) {
        const imageRef = ref(storage, `posts/${authorId}/${Date.now()}_${image.name}`);
        await uploadBytes(imageRef, image);
        imageURL = await getDownloadURL(imageRef);
      }

      const createdAt = new Date();
      const newPost = {
        authorId,
        authorName,
        authorPhotoURL,
        content,
        imageURL,
        gameTag: gameTag || '',
        createdAt: createdAt.toISOString(),
        likes: [],
        comments: []
      };

      const docRef = await addDoc(collection(db, 'posts'), newPost);

      setPosts((prevPosts) => [
        { id: docRef.id, ...newPost, createdAt } as Post,
        ...prevPosts
      ]);

      return docRef.id;
    } catch (err: any) {
      setError(err.message || 'Error adding post.');
      return null;
    }
  };

  const likePost = async (postId: string, userId: string) => {
    try {
      setError(null);
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        likes: arrayUnion(userId)
      });

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, likes: [...(post.likes || []), userId] }
            : post
        )
      );
    } catch (err: any) {
      setError(err.message || 'Error liking post.');
    }
  };

  const unlikePost = async (postId: string, userId: string) => {
    try {
      setError(null);
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        likes: arrayRemove(userId)
      });

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes: (post.likes || []).filter((id) => id !== userId)
              }
            : post
        )
      );
    } catch (err: any) {
      setError(err.message || 'Error unliking post.');
    }
  };

  const deletePost = async (postId: string) => {
    try {
      setError(null);
      await deleteDoc(doc(db, 'posts', postId));
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    } catch (err: any) {
      setError(err.message || 'Error deleting post.');
    }
  };

  const addComment = async (
    postId: string,
    authorId: string,
    authorName: string,
    authorPhotoURL: string,
    content: string
  ) => {
    try {
      setError(null);
      const newComment: Comment = {
        id: Date.now().toString(),
        authorId,
        authorName,
        authorPhotoURL,
        content,
        createdAt: new Date().toISOString()
      };

      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        comments: arrayUnion(newComment)
      });

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [...(post.comments || []), newComment]
              }
            : post
        )
      );
    } catch (err: any) {
      setError(err.message || 'Error adding comment.');
    }
  };

  return {
    posts,
    loading,
    error,
    addPost,
    likePost,
    unlikePost,
    deletePost,
    addComment
  };
}
