import React, { useEffect, useMemo, useState } from "react";
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useAuth } from "../../../src/hooks/useAuth";
import { useRoom } from "../../../src/hooks/useRoom";
import { useTheme } from "../../../src/hooks/useTheme";
import { Input } from "../../../src/components/ui/Input";
import { addAnnouncement, listenAnnouncements, type Announcement } from "../../../src/lib/announcement.api";

type TabKey = "ann" | "mem" | "req";

export default function RoomScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const roomId = String(id);

  const { user } = useAuth();
  const { theme } = useTheme();
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
    <LinearGradient colors={theme.colors.gradient} className="flex-1">
      <SafeAreaView className="flex-1">
        <View className="px-6 pt-6 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: theme.colors.primary, fontWeight: "800" }}>Back</Text>
          </TouchableOpacity>

          <View className="items-center" style={{ maxWidth: 220 }}>
            <Text
              style={{ color: theme.colors.text, fontWeight: "900", fontSize: 16 }}
              numberOfLines={1}
            >
              {headerTitle}
            </Text>
            <Text style={{ color: theme.colors.subtext, fontSize: 12 }}>
              {isAdmin ? "Admin" : "Member"}
            </Text>
          </View>

          <View style={{ width: 50 }} />
        </View>

        <View className="px-6 mt-4">
          <View
            className="flex-row rounded-2xl overflow-hidden"
            style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1 }}
          >
            <TabButton
              label="Announcements"
              active={tab === "ann"}
              onPress={() => setTab("ann")}
              theme={theme}
            />
            <TabButton
              label="Members"
              active={tab === "mem"}
              onPress={() => setTab("mem")}
              theme={theme}
            />
            <TabButton
              label="Requests"
              active={tab === "req"}
              onPress={() => setTab("req")}
              disabled={!isAdmin}
              theme={theme}
            />
          </View>

          {!isAdmin ? (
            <Text style={{ color: theme.colors.subtext, fontSize: 12, marginTop: 8 }}>
              Requests tab is only for admin.
            </Text>
          ) : null}

          {localErr ? <Text style={{ color: "#EF4444", fontWeight: "700", marginTop: 12 }}>{localErr}</Text> : null}
        </View>

        <ScrollView
          className="px-6 mt-4"
          contentContainerStyle={{ paddingBottom: tab === "ann" ? 140 : 40 }}
        >
          {loadingRoom ? (
            <View
              className="p-6 rounded-3xl shadow"
              style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1 }}
            >
              <Text style={{ color: theme.colors.text, fontWeight: "800" }}>Loading...</Text>
            </View>
          ) : null}

          {tab === "ann" ? <AnnouncementsTab list={annList} theme={theme} /> : null}
          {tab === "mem" ? <MembersTab members={members} theme={theme} /> : null}
          {tab === "req" ? (
            isAdmin ? (
              <RequestsTab requests={requests} onAccept={onAccept} onReject={onReject} theme={theme} />
            ) : (
              <View
                className="p-6 rounded-3xl shadow"
                style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1 }}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "800" }}>Admin only</Text>
                <Text style={{ color: theme.colors.subtext, marginTop: 6 }}>
                  Only admin can see join requests.
                </Text>
              </View>
            )
          ) : null}
        </ScrollView>

        {tab === "ann" ? (
          <View
            className="absolute bottom-0 left-0 right-0 px-6 pb-6 pt-3"
            style={{ backgroundColor: theme.colors.card, borderTopColor: theme.colors.border, borderTopWidth: 1 }}
          >
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
  theme,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  disabled?: boolean;
  theme: any;
}) {
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      className="flex-1 py-3 items-center"
      style={{
        opacity: disabled ? 0.4 : 1,
        backgroundColor: active ? theme.colors.primary : theme.colors.card,
      }}
    >
      <Text
        style={{
          color: active ? "#FFFFFF" : theme.colors.text,
          fontWeight: "900",
          fontSize: 12,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function AnnouncementsTab({ list, theme }: { list: Announcement[]; theme: any }) {
  if (list.length === 0) {
    return (
      <View
        className="p-6 rounded-3xl shadow"
        style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1 }}
      >
        <Text style={{ color: theme.colors.text, fontWeight: "800" }}>No announcements</Text>
        <Text style={{ color: theme.colors.subtext, marginTop: 6 }}>
          Send the first announcement from below.
        </Text>
      </View>
    );
  }

  return (
    <>
      {list.map((a) => (
        <View
          key={a.id}
          className="p-5 rounded-3xl shadow mb-3"
          style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1 }}
        >
          <Text style={{ color: theme.colors.text, fontWeight: "900" }}>{a.createdByName}</Text>
          <Text style={{ color: theme.colors.subtext, marginTop: 8 }}>{a.text}</Text>
        </View>
      ))}
    </>
  );
}

function MembersTab({
  members,
  theme,
}: {
  members: { uid: string; name: string; email: string; role: "admin" | "member" }[];
  theme: any;
}) {
  if (members.length === 0) {
    return (
      <View
        className="p-6 rounded-3xl shadow"
        style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1 }}
      >
        <Text style={{ color: theme.colors.text, fontWeight: "800" }}>No members</Text>
        <Text style={{ color: theme.colors.subtext, marginTop: 6 }}>Members list not available.</Text>
      </View>
    );
  }

  return (
    <View
      className="p-5 rounded-3xl shadow"
      style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1 }}
    >
      {members.map((m) => (
        <View
          key={m.uid}
          style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}
        >
          <View className="flex-row justify-between">
            <Text style={{ color: theme.colors.text, fontWeight: "900" }}>{m.name || "User"}</Text>
            <Text style={{ color: theme.colors.subtext, fontSize: 12, fontWeight: "800" }}>{m.role}</Text>
          </View>
          <Text style={{ color: theme.colors.subtext, marginTop: 6 }}>{m.email}</Text>
        </View>
      ))}
    </View>
  );
}

function RequestsTab({
  requests,
  onAccept,
  onReject,
  theme,
}: {
  requests: { uid: string; name: string; email: string }[];
  onAccept: (req: { uid: string; name: string; email: string }) => void;
  onReject: (uid: string) => void;
  theme: any;
}) {
  if (requests.length === 0) {
    return (
      <View
        className="p-6 rounded-3xl shadow"
        style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1 }}
      >
        <Text style={{ color: theme.colors.text, fontWeight: "800" }}>No pending requests</Text>
        <Text style={{ color: theme.colors.subtext, marginTop: 6 }}>
          When someone requests, it will appear here.
        </Text>
      </View>
    );
  }

  return (
    <>
      {requests.map((r) => (
        <View
          key={r.uid}
          className="p-5 rounded-3xl shadow mb-3"
          style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1 }}
        >
          <Text style={{ color: theme.colors.text, fontWeight: "900" }}>{r.name || "User"}</Text>
          <Text style={{ color: theme.colors.subtext, marginTop: 6 }}>{r.email}</Text>

          <View className="flex-row" style={{ gap: 12, marginTop: 16 }}>
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
