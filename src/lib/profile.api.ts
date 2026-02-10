import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function updateUserPhoto(uid: string, photoURL: string) {
  await setDoc(doc(db, "users", uid), { photoURL }, { merge: true });
}
