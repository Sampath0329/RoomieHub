import React, { useState } from "react";
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Input } from "../../src/components/ui/Input";
import { useAuth } from "../../src/hooks/useAuth";
import { useRoom } from "../../src/hooks/useRoom";

export default function HomeScreen() {
  const router = useRouter();
  const { user, signOutUser, loading } = useAuth();

  const {
    myRooms,
    selectRoom,
    createNewRoom,
    sendJoinRequestByCode,
    loadingRoom,
  } = useRoom();

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
    <LinearGradient colors={["#faf5ff", "#f3e8ff", "#ffffff"]} className="flex-1">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="px-6 pt-6 flex-row justify-between items-center">
          <View>
            <Text className="text-gray-500 font-medium">Rooms</Text>
            <Text className="text-2xl font-extrabold text-purple-700">
              {user?.displayName || "Roomie"}
            </Text>
            <Text className="text-gray-500 mt-1">{user?.email}</Text>
          </View>

          <TouchableOpacity
            disabled={loading}
            onPress={signOutUser}
            className={`px-4 py-2 rounded-full bg-red-500 ${loading ? "opacity-60" : ""}`}
          >
            <Text className="text-white font-bold">Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Alerts */}
        <View className="px-6 mt-3">
          {localErr ? <Text className="text-red-600 font-semibold">{localErr}</Text> : null}
          {localMsg ? <Text className="text-green-600 font-semibold">{localMsg}</Text> : null}
        </View>

        <ScrollView className="px-6 mt-4" contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Create Room */}
          <View className="bg-white p-5 rounded-3xl shadow-lg border border-gray-100 mb-4">
            <Text className="text-gray-800 font-extrabold text-lg">Create a Room</Text>

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

          {/* Join Room */}
          <View className="bg-white p-5 rounded-3xl shadow-lg border border-gray-100 mb-6">
            <Text className="text-gray-800 font-extrabold text-lg">Join a Room</Text>
            <Text className="text-gray-500 mt-1">
              request to join.
            </Text>

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

          {/* My Rooms List */}
          <Text className="text-gray-800 font-extrabold text-lg mb-3">My Rooms</Text>

          {myRooms.length === 0 ? (
            <View className="bg-white p-6 rounded-3xl shadow border border-gray-100">
              <Text className="text-gray-700 font-bold">No rooms yet</Text>
              <Text className="text-gray-500 mt-1">Room List.</Text>
            </View>
          ) : (
            myRooms.map((r) => (
              <TouchableOpacity
                key={r.id}
                onPress={async () => {
                  await selectRoom(r.id);
                  router.push({
                    pathname: "/(dashboard)/room/[id]",
                    params: { id: r.id },
                  });
                }}
                className="bg-white p-5 rounded-3xl shadow-lg border border-gray-100 mb-3"
              >
                <Text className="text-gray-800 font-extrabold text-lg">{r.name}</Text>
                <Text className="text-gray-500 mt-1">
                  Code: <Text className="font-bold text-purple-700">{r.code}</Text>
                </Text>
                <Text className="text-gray-400 mt-1 text-sm">Tap to open</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
