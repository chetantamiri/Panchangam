import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updatePassword as firebaseUpdatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  User,
  deleteUser,
} from "firebase/auth";
import {
  doc,
  getDocFromServer,
  setDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { safeStorage } from "./storage";
import type { UserProfile } from "../types";

export type { UserProfile };

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName: string,
    phoneNumber?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: {
    displayName?: string;
    phoneNumber?: string;
  }) => Promise<void>;
  updatePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ADMIN_EMAIL =
  process.env.EXPO_PUBLIC_ADMIN_EMAIL || "admin@panchangam.com";




export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // isRegistering prevents onSnapshot from signing out a brand-new user
  // BEFORE register() has a chance to call setDoc() and create the profile.
  // Without this, onSnapshot fires with exists=false the instant Firebase Auth
  // creates the account, and our deletion-guard code would sign them out immediately.
  const isRegistering = useRef(false);
  const isLoggingOut = useRef(false);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;
    let nativeSessionLoaded = false;
    let authStateFired = false;

    const performAutoLogin = async () => {
      try {
        if (isLoggingOut.current) return;
        const savedCreds = await safeStorage.getItem("saved_user_credentials");
        if (savedCreds && !isLoggingOut.current) {
          // If Firebase native/cookie persistence already logged us in, skip background re-auth
          if (auth.currentUser || nativeSessionLoaded) {
            console.log(
              "[Auto-Login] Native session already loaded, skipping manual re-auth.",
            );
            return;
          }
          const { email, password } = JSON.parse(savedCreds);
          console.log(
            "[Auto-Login] Restoring session background sign-in for:",
            email,
          );
          await signInWithEmailAndPassword(auth, email, password);
          if (isLoggingOut.current) {
            await signOut(auth).catch(() => {});
          }
          return;
        }
      } catch (err) {
        console.warn("[Auto-Login] Background session restore failed:", err);
      }

      // If we got here and native session didn't load, set loading to false
      if (!auth.currentUser && !nativeSessionLoaded) {
        setLoading(false);
      }
    };

    // Trigger session check on startup
    performAutoLogin();

    let unsubscribeAuth: (() => void) = () => {};
    try {
      if (auth && (auth as any).app) {
        unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
          authStateFired = true;

          if (currentUser) {
            nativeSessionLoaded = true;
        setLoading(true);
        setUser(currentUser);
        const userDocRef = doc(db, "users", currentUser.uid);

        // Clean up previous profile listener if exists
        if (unsubscribeProfile) {
          unsubscribeProfile();
        }

        // Setup real-time listener for user profile document
        unsubscribeProfile = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              setUserProfile(docSnap.data() as UserProfile);
              setLoading(false);
            } else {
              // Profile document is missing.
              // GUARD: if we are mid-registration, onSnapshot fires BEFORE setDoc
              // completes — do NOT sign the new user out. register() will create
              // the doc and onSnapshot will fire again with exists=true.
              if (isRegistering.current) {
                setLoading(false);
                return;
              }
              // isRegistering is false → this is a deleted account trying to use the app.
              // Sign them out immediately. Do this outside the callback to avoid
              // async issues inside a synchronous onSnapshot handler.
              console.warn(
                "[Auth] Profile missing for active user — account deleted. Signing out.",
              );
              safeStorage.removeItem("saved_user_credentials").finally(() => {
                signOut(auth).catch(() => {});
              });
              setLoading(false);
            }
          },
          (error) => {
            console.error("User profile subscription error:", error);
            setLoading(false);
          },
        );
      } else {
        setUser(null);
        setUserProfile(null);

        try {
          const savedCreds = await safeStorage.getItem("saved_user_credentials");
          if (!savedCreds) {
            setLoading(false);
          }
        } catch {
          setLoading(false);
        }
      }
    });
  } else {
    setLoading(false);
  }
} catch (e) {
  console.warn('[AuthContext] onAuthStateChanged failed:', e);
  setLoading(false);
}

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const login = async (email: string, password: string) => {
    isLoggingOut.current = false;
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // ── ROOT CAUSE FIX ─────────────────────────────────────────────────────
      // MUST use getDocFromServer() — NOT getDoc().
      // getDoc() reads from Firestore's local cache, which may still show the
      // document as existing even AFTER admin deleted it. getDocFromServer()
      // forces a fresh read from the server, guaranteeing up-to-date data.
      // ───────────────────────────────────────────────────────────────────────
      const profileSnap = await getDocFromServer(
        doc(db, "users", userCredential.user.uid),
      );
      if (!profileSnap.exists()) {
        // Account deleted by admin.
        // Since the user is currently authenticated (they just signed in),
        // we have the necessary fresh token to delete their Firebase Auth account.
        // This fully cleans up the system and allows them to register again.
        try {
          await deleteUser(userCredential.user);
        } catch (e) {
          console.warn("[Auth] Failed to delete orphaned Auth user:", e);
        }

        await safeStorage.removeItem("saved_user_credentials");
        await signOut(auth).catch(() => {});
        setLoading(false);
        throw {
          code: "auth/account-deleted",
          message:
            "Your account has been deleted by the administrator. Please register again.",
        };
      }

      // Profile exists and verified from server — save credentials for persistent login
      await safeStorage.setItem(
        "saved_user_credentials",
        JSON.stringify({ email, password }),
      );
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string,
    displayName: string,
    phoneNumber?: string,
  ) => {
    isLoggingOut.current = false;
    setLoading(true);
    // Set flag BEFORE creating the Firebase Auth user.
    // This prevents the onSnapshot handler from signing out the new user
    // during the window between createUserWithEmailAndPassword and setDoc.
    isRegistering.current = true;
    try {
      let newUser;

      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        newUser = userCredential.user;
      } catch (createError: any) {
        isRegistering.current = false;
        if (createError.code === "auth/email-already-in-use") {
          setLoading(false);
          throw {
            code: "auth/email-already-in-use",
            message:
              "This email is already registered. If your account was deleted, please use a different email address.",
          };
        }
        throw createError;
      }

      // Create Firestore profile — once this setDoc completes, onSnapshot will
      // fire again with exists=true, picking up the profile correctly.
      const isDefaultAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      const initialProfile: UserProfile = {
        uid: newUser.uid,
        email: email,
        displayName: displayName,
        phoneNumber: phoneNumber || "",
        role: isDefaultAdmin ? "admin" : "user",
        status: isDefaultAdmin ? "approved" : "pending",
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", newUser.uid), initialProfile);
      // Profile doc created — safe to clear the registration guard
      isRegistering.current = false;
      setUserProfile(initialProfile);

      await safeStorage.setItem(
        "saved_user_credentials",
        JSON.stringify({ email, password }),
      );
    } catch (error) {
      isRegistering.current = false;
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      isLoggingOut.current = true;
      // CRITICAL: Remove credentials BEFORE signOut.
      // signOut triggers onAuthStateChanged(null) synchronously. If credentials
      // still exist at that moment, the null handler thinks auto-login is pending
      // and never sets loading=false — causing an infinite loading screen.
      await safeStorage.removeItem("saved_user_credentials");
      await signOut(auth);
    } catch (error) {
      // Always unblock UI on error
      setLoading(false);
      throw error;
    }
  };

  const updateProfile = async (data: {
    displayName?: string;
    phoneNumber?: string;
  }) => {
    if (!user || !userProfile) throw new Error("Not logged in");
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { ...data });
    setUserProfile({ ...userProfile, ...data });
  };

  const updatePassword = async (
    currentPassword: string,
    newPassword: string,
  ) => {
    if (!user || !user.email) throw new Error("Not logged in");
    // Re-authenticate the user first for security
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword,
    );
    await reauthenticateWithCredential(user, credential);
    await firebaseUpdatePassword(user, newPassword);
    // Update persisted credentials with new password
    await safeStorage.setItem(
      "saved_user_credentials",
      JSON.stringify({ email: user.email, password: newPassword }),
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        login,
        register,
        logout,
        updateProfile,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
