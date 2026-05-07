import AsyncStorage from "@react-native-async-storage/async-storage";
import { FirebaseApp, FirebaseOptions, getApp, getApps, initializeApp } from "firebase/app";
import {
  Auth,
  User,
  createUserWithEmailAndPassword,
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { publicApi } from "./publicApi";

let appRef: FirebaseApp | null = null;
let authRef: Auth | null = null;

function firebaseErrorCode(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    const c = (error as { code?: string }).code;
    return typeof c === "string" ? c : "";
  }
  return "";
}

function createAuthForApp(app: FirebaseApp): Auth {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (e: unknown) {
    if (firebaseErrorCode(e) === "auth/already-initialized") {
      return getAuth(app);
    }
    throw e;
  }
}

async function withTransientNetworkRetry<T>(fn: () => Promise<T>): Promise<T> {
  const delaysMs = [0, 450, 1100];
  let last: unknown;
  for (let i = 0; i < delaysMs.length; i++) {
    if (delaysMs[i] > 0) {
      await new Promise<void>((resolve) => {
        setTimeout(resolve, delaysMs[i]);
      });
    }
    try {
      return await fn();
    } catch (e) {
      last = e;
      if (firebaseErrorCode(e) !== "auth/network-request-failed" || i === delaysMs.length - 1) {
        throw e;
      }
    }
  }
  throw last;
}

export async function fetchFirebaseOptions(): Promise<FirebaseOptions> {
  const res = await publicApi.get<FirebaseOptions>("/config/firebase");
  return res.data;
}

export async function initFirebaseFromRemote(): Promise<Auth> {
  if (authRef) return authRef;
  const options = await fetchFirebaseOptions();
  if (getApps().length === 0) {
    appRef = initializeApp(options);
  } else {
    appRef = getApp();
  }
  authRef = createAuthForApp(appRef);
  return authRef;
}

export function getFirebaseAuthInstance(): Auth | null {
  return authRef;
}

export async function getIdToken(): Promise<string | null> {
  const a = authRef;
  if (!a) return null;
  const u = a.currentUser;
  if (!u) return null;
  return u.getIdToken();
}

export function subscribeAuth(callback: (user: User | null) => void): () => void {
  const a = authRef;
  if (!a) return () => {};
  return onAuthStateChanged(a, callback);
}

export async function emailRegister(email: string, password: string): Promise<User> {
  const a = authRef;
  if (!a) throw new Error("Kimlik doğrulama hazır değil");
  const cred = await withTransientNetworkRetry(() =>
    createUserWithEmailAndPassword(a, email.trim(), password),
  );
  return cred.user;
}

export async function emailLogin(email: string, password: string): Promise<User> {
  const a = authRef;
  if (!a) throw new Error("Kimlik doğrulama hazır değil");
  const cred = await withTransientNetworkRetry(() =>
    signInWithEmailAndPassword(a, email.trim(), password),
  );
  return cred.user;
}

export async function emailLogout(): Promise<void> {
  const a = authRef;
  if (!a) return;
  await signOut(a);
}

export async function sendReset(email: string): Promise<void> {
  const a = authRef;
  if (!a) throw new Error("Kimlik doğrulama hazır değil");
  await withTransientNetworkRetry(() => sendPasswordResetEmail(a, email.trim()));
}

export async function updateUserDisplayName(displayName: string): Promise<void> {
  const a = authRef;
  const u = a?.currentUser;
  if (!u) throw new Error("Oturum yok");
  await updateProfile(u, { displayName: displayName.trim() });
}

export async function updateUserPassword(newPassword: string): Promise<void> {
  const a = authRef;
  const u = a?.currentUser;
  if (!u) throw new Error("Oturum yok");
  await updatePassword(u, newPassword);
}
