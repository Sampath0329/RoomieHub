import React, { useEffect, useMemo, useState } from "react";
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../../../src/hooks/useAuth";
import { useRoom } from "../../../src/hooks/useRoom";
import { Input } from "../../../src/components/ui/Input";
import { addAnnouncement, listenAnnouncements, type Announcement } from "../../../src/lib/announcement.api";

type TabKey = "ann" | "mem" | "req";

export default function RoomScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const roomId = String(id);

  const { user } = useAuth();
  const { room, members, requests, isAdmin, loadingRoom, selectRoom, acceptRequest, rejectRequest } = useRoom();

  const [tab, setTab] = useState<TabKey>("ann");

  const [annList, setAnnList] = useState<Announcement[]>([]);
  const [text, setText] = useState("");
  const [localErr, setLocalErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await selectRoom(roomId);
      } catch {}
    })();
  }, [roomId]);

  useEffect(() => {
    const unsub = listenAnnouncements(roomId, setAnnList);
    return () => unsub?.();
  }, [roomId]);

  const headerTitle = useMemo(() => {
    if (room?.id === roomId) return room.name;
    return "Room";
  }, [room?.id, roomId]);

  async function onSendAnnouncement() {
    setLocalErr(null);
    if (!user) return setLocalErr("Not logged in");
    if (!text.trim()) return;

    try {
      await addAnnouncement(roomId, {
        text,
        createdByUid: user.uid,
        createdByName: user.displayName || "User",
      });
      setText("");
    } catch (e: any) {
      setLocalErr(e?.message || "Failed to send");
    }
  }

  async function onAccept(req: { uid: string; name: string; email: string }) {
    setLocalErr(null);
    try {
      await acceptRequest(req);
    } catch (e: any) {
      setLocalErr(e?.message || "Accept failed");
    }
  }

  async function onReject(uid: string) {
    setLocalErr(null);
    try {
      await rejectRequest(uid);
    } catch (e: any) {
      setLocalErr(e?.message || "Reject failed");
    }
  }

  return (
    <LinearGradient colors={["#ffffff", "#f3e8ff", "#faf5ff"]} className="flex-1">
      <SafeAreaView className="flex-1">
        {/* Top bar */}
        <View className="px-6 pt-6 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-purple-700 font-bold">Back</Text>
          </TouchableOpacity>

          <View className="items-center">
            <Text className="text-gray-900 font-extrabold text-lg" numberOfLines={1}>
              {headerTitle}
            </Text>
            <Text className="text-gray-500 text-xs">
              {isAdmin ? "Admin" : "Member"}
            </Text>
          </View>

          <View style={{ width: 50 }} />
        </View>

        {/* Tabs */}
        <View className="px-6 mt-4">
          <View className="flex-row bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <TabButton label="Announcements" active={tab === "ann"} onPress={() => setTab("ann")} />
            <TabButton label="Members" active={tab === "mem"} onPress={() => setTab("mem")} />
            <TabButton
              label="Requests"
              active={tab === "req"}
              onPress={() => setTab("req")}
              disabled={!isAdmin}
            />
          </View>

          {!isAdmin ? (
            <Text className="text-gray-400 text-xs mt-2">
              Requests tab is only for admin.
            </Text>
          ) : null}

          {localErr ? <Text className="text-red-600 font-semibold mt-3">{localErr}</Text> : null}
        </View>

        {/* Content */}
        <ScrollView className="px-6 mt-4" contentContainerStyle={{ paddingBottom: tab === "ann" ? 140 : 40 }}>
          {loadingRoom ? (
            <View className="bg-white p-6 rounded-3xl border border-gray-100 shadow">
              <Text className="text-gray-700 font-bold">Loading...</Text>
            </View>
          ) : null}

          {tab === "ann" ? (
            <AnnouncementsTab list={annList} />
          ) : null}

          {tab === "mem" ? (
            <MembersTab members={members} />
          ) : null}

          {tab === "req" ? (
            isAdmin ? (
              <RequestsTab requests={requests} onAccept={onAccept} onReject={onReject} />
            ) : (
              <View className="bg-white p-6 rounded-3xl border border-gray-100 shadow">
                <Text className="text-gray-700 font-bold">Admin only</Text>
                <Text className="text-gray-500 mt-1">Only admin can see join requests.</Text>
              </View>
            )
          ) : null}
        </ScrollView>

        {/* Composer only for announcements tab */}
        {tab === "ann" ? (
          <View className="absolute bottom-0 left-0 right-0 px-6 pb-6 pt-3 bg-white border-t border-gray-200">
            <Input placeholder="Type announcement..." value={text} onChangeText={setText} />
            <TouchableOpacity onPress={onSendAnnouncement} className="rounded-full overflow-hidden mt-3">
              <LinearGradient colors={["#06b6d4", "#8b5cf6"]} className="py-4 items-center">
                <Text className="text-white font-extrabold text-lg">Send</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : null}
      </SafeAreaView>
    </LinearGradient>
  );
}

function TabButton({
  label,
  active,
  onPress,
  disabled,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      className={`flex-1 py-3 items-center ${disabled ? "opacity-40" : ""} ${active ? "bg-purple-600" : "bg-white"}`}
    >
      <Text className={`${active ? "text-white" : "text-gray-700"} font-extrabold text-xs`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function AnnouncementsTab({ list }: { list: Announcement[] }) {
  if (list.length === 0) {
    return (
      <View className="bg-white p-6 rounded-3xl shadow border border-gray-100">
        <Text className="text-gray-700 font-bold">No announcements</Text>
        <Text className="text-gray-500 mt-1">Send the first announcement from below.</Text>
      </View>
    );
  }

  return (
    <>
      {list.map((a) => (
        <View key={a.id} className="bg-white p-5 rounded-3xl shadow border border-gray-100 mb-3">
          <Text className="text-gray-800 font-extrabold">{a.createdByName}</Text>
          <Text className="text-gray-700 mt-2">{a.text}</Text>
        </View>
      ))}
    </>
  );
}

function MembersTab({ members }: { members: { uid: string; name: string; email: string; role: "admin" | "member" }[] }) {
  if (members.length === 0) {
    return (
      <View className="bg-white p-6 rounded-3xl shadow border border-gray-100">
        <Text className="text-gray-700 font-bold">No members</Text>
        <Text className="text-gray-500 mt-1">Members list not available.</Text>
      </View>
    );
  }

  return (
    <View className="bg-white p-5 rounded-3xl shadow border border-gray-100">
      {members.map((m) => (
        <View key={m.uid} className="py-3 border-b border-gray-100 last:border-b-0">
          <View className="flex-row justify-between">
            <Text className="text-gray-900 font-extrabold">{m.name || "User"}</Text>
            <Text className="text-gray-500 text-xs font-bold">{m.role}</Text>
          </View>
          <Text className="text-gray-500 mt-1">{m.email}</Text>
        </View>
      ))}
    </View>
  );
}

function RequestsTab({
  requests,
  onAccept,
  onReject,
}: {
  requests: { uid: string; name: string; email: string }[];
  onAccept: (req: { uid: string; name: string; email: string }) => void;
  onReject: (uid: string) => void;
}) {
  if (requests.length === 0) {
    return (
      <View className="bg-white p-6 rounded-3xl shadow border border-gray-100">
        <Text className="text-gray-700 font-bold">No pending requests</Text>
        <Text className="text-gray-500 mt-1">When someone requests, it will appear here.</Text>
      </View>
    );
  }

  return (
    <>
      {requests.map((r) => (
        <View key={r.uid} className="bg-white p-5 rounded-3xl shadow border border-gray-100 mb-3">
          <Text className="text-gray-900 font-extrabold">{r.name || "User"}</Text>
          <Text className="text-gray-500 mt-1">{r.email}</Text>

          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity onPress={() => onAccept(r)} className="flex-1 rounded-full overflow-hidden">
              <LinearGradient colors={["#22c55e", "#86efac"]} className="py-3 items-center">
                <Text className="text-white font-extrabold">Accept</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => onReject(r.uid)} className="flex-1 rounded-full overflow-hidden">
              <LinearGradient colors={["#ef4444", "#fb7185"]} className="py-3 items-center">
                <Text className="text-white font-extrabold">Reject</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </>
  );
}
