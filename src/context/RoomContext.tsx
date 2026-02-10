import React, { createContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  Room,
  Member,
  JoinRequest,
  createRoom,
  findRoomByCode,
  requestToJoin,
  acceptJoin,
  rejectJoin,
  listenRoom,
  listenMembers,
  listenJoinRequests,
  listenMyRoomIds,
  getRoomsByIds,
  getMyCurrentRoomId,
  setCurrentRoomId,
} from "../lib/room.api";

type RoomCtx = {
  room: Room | null;
  members: Member[];
  requests: JoinRequest[];
  myRooms: Room[];
  loadingRoom: boolean;
  isAdmin: boolean;

  createNewRoom: (name: string) => Promise<string | null>;
  sendJoinRequestByCode: (code: string) => Promise<void>;
  acceptRequest: (req: JoinRequest) => Promise<void>;
  rejectRequest: (uid: string) => Promise<void>;
  leaveCurrentRoom: () => Promise<void>;

  selectRoom: (roomId: string) => Promise<void>;
};

export const RoomContext = createContext<RoomCtx>({} as RoomCtx);

export function RoomProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [room, setRoom] = useState<Room | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [loadingRoom, setLoadingRoom] = useState<boolean>(true);
  const [currentRoomId, setCurrentRoomIdState] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setMyRooms([]);
      return;
    }

    const unsub = listenMyRoomIds(user.uid, async (ids) => {
      const rooms = await getRoomsByIds(ids);
      setMyRooms(rooms);
    });

    return () => unsub?.();
  }, [user?.uid]);

  useEffect(() => {
    (async () => {
      if (!user) {
        setCurrentRoomIdState(null);
        return;
      }
      const rid = await getMyCurrentRoomId(user.uid);
      setCurrentRoomIdState(rid);
    })();
  }, [user?.uid]);

  useEffect(() => {
    if (!user) {
      setRoom(null);
      setMembers([]);
      setRequests([]);
      setLoadingRoom(false);
      return;
    }

    if (!currentRoomId) {
      setRoom(null);
      setMembers([]);
      setRequests([]);
      setLoadingRoom(false);
      return;
    }

    setLoadingRoom(true);

    const unsubRoom = listenRoom(currentRoomId, setRoom);
    const unsubMembers = listenMembers(currentRoomId, setMembers);
    const unsubReq = listenJoinRequests(currentRoomId, setRequests);

    setLoadingRoom(false);

    return () => {
      unsubRoom?.();
      unsubMembers?.();
      unsubReq?.();
    };
  }, [user?.uid, currentRoomId]);

  const isAdmin = !!(room && user && room.adminUid === user.uid);

  const value = useMemo<RoomCtx>(
    () => ({
      room,
      members,
      requests,
      myRooms,
      loadingRoom,
      isAdmin,

      selectRoom: async (roomId: string) => {
        if (!user) return;
        await setCurrentRoomId(user.uid, roomId);
        setCurrentRoomIdState(roomId);
      },

      createNewRoom: async (name: string) => {
        if (!user) return null;
        setLoadingRoom(true);
        try {
          const newId = await createRoom(name, user);
          await setCurrentRoomId(user.uid, newId);
          setCurrentRoomIdState(newId);
          return newId;
        } finally {
          setLoadingRoom(false);
        }
      },

      sendJoinRequestByCode: async (code: string) => {
        if (!user) return;
        setLoadingRoom(true);
        try {
          const found = await findRoomByCode(code);
          if (!found) throw new Error("Room code invalid.");
          await requestToJoin(found.id, user);
        } finally {
          setLoadingRoom(false);
        }
      },

      acceptRequest: async (req: JoinRequest) => {
        if (!room) throw new Error("No room selected.");
        if (!isAdmin) throw new Error("Only admin can accept requests.");
        await acceptJoin(room.id, req);
      },

      rejectRequest: async (uid: string) => {
        if (!room) throw new Error("No room selected.");
        if (!isAdmin) throw new Error("Only admin can reject requests.");
        await rejectJoin(room.id, uid);
      },

      leaveCurrentRoom: async () => {
        if (!user) return;
        if (!room) return;

        setLoadingRoom(true);
        try {
          await setCurrentRoomId(user.uid, null);
          setCurrentRoomIdState(null);
          setRoom(null);
          setMembers([]);
          setRequests([]);
        } finally {
          setLoadingRoom(false);
        }
      },
    }),
    [room, members, requests, myRooms, loadingRoom, isAdmin, user]
  );

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}
