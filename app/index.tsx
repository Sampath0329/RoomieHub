import { Redirect } from "expo-router";
import { useAuth } from "../src/hooks/useAuth";

export default function Index() {
  // console.log("INDEX SCREEN RENDERED"); 

  const { user, loading } = useAuth();

  if (loading) return null;

  return user ? <Redirect href="/(dashboard)/home" /> : <Redirect href="/welcome" />;
}
