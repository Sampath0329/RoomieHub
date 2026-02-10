import React, { useState } from "react";
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Input } from "../../src/components/ui/Input";
import { useAuth } from "../../src/hooks/useAuth";
import { useRoom } from "../../src/hooks/useRoom";
import { useTheme } from "../../src/hooks/useTheme";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();

  const { myRooms, selectRoom, createNewRoom, sendJoinRequestByCode, loadingRoom } = useRoom();

  const [roomName, setRoomName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [localMsg, setLocalMsg] = useState<string | null>(null);
  const [localErr, setLocalErr] = useState<string | null>(null);

  async function onCreateRoom() {
    setLocalErr(null);
    setLocalMsg(null);

    if (!roomName.trim()) {
      setLocalErr("Type Room name.");
      return;
    }

    try {
      await createNewRoom(roomName.trim());
      setRoomName("");
      setLocalMsg("Room created!");
    } catch (e: any) {
      setLocalErr(e?.message || "Room create failed.");
    }
  }

  async function onJoinRoom() {
    setLocalErr(null);
    setLocalMsg(null);

    if (!joinCode.trim()) {
      setLocalErr("Type Room code.");
      return;
    }

    try {
      await sendJoinRequestByCode(joinCode.trim().toUpperCase());
      setJoinCode("");
      setLocalMsg("Join request sent!");
    } catch (e: any) {
      setLocalErr(e?.message || "Join request failed.");
    }
  }

  return (
    <LinearGradient colors={theme.colors.gradient} className="flex-1">
      <SafeAreaView className="flex-1">
        <View className="px-6 pt-6 flex-row justify-between items-center">
          <View>
            <Text style={{ color: theme.colors.subtext, fontWeight: "600" }}>Rooms</Text>
            <Text style={{ color: theme.colors.primary, fontSize: 24, fontWeight: "800" }}>
              {user?.displayName || "Roomie"}
            </Text>
            <Text style={{ color: theme.colors.subtext, marginTop: 4 }}>{user?.email}</Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/(dashboard)/profile")}
            className="w-11 h-11 rounded-full items-center justify-center"
            style={{
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              borderWidth: 1,
            }}
          >
            <Ionicons name="settings-outline" size={22} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View className="px-6 mt-3">
          {localErr ? <Text style={{ color: "#EF4444", fontWeight: "700" }}>{localErr}</Text> : null}
          {localMsg ? <Text style={{ color: "#22C55E", fontWeight: "700" }}>{localMsg}</Text> : null}
        </View>

        <ScrollView className="px-6 mt-4" contentContainerStyle={{ paddingBottom: 40 }}>
          <View
            className="p-5 rounded-3xl shadow-lg mb-4"
            style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1 }}
          >
            <Text style={{ color: theme.colors.text, fontWeight: "800", fontSize: 18 }}>Create a Room</Text>

            <View className="mt-4">
              <Input
                placeholder="Room Name (e.g., Hostel Room 3)"
                value={roomName}
                onChangeText={setRoomName}
              />
            </View>

            <TouchableOpacity
              disabled={loadingRoom}
              onPress={onCreateRoom}
              className={`rounded-full overflow-hidden mt-4 ${loadingRoom ? "opacity-60" : ""}`}
            >
              <LinearGradient colors={["#8b5cf6", "#a78bfa"]} className="py-4 items-center">
                <Text className="text-white font-extrabold text-lg">
                  {loadingRoom ? "Creating..." : "Create Room"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View
            className="p-5 rounded-3xl shadow-lg mb-6"
            style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1 }}
          >
            <Text style={{ color: theme.colors.text, fontWeight: "800", fontSize: 18 }}>Join a Room</Text>
            <Text style={{ color: theme.colors.subtext, marginTop: 4 }}>request to join.</Text>

            <View className="mt-4">
              <Input
                placeholder="Room Code (e.g., AB12CD)"
                value={joinCode}
                onChangeText={(t) => setJoinCode(t.toUpperCase())}
                autoCapitalize="characters"
              />
            </View>

            <TouchableOpacity
              disabled={loadingRoom}
              onPress={onJoinRoom}
              className={`rounded-full overflow-hidden mt-4 ${loadingRoom ? "opacity-60" : ""}`}
            >
              <LinearGradient colors={["#06b6d4", "#67e8f9"]} className="py-4 items-center">
                <Text className="text-white font-extrabold text-lg">
                  {loadingRoom ? "Sending..." : "Send Join Request"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={{ color: theme.colors.text, fontWeight: "800", fontSize: 18, marginBottom: 12 }}>
            My Rooms
          </Text>

          {myRooms.length === 0 ? (
            <View
              className="p-6 rounded-3xl shadow"
              style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1 }}
            >
              <Text style={{ color: theme.colors.text, fontWeight: "800" }}>No rooms yet</Text>
              <Text style={{ color: theme.colors.subtext, marginTop: 4 }}>Room List.</Text>
            </View>
          ) : (
            myRooms.map((r) => (
              <TouchableOpacity
                key={r.id}
                onPress={async () => {
                  await selectRoom(r.id);
                  router.push({ pathname: "/(dashboard)/room/[id]", params: { id: r.id } });
                }}
                className="p-5 rounded-3xl shadow-lg mb-3"
                style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1 }}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "800", fontSize: 18 }}>{r.name}</Text>
                <Text style={{ color: theme.colors.subtext, marginTop: 4 }}>
                  Code: <Text style={{ color: theme.colors.primary, fontWeight: "800" }}>{r.code}</Text>
                </Text>
                <Text style={{ color: theme.colors.subtext, marginTop: 4, fontSize: 12 }}>Tap to open</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
