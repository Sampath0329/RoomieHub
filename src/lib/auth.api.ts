import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  User,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { auth } from "./firebase";

export async function registerWithEmail(
  email: string,
  password: string,
  fullName?: string
): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);

  if (fullName?.trim()) {
    await updateProfile(cred.user, { displayName: fullName.trim() });
  }

  return cred.user;
}

export async function loginWithEmail(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  return cred.user;
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

export async function loginWithGoogleIdToken(idToken: string): Promise<void> {
  const credential = GoogleAuthProvider.credential(idToken);
  await signInWithCredential(auth, credential);
}
