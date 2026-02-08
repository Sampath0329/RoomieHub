import React from "react";
import { View, Text, SafeAreaView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/hooks/useAuth";

export default function HomeScreen() {
  const router = useRouter();
  const { user, signOutUser, loading } = useAuth();

  return (
    <LinearGradient colors={["#ffffff", "#f3e8ff", "#faf5ff"]} className="flex-1">
      <SafeAreaView className="flex-1 px-6">
        <View className="flex-1 justify-center">
          <Text className="text-4xl font-extrabold text-purple-700 text-center">
            Dashboard
          </Text>

          <Text className="text-lg text-gray-600 mt-3 text-center font-medium">
            ✅ Login Success!
          </Text>

          <View className="bg-white mt-8 p-6 rounded-3xl shadow-2xl border border-gray-200">
            <Text className="text-gray-800 text-base font-semibold">
              Logged User Details
            </Text>

            <View className="mt-4 space-y-2">
              <Text className="text-gray-700">
                👤 Name:{" "}
                <Text className="font-bold">
                  {user?.displayName || "No Name"}
                </Text>
              </Text>

              <Text className="text-gray-700">
                📧 Email:{" "}
                <Text className="font-bold">
                  {user?.email || "No Email"}
                </Text>
              </Text>

              <Text className="text-gray-700">
                🆔 UID:{" "}
                <Text className="font-bold">
                  {user?.uid?.slice(0, 10)}...
                </Text>
              </Text>
            </View>
          </View>


          <Text className="text-center text-gray-500 mt-8">
            RoomieHub • Dashboard Sample
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
