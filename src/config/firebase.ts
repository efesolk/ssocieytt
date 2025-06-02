import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCz5_TUcYU2KWboxXIfw6RljPlnu2unzOg",
  authDomain: "games-ssocieyt.firebaseapp.com",
  projectId: "games-ssocieyt",
  storageBucket: "games-ssocieyt.appspot.com",
  messagingSenderId: "160298937342",
  appId: "1:160298937342:web:066f8950e521082dc52eaf",
  measurementId: "G-3FLC6X9EWN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app); // 👈 Değişiklik burada
const storage = getStorage(app);

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

// Initialize Analytics only if supported
const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

// Exports
export { auth, db, storage, analytics, googleProvider }; // 👈 db burada export edildi
export default app;
