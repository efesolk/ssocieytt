import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where,
  getDocs,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  setDoc 
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { firestore, storage } from '../firebase/config';
import { User } from '../models/types';

export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  try {
    const q = query(collection(firestore, 'users'), where('username', '==', username.toLowerCase()));
    const snapshot = await getDocs(q);
    return snapshot.empty;
  } catch (error) {
    console.error('Error checking username:', error);
    throw error;
  }
};

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(firestore, 'users', userId));
    
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as unknown as User;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

export const updateUserProfile = async (
  userId: string,
  data: {
    displayName?: string;
    bio?: string;
    profileImage?: File;
    settings?: {
      theme?: 'light' | 'dark';
      privacy?: {
        profileVisibility?: 'public' | 'private';
        messagePermission?: 'everyone' | 'following';
      };
    };
  }
): Promise<void> => {
  try {
    const updateData: Record<string, any> = {
      updatedAt: serverTimestamp(),
    };

    if (data.displayName) {
      updateData.displayName = data.displayName;
    }

    if (data.bio !== undefined) {
      updateData.bio = data.bio;
    }

    if (data.settings) {
      updateData.settings = data.settings;
    }

    // Upload profile image if provided
    if (data.profileImage) {
      const storageRef = ref(storage, `profiles/${userId}`);
      const uploadTask = await uploadBytesResumable(storageRef, data.profileImage);
      const downloadURL = await getDownloadURL(uploadTask.ref);
      
      updateData.photoURL = downloadURL;
    }

    await updateDoc(doc(firestore, 'users', userId), updateData);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const searchUsers = async (query: string): Promise<User[]> => {
  try {
    const q = collection(firestore, 'users');
    const snapshot = await getDocs(q);
    
    const users = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }) as unknown as User)
      .filter(user => 
        user.username.toLowerCase().includes(query.toLowerCase()) ||
        user.displayName.toLowerCase().includes(query.toLowerCase())
      );
    
    return users;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

export const followUser = async (currentUserId: string, targetUserId: string): Promise<void> => {
  try {
    // Add target user to current user's following list
    await updateDoc(doc(firestore, 'users', currentUserId), {
      following: arrayUnion(targetUserId),
      updatedAt: serverTimestamp()
    });
    
    // Add current user to target user's followers list
    await updateDoc(doc(firestore, 'users', targetUserId), {
      followers: arrayUnion(currentUserId),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

export const unfollowUser = async (currentUserId: string, targetUserId: string): Promise<void> => {
  try {
    // Remove target user from current user's following list
    await updateDoc(doc(firestore, 'users', currentUserId), {
      following: arrayRemove(targetUserId),
      updatedAt: serverTimestamp()
    });
    
    // Remove current user from target user's followers list
    await updateDoc(doc(firestore, 'users', targetUserId), {
      followers: arrayRemove(currentUserId),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

export const updateUserSettings = async (
  userId: string,
  settings: {
    theme?: 'light' | 'dark';
    privacy?: {
      profileVisibility?: 'public' | 'private';
      messagePermission?: 'everyone' | 'following';
    };
  }
): Promise<void> => {
  try {
    await updateDoc(doc(firestore, 'users', userId), {
      settings,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }
};