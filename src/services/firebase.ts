import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
// @ts-ignore
import { getAuth, initializeAuth, getReactNativePersistence, Auth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getFunctions, Functions } from 'firebase/functions';
import { Platform } from 'react-native';

// ─── Config ──────────────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Warn if Firebase keys are missing (won't crash the app)
if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('Dummy')) {
  console.warn(
    '[Firebase] Missing or placeholder API key detected. ' +
    'Add real Firebase credentials to your .env file. ' +
    'Auth and Firestore features will not work.'
  );
}

// ─── Initialize App ──────────────────────────────────────────────────────────

const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ─── Auth ─────────────────────────────────────────────────────────────────────

let auth: Auth;

try {
  if (Platform.OS === 'web' || typeof window !== 'undefined') {
    auth = getAuth(app);
  } else {
    try {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch (authInitError: any) {
      // If already initialized (e.g. during Fast Refresh / reload)
      auth = getAuth(app);
    }
  }
} catch (e: any) {
  console.warn('[Firebase] Auth initialization fallback:', e?.message);
  try {
    auth = getAuth(app);
  } catch {
    auth = {} as Auth;
  }
}

// ─── Firestore & Functions ────────────────────────────────────────────────────

const db: Firestore = getFirestore(app);
const functions: Functions = getFunctions(app);

// ─── Analytics (web only) ────────────────────────────────────────────────────

let analytics: any = null;
isSupported()
  .then((supported) => {
    if (supported) analytics = getAnalytics(app);
  })
  .catch(() => {});

export { app, auth, db, analytics, functions };
