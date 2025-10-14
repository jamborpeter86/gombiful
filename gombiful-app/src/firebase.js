import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: "AIzaSyBOgBpg7vjrP68femJrBPJswC59p8rYu2Y",
  authDomain: "gombiful.firebaseapp.com",
  projectId: "gombiful",
  storageBucket: "gombiful.firebasestorage.app",
  messagingSenderId: "97350311513",
  appId: "1:97350311513:web:1dabc32adae5bf337fdb48",
  measurementId: "G-LER3Y7H2N6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore (database for game state)
export const db = getFirestore(app);

// Initialize Analytics (optional)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
