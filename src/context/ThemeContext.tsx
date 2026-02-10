import React, { createContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";
import { AppTheme, ThemeMode, buildTheme } from "../util/theme";

const STORAGE_KEY = "roomiehub_theme_mode";

type ThemeCtx = {
  theme: AppTheme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
  isReady: boolean;
};

export const ThemeContext = createContext<ThemeCtx>({} as ThemeCtx);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const systemIsDark = systemScheme === "dark";

  const [mode, setModeState] = useState<ThemeMode>("system");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === "light" || saved === "dark" || saved === "system") {
          setModeState(saved);
        }
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  const theme = useMemo(() => buildTheme(mode, systemIsDark), [mode, systemIsDark]);

  async function setMode(mode: ThemeMode) {
    setModeState(mode);
    await AsyncStorage.setItem(STORAGE_KEY, mode);
  }

  const value = useMemo(() => ({ theme, mode, setMode, isReady }), [theme, mode, isReady]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
