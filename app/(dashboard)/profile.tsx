import React from "react";
import { View, Text, SafeAreaView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import { useAuth } from "../../src/hooks/useAuth";
import { useTheme } from "../../src/hooks/useTheme";
import { ThemeMode } from "../../src/util/theme";

function ModeButton({
  label,
  value,
  current,
  onPress,
  theme,
}: {
  label: string;
  value: ThemeMode;
  current: ThemeMode;
  onPress: (v: ThemeMode) => void;
  theme: any;
}) {
  const active = current === value;

  return (
    <TouchableOpacity
      onPress={() => onPress(value)}
      className="py-4 px-4 rounded-2xl mb-3"
      style={{
        backgroundColor: active ? theme.colors.primary : theme.colors.card,
        borderWidth: 1,
        borderColor: active ? "transparent" : theme.colors.border,
      }}
    >
      <Text
        style={{
          color: active ? "#FFFFFF" : theme.colors.text,
          fontWeight: "800",
          fontSize: 16,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOutUser, loading } = useAuth();
  const { theme, mode, setMode } = useTheme();

  return (
    <LinearGradient colors={theme.colors.gradient} className="flex-1">
      <SafeAreaView className="flex-1">
        <View className="px-6 pt-6 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: theme.colors.primary, fontWeight: "800" }}>Back</Text>
          </TouchableOpacity>

          <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 18 }}>Profile</Text>

          <View style={{ width: 50 }} />
        </View>

        <View className="px-6 mt-6">
          <View
            className="p-5 rounded-3xl shadow"
            style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1 }}
          >
            <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 20 }}>
              {user?.displayName || "Roomie"}
            </Text>
            <Text style={{ color: theme.colors.subtext, marginTop: 6 }}>{user?.email}</Text>
          </View>

          <View className="mt-6">
            <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 18, marginBottom: 12 }}>
              Appearance
            </Text>

            <ModeButton label="System" value="system" current={mode} onPress={setMode} theme={theme} />
            <ModeButton label="Light" value="light" current={mode} onPress={setMode} theme={theme} />
            <ModeButton label="Dark" value="dark" current={mode} onPress={setMode} theme={theme} />

            <Text style={{ color: theme.colors.subtext, marginTop: 10 }}>
              Theme changes apply across the whole app.
            </Text>
          </View>

          <View className="mt-8">
            <TouchableOpacity
              disabled={loading}
              onPress={signOutUser}
              className={`rounded-full overflow-hidden ${loading ? "opacity-60" : ""}`}
            >
              <LinearGradient colors={[theme.colors.danger, theme.colors.danger]} className="py-4 items-center">
                <Text className="text-white font-extrabold text-lg">Logout</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
