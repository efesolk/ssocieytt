import { createContext, useEffect, useState, ReactNode } from 'react';
import { 
  Auth, User, UserCredential, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from '../firebase/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  register: (email: string, password: string, username: string) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<UserCredential>;
  loginWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  setError: (error: string | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  register: async () => {
    throw new Error('Not implemented');
  },
  login: async () => {
    throw new Error('Not implemented');
  },
  loginWithGoogle: async () => {
    throw new Error('Not implemented');
  },
  logout: async () => {
    throw new Error('Not implemented');
  },
  setError: () => {
    throw new Error('Not implemented');
  }
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async (email: string, password: string, username: string): Promise<UserCredential> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;

      // Update profile with username
      await updateProfile(user, {
        displayName: username
      });

      // Create user document in Firestore
      await setDoc(doc(firestore, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        username,
        displayName: username,
        photoURL: user.photoURL || null,
        bio: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        followers: [],
        following: []
      });

      return userCredential;
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<UserCredential> => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      throw error;
    }
  };

  const loginWithGoogle = async (): Promise<UserCredential> => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const { user } = userCredential;

      // Check if user document exists
      const userDoc = await getDoc(doc(firestore, 'users', user.uid));

      // If not, create new user document
      if (!userDoc.exists()) {
        const username = user.displayName?.replace(/\s+/g, '').toLowerCase() || `user_${Math.random().toString(36).substring(2, 8)}`;
        
        await setDoc(doc(firestore, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          username,
          displayName: user.displayName || username,
          photoURL: user.photoURL,
          bio: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          followers: [],
          following: []
        });
      }

      return userCredential;
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      register, 
      login, 
      loginWithGoogle, 
      logout, 
      setError 
    }}>
      {children}
    </AuthContext.Provider>
  );
};