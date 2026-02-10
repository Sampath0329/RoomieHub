import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Input } from "../../src/components/ui/Input";
import { useAuth } from "../../src/hooks/useAuth";

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, loading, error, clearAlerts, user } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passMatch = password === confirmPassword;

  const canSubmit =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 6 &&
    confirmPassword.length >= 6 &&
    passMatch &&
    !loading;

  const localError =
    !passMatch && confirmPassword.length > 0 ? "Passwords not match !." : null;

  
  useEffect(() => {
    if (user) {
      router.replace("/(dashboard)/home");
    }
  }, [user, router]);

  return (
    <LinearGradient colors={["#faf5ff", "#f3e8ff", "#ffffff"]} className="flex-1">
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingHorizontal: 32,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="items-center mb-12">
              <View className="relative mb-8">
                <View className="absolute top-0 left-10 w-24 h-24 bg-cyan-500 rounded-full opacity-90 shadow-2xl" />
                <View className="absolute top-8 left-0 w-24 h-24 bg-purple-500 rounded-full opacity-90 shadow-2xl" />
                <View className="absolute top-16 left-14 w-24 h-24 bg-red-500 rounded-full opacity-90 shadow-2xl" />
              </View>

              <Text className="text-5xl font-extrabold text-purple-600 tracking-tight">
                RoomieHub
              </Text>
              <Text className="text-lg text-gray-600 mt-3 font-medium">
                Create your account
              </Text>
            </View>

            <View className="space-y-6">
              <Input
                placeholder="Full Name"
                autoCapitalize="words"
                value={fullName}
                onChangeText={(t) => setFullName(t)}
                onFocus={clearAlerts}
              />

              <Input
                placeholder="Email Address"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={(t) => setEmail(t)}
                onFocus={clearAlerts}
              />

              <Input
                placeholder="Password"
                secureTextEntry
                autoCapitalize="none"
                value={password}
                onChangeText={(t) => setPassword(t)}
                onFocus={clearAlerts}
              />

              <Input
                placeholder="Confirm Password"
                secureTextEntry
                autoCapitalize="none"
                value={confirmPassword}
                onChangeText={(t) => setConfirmPassword(t)}
                onFocus={clearAlerts}
              />

              {localError ? (
                <Text className="text-red-500 font-medium text-center">{localError}</Text>
              ) : null}

              {error ? (
                <Text className="text-red-500 font-medium text-center">{error}</Text>
              ) : null}

              <TouchableOpacity
                disabled={!canSubmit}
                onPress={async () => {
                  clearAlerts();
                  if (!canSubmit) return;
                  await signUp(fullName, email, password);
                }}
                className={`rounded-full shadow-2xl overflow-hidden ${
                  !canSubmit ? "opacity-60" : ""
                }`}
              >
                <LinearGradient
                  colors={["#06b6d4", "#8b5cf6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="py-5 items-center"
                >
                  <Text className="text-white font-bold text-xl">
                    {loading ? "Creating..." : "Create Account"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={loading}
                onPress={() => router.back()}
                className={`bg-white rounded-full py-5 items-center shadow-2xl border border-gray-200 ${
                  loading ? "opacity-60" : ""
                }`}
              >
                <Text className="text-gray-800 font-bold text-xl">Back to Login</Text>
              </TouchableOpacity>
            </View>

            <View className="h-10" />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
