import React, { createContext, useEffect, useMemo, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { loginWithEmail, logout, registerWithEmail, resetPassword } from "../lib/auth.api";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  message: string | null;
  clearAlerts: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (fullName: string, email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

function friendlyError(e: any) {
  const code = e?.code as string | undefined;
  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already in use.";
    case "auth/invalid-email":
      return "The email format is invalid.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Email or password is incorrect.";
    case "auth/user-not-found":
      return "No account found for this email.";
    default:
      return "An error occurred. Please try again.";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      error,
      message,

      clearAlerts: () => {
        setError(null);
        setMessage(null);
      },

      signIn: async (email, password) => {
        try {
          setError(null);
          setMessage(null);
          setLoading(true);
          await loginWithEmail(email, password);
        } catch (e) {
          setError(friendlyError(e));
        } finally {
          setLoading(false);
        }
      },

      signUp: async (fullName, email, password) => {
        try {
          setError(null);
          setMessage(null);
          setLoading(true);
          await registerWithEmail(email, password, fullName);
        } catch (e) {
          setError(friendlyError(e));
        } finally {
          setLoading(false);
        }
      },

      signOutUser: async () => {
        try {
          setError(null);
          setMessage(null);
          setLoading(true);
          await logout();
        } catch (e) {
          setError(friendlyError(e));
        } finally {
          setLoading(false);
        }
      },

      forgotPassword: async (email) => {
        try {
          setError(null);
          setMessage(null);
          await resetPassword(email);
          setMessage("Password reset link sent to your email");
        } catch (e) {
          setError(friendlyError(e));
        }
      },
    }),
    [user, loading, error, message]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
