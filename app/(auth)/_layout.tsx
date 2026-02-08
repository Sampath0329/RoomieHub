import { Stack, Redirect } from "expo-router";
import { useAuth } from "../../src/hooks/useAuth";

export default function AuthLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;

  //already logged in => kick out from auth screens
  if (user) {
    return <Redirect href="/(dashboard)/home" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    />
  );
}
