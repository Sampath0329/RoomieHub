import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useAuth } from "../../../src/hooks/useAuth";
import { useRoom } from "../../../src/hooks/useRoom";
import { useTheme } from "../../../src/hooks/useTheme";
import { Input } from "../../../src/components/ui/Input";
import { addAnnouncement, listenAnnouncements, type Announcement } from "../../../src/lib/announcement.api";

type TabKey = "ann" | "mem" | "req";

function formatMsgTime(createdAt?: any) {
  try {
    const d: Date | null = createdAt?.toDate ? createdAt.toDate() : null;
    if (!d) return "";
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  } catch {
    return "";
  }
}

export default function RoomScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
    if (!roomId) return;
    (async () => {
      try {
        await selectRoom(roomId);
      } catch {}
    })();
  }, [roomId, selectRoom]);

  useEffect(() => {
    if (!roomId) return;
    const unsub = listenAnnouncements(roomId, setAnnList);
    return () => unsub?.();
  }, [roomId]);

  const headerTitle = useMemo(() => {
    if (room?.id === roomId) return room.name;
    return "Room";
  }, [room?.id, roomId, room?.name]);

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
    <LinearGradient colors={theme.colors.gradient} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
        >
          {/* Header */}
          <View
            style={{
              paddingHorizontal: 24,
              paddingTop: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ color: theme.colors.primary, fontWeight: "800" }}>Back</Text>
            </TouchableOpacity>

            <View style={{ alignItems: "center", maxWidth: 220 }}>
              <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 16 }} numberOfLines={1}>
                {headerTitle}
              </Text>
              <Text style={{ color: theme.colors.subtext, fontSize: 12 }}>{isAdmin ? "Admin" : "Member"}</Text>
            </View>

            <View style={{ width: 50 }} />
          </View>

          {/* Tabs */}
          <View style={{ paddingHorizontal: 24, marginTop: 16 }}>
            <View
              style={{
                flexDirection: "row",
                borderRadius: 16,
                overflow: "hidden",
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                borderWidth: 1,
              }}
            >
              <TabButton label="Announcements" active={tab === "ann"} onPress={() => setTab("ann")} theme={theme} />
              <TabButton label="Members" active={tab === "mem"} onPress={() => setTab("mem")} theme={theme} />
              <TabButton
                label="Requests"
                active={tab === "req"}
                onPress={() => setTab("req")}
                disabled={!isAdmin}
                theme={theme}
              />
            </View>

            {!isAdmin ? (
              <Text style={{ color: theme.colors.subtext, fontSize: 12, marginTop: 8 }}>Requests tab is only for admin.</Text>
            ) : null}

            {localErr ? (
              <Text style={{ color: theme.colors.danger, fontWeight: "700", marginTop: 12 }}>{localErr}</Text>
            ) : null}
          </View>

          {/* Content */}
          <ScrollView
            style={{ flex: 1, paddingHorizontal: 24, marginTop: 16 }}
            contentContainerStyle={{ paddingBottom: tab === "ann" ? 16 : 40 }}
            keyboardShouldPersistTaps="handled"
          >
            {loadingRoom ? (
              <Card theme={theme}>
                <Text style={{ color: theme.colors.text, fontWeight: "800" }}>Loading...</Text>
              </Card>
            ) : null}

            {tab === "ann" ? (
              <AnnouncementsTab list={annList} theme={theme} currentUid={user?.uid || null} />
            ) : null}

            {tab === "mem" ? <MembersTab members={members} theme={theme} /> : null}

            {tab === "req" ? (
              isAdmin ? (
                <RequestsTab requests={requests} onAccept={onAccept} onReject={onReject} theme={theme} />
              ) : (
                <Card theme={theme}>
                  <Text style={{ color: theme.colors.text, fontWeight: "800" }}>Admin only</Text>
                  <Text style={{ color: theme.colors.subtext, marginTop: 6 }}>Only admin can see join requests.</Text>
                </Card>
              )
            ) : null}
          </ScrollView>

          {/* Composer */}
          {tab === "ann" ? (
            <View
              style={{
                paddingHorizontal: 24,
                paddingTop: 12,
                paddingBottom: Math.max(insets.bottom, 12) + 12,
                backgroundColor: theme.colors.card,
                borderTopColor: theme.colors.border,
                borderTopWidth: 1,
              }}
            >
              <Input placeholder="Type announcement..." value={text} onChangeText={setText} />
              <TouchableOpacity
                onPress={onSendAnnouncement}
                style={{ marginTop: 12, borderRadius: 999, overflow: "hidden" }}
              >
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.primary]}
                  style={{ paddingVertical: 16, alignItems: "center" }}
                >
                  <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>Send</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : null}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

/** Small reusable card */
function Card({ theme, children }: { theme: any; children: React.ReactNode }) {
  return (
    <View
      style={{
        padding: 16,
        borderRadius: 24,
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
        borderWidth: 1,
      }}
    >
      {children}
    </View>
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
      style={{
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
        opacity: disabled ? 0.4 : 1,
        backgroundColor: active ? theme.colors.primary : theme.colors.card,
      }}
    >
      <Text style={{ color: active ? "#fff" : theme.colors.text, fontWeight: "900", fontSize: 12 }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}


function AnnouncementsTab({
  list,
  theme,
  currentUid,
}: {
  list: Announcement[];
  theme: any;
  currentUid: string | null;
}) {
  if (list.length === 0) {
    return (
      <Card theme={theme}>
        <Text style={{ color: theme.colors.text, fontWeight: "800" }}>No announcements</Text>
        <Text style={{ color: theme.colors.subtext, marginTop: 6 }}>Send the first announcement from below.</Text>
      </Card>
    );
  }

  return (
    <View style={{ gap: 10 }}>
      {list.map((a) => {
        const isMine = !!currentUid && a.createdByUid === currentUid;
        const t = formatMsgTime(a.createdAt);

        return (
          <View
            key={a.id}
            style={{
              flexDirection: "row",
              justifyContent: isMine ? "flex-end" : "flex-start",
            }}
          >
            <View
              style={{
                maxWidth: "82%",
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 18,
                backgroundColor: isMine ? theme.colors.primary : theme.colors.card,
                borderWidth: isMine ? 0 : 1,
                borderColor: isMine ? "transparent" : theme.colors.border,
              }}
            >
              {/* Name line: You left, Other right */}
              <Text
                style={{
                  fontWeight: "900",
                  fontSize: 11,
                  color: isMine ? "#fff" : theme.colors.text,
                  marginBottom: 4,
                  width: "100%",
                  textAlign: isMine ? "right" : "left",
                }}
                numberOfLines={1}
              >
                {isMine ? "You" : a.createdByName}
              </Text>

              {/* Message */}
              <Text
                style={{
                  color: isMine ? "#fff" : theme.colors.subtext,
                  lineHeight: 20,
                  fontWeight: "600",
                }}
              >
                {a.text}
              </Text>

              {/* Time (under) */}
              {t ? (
                <Text
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    fontWeight: "700",
                    color: isMine ? "rgba(255,255,255,0.85)" : theme.colors.subtext,
                    textAlign: isMine ? "right" : "left",
                  }}
                >
                  {t}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
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
      <Card theme={theme}>
        <Text style={{ color: theme.colors.text, fontWeight: "800" }}>No members</Text>
        <Text style={{ color: theme.colors.subtext, marginTop: 6 }}>Members list not available.</Text>
      </Card>
    );
  }

  return (
    <View
      style={{
        padding: 16,
        borderRadius: 24,
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
        borderWidth: 1,
      }}
    >
      {members.map((m, idx) => (
        <View
          key={m.uid}
          style={{
            paddingVertical: 12,
            borderBottomWidth: idx === members.length - 1 ? 0 : 1,
            borderBottomColor: theme.colors.border,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
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
      <Card theme={theme}>
        <Text style={{ color: theme.colors.text, fontWeight: "800" }}>No pending requests</Text>
        <Text style={{ color: theme.colors.subtext, marginTop: 6 }}>When someone requests, it will appear here.</Text>
      </Card>
    );
  }

  return (
    <>
      {requests.map((r) => (
        <View
          key={r.uid}
          style={{
            padding: 16,
            borderRadius: 24,
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            borderWidth: 1,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: theme.colors.text, fontWeight: "900" }}>{r.name || "User"}</Text>
          <Text style={{ color: theme.colors.subtext, marginTop: 6 }}>{r.email}</Text>

          <View style={{ flexDirection: "row", gap: 12 as any, marginTop: 16 }}>
            <TouchableOpacity onPress={() => onAccept(r)} style={{ flex: 1, borderRadius: 999, overflow: "hidden" }}>
              <LinearGradient colors={["#22c55e", "#22c55e"]} style={{ paddingVertical: 12, alignItems: "center" }}>
                <Text style={{ color: "#fff", fontWeight: "900" }}>Accept</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onReject(r.uid)}
              style={{ flex: 1, borderRadius: 999, overflow: "hidden" }}
            >
              <LinearGradient
                colors={[theme.colors.danger, theme.colors.danger]}
                style={{ paddingVertical: 12, alignItems: "center" }}
              >
                <Text style={{ color: "#fff", fontWeight: "900" }}>Reject</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </>
  );
}
