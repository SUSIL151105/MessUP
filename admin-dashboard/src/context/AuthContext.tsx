import React, { createContext, useContext, useEffect, useState } from 'react';
import type { UserProfile } from '../types/models';
import { auth, db, rtdb } from '../services/firebase';
import { 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut, 
  onAuthStateChanged,
  type User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, set as setRtdb, get as getRtdb } from 'firebase/database';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  adminProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateAdminPassword: (newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [adminProfile, setAdminProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Purge any stale demo admin storage
    localStorage.removeItem('messup_admin_demo');

    const authTimeout = setTimeout(() => {
      setLoading(false);
    }, 1500);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(authTimeout);
      if (firebaseUser) {
        setCurrentUser(firebaseUser);
        
        // Authoritative admin profile for the authenticated Firebase user
        const authenticatedAdmin: UserProfile = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'MessUP Head Admin',
          email: firebaseUser.email || '',
          phone: '',
          role: 'ADMIN',
          isApproved: true,
          createdAt: Date.now()
        };

        // Immediately grant access to the authenticated admin
        setAdminProfile(authenticatedAdmin);
        setError(null);
        setLoading(false);

        // Sync admin profile to Realtime Database
        try {
          setRtdb(ref(rtdb, `users/${firebaseUser.uid}`), authenticatedAdmin).catch(() => {});
        } catch (_) {}

        try {
          // Sync with Realtime Database or Cloud Firestore
          const rtdbSnap = await getRtdb(ref(rtdb, `users/${firebaseUser.uid}`));
          if (rtdbSnap.exists()) {
            const data = rtdbSnap.val() as UserProfile;
            if (data.role === 'ADMIN') {
              setAdminProfile(data);
            }
          }
        } catch (_) {}

        try {
          // Sync with Cloud Firestore in background if database is provisioned
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          setDoc(userDocRef, authenticatedAdmin).catch(() => {});
        } catch (syncErr) {
          console.warn('Firestore admin profile sync note (operating in resilient mode):', syncErr);
        }
      } else {
        setCurrentUser(null);
        setAdminProfile(null);
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(authTimeout);
      unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    const trimmedEmail = email.trim();

    try {
      await signInWithEmailAndPassword(auth, trimmedEmail, pass);
    } catch (err: any) {
      console.warn('Firebase signIn attempt error:', err?.code, err?.message);
      
      // Auto-provision admin user in Firebase Auth if account not yet created
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
        try {
          const { createUserWithEmailAndPassword } = await import('firebase/auth');
          await createUserWithEmailAndPassword(auth, trimmedEmail, pass);
          return;
        } catch (createErr: any) {
          console.warn('Firebase admin auto-create note:', createErr?.code, createErr?.message);
          if (createErr?.code === 'auth/email-already-in-use') {
            const errorMsg = 'Incorrect credentials entered. Please try again or use Forgot Password.';
            setError(errorMsg);
            setLoading(false);
            throw new Error(errorMsg);
          }
        }
      }

      let errorMsg = 'Invalid credentials. Please verify your email and password.';
      if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        errorMsg = 'Incorrect credentials entered. Please try again or use Forgot Password.';
      } else if (err?.code === 'auth/user-not-found') {
        errorMsg = 'No administrator account found with this email.';
      } else if (err?.code === 'auth/too-many-requests') {
        errorMsg = 'Access temporarily disabled due to many failed attempts. Please try again shortly.';
      } else if (err?.code === 'auth/network-request-failed') {
        errorMsg = 'Network connectivity issue. Please check your internet connection.';
      }

      setError(errorMsg);
      setLoading(false);
      throw new Error(errorMsg);
    }
  };

  const sendPasswordReset = async (email: string) => {
    setError(null);
    const targetEmail = email.trim();
    if (!targetEmail) {
      throw new Error('Please enter a valid email address.');
    }
    try {
      await sendPasswordResetEmail(auth, targetEmail);
    } catch (err: any) {
      console.error('Firebase sendPasswordResetEmail error:', err);
      if (err.code === 'auth/user-not-found') {
        throw new Error(`No account found registered with ${targetEmail}. Please check the email address.`);
      } else if (err.code === 'auth/invalid-email') {
        throw new Error('The email address is improperly formatted.');
      } else if (err.code === 'auth/too-many-requests') {
        throw new Error('Too many requests. Please wait a few moments before trying again.');
      } else {
        throw new Error(err.message || 'Failed to dispatch reset email. Please try again.');
      }
    }
  };

  const updateAdminPassword = async (newPassword: string) => {
    if (auth.currentUser) {
      try {
        const { updatePassword } = await import('firebase/auth');
        await updatePassword(auth.currentUser, newPassword);
      } catch (err) {
        console.warn('Firebase user updatePassword note:', err);
        throw err;
      }
    }
  };

  const logout = async () => {
    setAdminProfile(null);
    setCurrentUser(null);
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase signout note:', err);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        adminProfile,
        loading,
        login,
        sendPasswordReset,
        updateAdminPassword,
        logout,
        error,
        clearError,
        isDemoMode: false
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
