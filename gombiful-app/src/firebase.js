import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBOgBpg7vjrP68femJrBPJswC59p8rYu2Y",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gombiful.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gombiful",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gombiful.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "97350311513",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:97350311513:web:1dabc32adae5bf337fdb48",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-LER3Y7H2N6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore (database for game state)
export const db = getFirestore(app);

// Initialize Analytics (optional)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
