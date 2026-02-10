import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export type Announcement = {
  id: string;
  text: string;
  createdByUid: string;
  createdByName: string;
  createdAt?: Timestamp | null;
};

export function listenAnnouncements(roomId: string, cb: (list: Announcement[]) => void) {
  const q = query(
    collection(db, "rooms", roomId, "announcements"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    cb(list as Announcement[]);
  });
}

export async function addAnnouncement(roomId: string, payload: {
  text: string;
  createdByUid: string;
  createdByName: string;
}) {
  await addDoc(collection(db, "rooms", roomId, "announcements"), {
    text: payload.text.trim(),
    createdByUid: payload.createdByUid,
    createdByName: payload.createdByName,
    createdAt: serverTimestamp(),
  });
}
