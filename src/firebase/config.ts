import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7cXlOMK1ujnIRRP6bVsu5Gu-8YHgFZQQ",
  authDomain: "ssocieyt.firebaseapp.com",
  projectId: "ssocieyt",
  storageBucket: "ssocieyt.appspot.com", // ✅ Doğru
  messagingSenderId: "297468867662",
  appId: "1:297468867662:web:4e2ffb9921fee9cbff3f1f",
  measurementId: "G-0J2SWPW38E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

// Initialize Analytics only if supported
const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

export { auth, firestore, storage, analytics, googleProvider };
export default app;