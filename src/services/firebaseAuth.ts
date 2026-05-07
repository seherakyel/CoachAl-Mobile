import { FirebaseApp, FirebaseOptions, getApp, getApps, initializeApp } from "firebase/app";
import {
  Auth,
  User,
  createUserWithEmailAndPassword,
  getAuth,
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
  authRef = getAuth(appRef);
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
  const cred = await createUserWithEmailAndPassword(a, email.trim(), password);
  return cred.user;
}

export async function emailLogin(email: string, password: string): Promise<User> {
  const a = authRef;
  if (!a) throw new Error("Kimlik doğrulama hazır değil");
  const cred = await signInWithEmailAndPassword(a, email.trim(), password);
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
  await sendPasswordResetEmail(a, email.trim());
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
