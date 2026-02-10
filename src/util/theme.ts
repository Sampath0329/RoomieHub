export type ThemeMode = "light" | "dark" | "system";

export type AppTheme = {
  mode: ThemeMode;
  isDark: boolean;
  colors: {
    bg: string;
    card: string;
    text: string;
    subtext: string;
    border: string;
    primary: string;
    danger: string;
    gradient: [string, string, string]; // for LinearGradient
  };
};

export function buildTheme(mode: ThemeMode, systemIsDark: boolean): AppTheme {
  const isDark = mode === "system" ? systemIsDark : mode === "dark";

  if (isDark) {
    return {
      mode,
      isDark: true,
      colors: {
        bg: "#0B0F19",
        card: "#111827",
        text: "#F9FAFB",
        subtext: "#9CA3AF",
        border: "#1F2937",
        primary: "#A78BFA",
        danger: "#F87171",
        gradient: ["#0B0F19", "#111827", "#0B0F19"],
      },
    };
  }

  return {
    mode,
    isDark: false,
    colors: {
      bg: "#FFFFFF",
      card: "#FFFFFF",
      text: "#111827",
      subtext: "#6B7280",
      border: "#E5E7EB",
      primary: "#7C3AED",
      danger: "#EF4444",
      gradient: ["#faf5ff", "#f3e8ff", "#ffffff"],
    },
  };
}
