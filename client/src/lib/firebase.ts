import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, User } from "firebase/auth";

// Check if Firebase is configured
const isFirebaseConfigured = !!(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID
);

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "dummy-api-key",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "dummy-project"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dummy-project",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "dummy-project"}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:000000000000:web:0000000000000000000000",
};

if (!isFirebaseConfigured) {
  console.warn('⚠️ Firebase not configured - Google Auth will be disabled');
} else if (import.meta.env.DEV) {
  console.log('🔧 Firebase Configuration:', {
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
    currentDomain: window.location.hostname,
    fullUrl: window.location.href
  });
}

let app: any = null;
let auth: any = null;

try {
  if (isFirebaseConfigured) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  }
} catch (error) {
  console.warn('⚠️ Firebase initialization failed:', error);
}

export { auth };

const provider = new GoogleAuthProvider();
provider.addScope('email');
provider.addScope('profile');

export const signInWithGoogle = async (): Promise<User | null> => {
  if (!isFirebaseConfigured || !auth) {
    console.warn('⚠️ Firebase not configured - Google Auth unavailable');
    throw new Error('Firebase authentication not configured');
  }
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Firebase Google sign-in error:", error);
    }
    throw error;
  }
};

export const signOutFromFirebase = async (): Promise<void> => {
  if (!isFirebaseConfigured || !auth) {
    console.warn('⚠️ Firebase not configured - Sign out unavailable');
    return;
  }
  try {
    await signOut(auth);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Firebase sign-out error:", error);
    }
    throw error;
  }
};

export { GoogleAuthProvider };