import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Production Web App Firebase configuration for MessUP
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBYFiIq7SaenfDDfsaC5dMe0p0rUCz4ooc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "messup-ee9fc.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://messup-ee9fc-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "messup-ee9fc",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "messup-ee9fc.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "293579998912",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:293579998912:web:0cf001512d7ec9810b0f25",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-514M14H8YP"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

// Safe Analytics Initialization for browsers
export let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics optional in non-standard environments
  });
}

export default app;
