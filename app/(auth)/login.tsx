import React, { useEffect, useMemo, useState } from "react";
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

import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, forgotPassword, googleSignIn, loading, error, message, clearAlerts } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const canSubmit = email.trim().length > 0 && password.length >= 6 && !loading;

  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  const redirectUri = useMemo(
    () =>
      makeRedirectUri({
        scheme: "roomiehub",
      }),
    []
  );

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: webClientId,         
    androidClientId: webClientId,  
    redirectUri,
    responseType: "id_token",
    scopes: ["openid", "profile", "email"],
    extraParams: {
      prompt: "select_account",
    },
  });

  useEffect(() => {
    if (response?.type !== "success") return;

    const idToken = (response as any)?.params?.id_token as string | undefined;
    if (!idToken) return;

    googleSignIn(idToken);
  }, [response, googleSignIn]);

  return (
    <LinearGradient colors={["#faf5ff", "#f3e8ff", "#ffffff"]} className="flex-1">
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 32 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="items-center mb-12">
              <View className="relative mb-8">
                <View className="absolute top-0 left-10 w-24 h-24 bg-cyan-500 rounded-full opacity-90 shadow-2xl" />
                <View className="absolute top-8 left-0 w-24 h-24 bg-purple-500 rounded-full opacity-90 shadow-2xl" />
                <View className="absolute top-16 left-14 w-24 h-24 bg-red-500 rounded-full opacity-90 shadow-2xl" />
              </View>

              <Text className="text-5xl font-extrabold text-purple-600 tracking-tight">RoomieHub</Text>
              <Text className="text-lg text-gray-600 mt-3 font-medium">Welcome back! Login to continue</Text>
            </View>

            <View className="space-y-6">
              <Input
                placeholder="Email Address"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                onFocus={clearAlerts}
              />

              <Input
                placeholder="Password"
                secureTextEntry
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
                onFocus={clearAlerts}
              />

              {error ? <Text className="text-red-500 font-medium text-center">{error}</Text> : null}
              {message ? <Text className="text-green-600 font-medium text-center">{message}</Text> : null}

              <TouchableOpacity
                className="items-center mt-2"
                onPress={async () => {
                  clearAlerts();
                  if (!email.trim()) return;
                  await forgotPassword(email);
                }}
              >
                <Text className="text-purple-600 font-medium text-base">Forgot password?</Text>
              </TouchableOpacity>

              {/* Email/Password */}
              <TouchableOpacity
                disabled={!canSubmit}
                onPress={async () => {
                  clearAlerts();
                  await signIn(email, password);
                }}
                className={`rounded-full shadow-2xl overflow-hidden ${!canSubmit ? "opacity-60" : ""}`}
              >
                <LinearGradient
                  colors={["#06b6d4", "#8b5cf6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="py-5 items-center"
                >
                  <Text className="text-white font-bold text-xl">{loading ? "Loading..." : "Login"}</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Google */}
              <TouchableOpacity
                disabled={loading || !request}
                onPress={async () => {
                  clearAlerts();
                  await promptAsync({ useProxy: true } as any);
                }}
                className={`bg-white rounded-full py-5 items-center shadow-2xl border border-gray-200 ${
                  loading || !request ? "opacity-60" : ""
                }`}
              >
                <Text className="text-gray-800 font-bold text-xl">
                  {loading ? "Please wait..." : "Continue with Google"}
                </Text>
              </TouchableOpacity>

              {/* Register */}
              <TouchableOpacity
                onPress={() => router.push("/(auth)/register")}
                className="bg-white rounded-full py-5 items-center shadow-2xl border border-gray-200"
              >
                <Text className="text-gray-800 font-bold text-xl">Register</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
