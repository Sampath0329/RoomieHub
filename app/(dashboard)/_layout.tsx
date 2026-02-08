import { Stack, Redirect } from "expo-router";
import { useAuth } from "../../src/hooks/useAuth";

export default function DashboardLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;

  //not logged => back to login
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
