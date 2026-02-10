export async function uploadToCloudinary(localUri: string) {
  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const apiKey = process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY;

  console.log("cloudName:", cloudName);
  console.log("uploadPreset:", uploadPreset);
  console.log("apiKey:", apiKey ? "SET" : "MISSING");
  console.log("localUri:", localUri);

  if (!cloudName || !uploadPreset || !apiKey) {
    throw new Error("Missing Cloudinary env vars. Restart Expo with: npx expo start -c");
  }

  const ext = (localUri.split(".").pop() || "jpg").toLowerCase();
  const mime =
    ext === "png"
      ? "image/png"
      : ext === "webp"
      ? "image/webp"
      : ext === "heic" || ext === "heif"
      ? "image/heic"
      : "image/jpeg";

  const form = new FormData();
  form.append("file", {
    uri: localUri,
    name: `profile.${ext}`,
    type: mime,
  } as any);

  form.append("upload_preset", uploadPreset);

  form.append("api_key", apiKey);

  // optional
  form.append("folder", "roomiehub/profile");

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const res = await fetch(url, { method: "POST", body: form });

  let data: any;
  try {
    data = await res.json();
  } catch {
    const text = await res.text();
    console.log("Cloudinary raw response:", text);
    throw new Error("Cloudinary returned non-JSON response");
  }

  console.log("Cloudinary response:", data);

  if (!res.ok) throw new Error(data?.error?.message || "Upload failed");

  return data.secure_url as string;
}
