import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type { User } from "firebase/auth";

export type Room = { id: string; name: string; code: string; adminUid: string };

export type JoinRequest = { uid: string; name: string; email: string };

export type Member = { uid: string; name: string; email: string; role: "admin" | "member" };

function randomCode(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function ensureUserDoc(user: User) {
  await setDoc(
    doc(db, "users", user.uid),
    {
      uid: user.uid,
      email: user.email || "",
      name: user.displayName || "",
      roomIds: [],
      currentRoomId: null,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function setCurrentRoomId(uid: string, roomId: string | null) {
  await setDoc(doc(db, "users", uid), { currentRoomId: roomId }, { merge: true });
}

export async function getMyCurrentRoomId(uid: string): Promise<string | null> {
  const snap = await getDoc(doc(db, "users", uid));
  const data = snap.data() as any;
  return (data?.currentRoomId as string) || null;
}

export function listenMyRoomIds(uid: string, cb: (ids: string[]) => void): Unsubscribe {
  return onSnapshot(doc(db, "users", uid), (snap) => {
    const data = snap.data() as any;
    cb((data?.roomIds as string[]) || []);
  });
}

export async function getRoomsByIds(ids: string[]): Promise<Room[]> {
  const rooms: Room[] = [];
  for (const id of ids) {
    const r = await getDoc(doc(db, "rooms", id));
    if (r.exists()) rooms.push({ id: r.id, ...(r.data() as any) });
  }
  return rooms;
}

/* room create/join */

export async function createRoom(roomName: string, user: User): Promise<string> {
  const code = randomCode(6);

  const roomRef = await addDoc(collection(db, "rooms"), {
    name: roomName.trim(),
    code,
    adminUid: user.uid,
    createdAt: serverTimestamp(),
  });

  await setDoc(doc(db, "rooms", roomRef.id, "members", user.uid), {
    uid: user.uid,
    name: user.displayName || "Admin",
    email: user.email || "",
    role: "admin",
    joinedAt: serverTimestamp(),
  });

  await setDoc(
    doc(db, "users", user.uid),
    { roomIds: arrayUnion(roomRef.id), currentRoomId: roomRef.id },
    { merge: true }
  );

  return roomRef.id;
}

export async function findRoomByCode(code: string): Promise<Room | null> {
  const q = query(collection(db, "rooms"), where("code", "==", code.trim().toUpperCase()));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...(d.data() as any) } as Room;
}

export async function requestToJoin(roomId: string, user: User) {
  await setDoc(doc(db, "rooms", roomId, "joinRequests", user.uid), {
    uid: user.uid,
    name: user.displayName || "User",
    email: user.email || "",
    createdAt: serverTimestamp(),
  });
}

export async function acceptJoin(roomId: string, req: JoinRequest) {
  await setDoc(doc(db, "rooms", roomId, "members", req.uid), {
    uid: req.uid,
    name: req.name,
    email: req.email,
    role: "member",
    joinedAt: serverTimestamp(),
  });

  await deleteDoc(doc(db, "rooms", roomId, "joinRequests", req.uid));

  await setDoc(
    doc(db, "users", req.uid),
    { roomIds: arrayUnion(roomId), currentRoomId: roomId },
    { merge: true }
  );
}

export async function rejectJoin(roomId: string, uid: string) {
  await deleteDoc(doc(db, "rooms", roomId, "joinRequests", uid));
}

export async function leaveRoom(roomId: string, uid: string) {
  await deleteDoc(doc(db, "rooms", roomId, "members", uid));

  await setDoc(
    doc(db, "users", uid),
    { roomIds: arrayRemove(roomId), currentRoomId: null },
    { merge: true }
  );
}

export function listenRoom(roomId: string, cb: (room: Room | null) => void): Unsubscribe {
  return onSnapshot(doc(db, "rooms", roomId), (snap) => {
    if (!snap.exists()) return cb(null);
    cb({ id: snap.id, ...(snap.data() as any) } as Room);
  });
}

export function listenMembers(roomId: string, cb: (list: Member[]) => void): Unsubscribe {
  return onSnapshot(collection(db, "rooms", roomId, "members"), (snap) => {
    cb(snap.docs.map((d) => d.data() as Member));
  });
}

export function listenJoinRequests(roomId: string, cb: (list: JoinRequest[]) => void): Unsubscribe {
  return onSnapshot(collection(db, "rooms", roomId, "joinRequests"), (snap) => {
    cb(snap.docs.map((d) => d.data() as JoinRequest));
  });
}
