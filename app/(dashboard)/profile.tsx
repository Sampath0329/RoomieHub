import React, { useState } from "react";
import { View, Text, SafeAreaView, TouchableOpacity, Image, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { useAuth } from "../../src/hooks/useAuth";
import { useTheme } from "../../src/hooks/useTheme";
import { uploadToCloudinary } from "../../src/lib/cloudinary.api";
import { updateUserPhoto } from "../../src/lib/profile.api";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../src/lib/firebase";

function ModeButton({ label, value, current, onPress, theme }: any) {
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
      <Text style={{ color: active ? "#fff" : theme.colors.text, fontWeight: "800", fontSize: 16 }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOutUser, loading } = useAuth();
  const { theme, mode, setMode } = useTheme();

  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  React.useEffect(() => {
    (async () => {
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.data() as any;
      setPhotoURL(data?.photoURL || null);
    })();
  }, [user?.uid]);

  async function onPickAndUpload() {
    if (!user) return;

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission required", "Please allow photo library access to upload an image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      // ✅ Compatible fix (works across expo-image-picker versions)
      // Instead of ImagePicker.MediaTypeOptions.Images OR ImagePicker.MediaType.Images
      mediaTypes: "images" as any,

      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled) return;

    try {
      setBusy(true);

      const uri = result.assets?.[0]?.uri;
      if (!uri) throw new Error("No image selected");

      const url = await uploadToCloudinary(uri);
      await updateUserPhoto(user.uid, url);

      setPhotoURL(url);
    } catch (e: any) {
      console.log(e?.message || e);
      Alert.alert("Upload error", e?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

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
            className="p-5 rounded-3xl"
            style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1 }}
          >
            <View style={{ alignItems: "center", marginBottom: 16 }}>
              <TouchableOpacity onPress={onPickAndUpload} disabled={busy}>
                {photoURL ? (
                  <Image
                    source={{ uri: photoURL }}
                    style={{ width: 96, height: 96, borderRadius: 48 }}
                  />
                ) : (
                  <View
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: 48,
                      backgroundColor: theme.colors.border,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: theme.colors.subtext, fontWeight: "800" }}>Add</Text>
                  </View>
                )}
              </TouchableOpacity>

              <Text style={{ color: theme.colors.subtext, marginTop: 8 }}>
                {busy ? "Uploading..." : "Tap to change photo"}
              </Text>
            </View>

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
