import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  arrayUnion,
  arrayRemove,
  orderBy,
  limit,
  DocumentData
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User } from '../types';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const usersRef = collection(db, 'users');
        const usersQuery = query(usersRef, orderBy('displayName'), limit(50));
        const querySnapshot = await getDocs(usersQuery);
        
        const usersData: User[] = [];
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          usersData.push({
            ...userData,
            followers: userData.followers || [],
            following: userData.following || [],
          } as User);
        });

        setUsers(usersData);
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError(err.message || 'Error fetching users.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const getUserById = async (userId: string): Promise<User | null> => {
    try {
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid userId provided.');
      }

      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        return {
          ...userData,
          followers: userData.followers || [],
          following: userData.following || [],
        } as User;
      } else {
        console.warn(`User with ID "${userId}" not found.`);
        return null;
      }
    } catch (error: any) {
      console.error('getUserById error:', error.message || error);
      setError(error.message || 'An unknown error occurred.');
      return null;
    }
  };

  const searchUsers = async (searchTerm: string): Promise<User[]> => {
    if (!searchTerm.trim()) {
      return [];
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Create a query against the display name field
      // This requires a composite index on displayName
      const q = query(
        collection(db, 'users'),
        where('displayName', '>=', searchTerm),
        where('displayName', '<=', searchTerm + '\uf8ff'),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      const results: User[] = [];

      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        results.push({
          ...userData,
          followers: userData.followers || [],
          following: userData.following || [],
        } as User);
      });

      return results;
    } catch (err: any) {
      console.error('Error searching users:', err);
      setError(err.message || 'Error searching users.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const followUser = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
    if (currentUserId === targetUserId) {
      setError('You cannot follow yourself');
      return false;
    }
    
    try {
      setError(null);
      
      // Update the current user's following list
      await updateDoc(doc(db, 'users', currentUserId), {
        following: arrayUnion(targetUserId)
      });

      // Update the target user's followers list
      await updateDoc(doc(db, 'users', targetUserId), {
        followers: arrayUnion(currentUserId)
      });

      // Update local state
      setUsers(users.map(user => {
        if (user.uid === currentUserId) {
          return { 
            ...user, 
            following: [...user.following, targetUserId] 
          };
        }
        if (user.uid === targetUserId) {
          return { 
            ...user, 
            followers: [...user.followers, currentUserId] 
          };
        }
        return user;
      }));
      
      return true;
    } catch (err: any) {
      console.error('Error following user:', err);
      setError(err.message || 'Error following user.');
      return false;
    }
  };

  const unfollowUser = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
    try {
      setError(null);
      
      // Remove target user from current user's following list
      await updateDoc(doc(db, 'users', currentUserId), {
        following: arrayRemove(targetUserId)
      });

      // Remove current user from target user's followers list
      await updateDoc(doc(db, 'users', targetUserId), {
        followers: arrayRemove(currentUserId)
      });

      // Update local state
      setUsers(users.map(user => {
        if (user.uid === currentUserId) {
          return {
            ...user,
            following: user.following.filter(id => id !== targetUserId)
          };
        }
        if (user.uid === targetUserId) {
          return {
            ...user,
            followers: user.followers.filter(id => id !== currentUserId)
          };
        }
        return user;
      }));
      
      return true;
    } catch (err: any) {
      console.error('Error unfollowing user:', err);
      setError(err.message || 'Error unfollowing user.');
      return false;
    }
  };

  const updateUserProfile = async (
    userId: string,
    updates: Partial<Omit<User, 'uid' | 'email' | 'createdAt' | 'followers' | 'following'>>
  ): Promise<boolean> => {
    try {
      setError(null);
      
      // Add validation for updates if needed
      if (updates.displayName && updates.displayName.trim().length < 3) {
        setError('Display name must be at least 3 characters');
        return false;
      }
      
      // Add lastActive timestamp
      const updatesWithTimestamp = {
        ...updates,
        lastActive: Date.now()
      };
      
      await updateDoc(doc(db, 'users', userId), updatesWithTimestamp);

      // Update local state
      setUsers(users.map(user =>
        user.uid === userId ? { ...user, ...updatesWithTimestamp } : user
      ));

      return true;
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Error updating profile.');
      return false;
    }
  };

  return {
    users,
    loading,
    error,
    getUserById,
    searchUsers,
    followUser,
    unfollowUser,
    updateUserProfile
  };
}