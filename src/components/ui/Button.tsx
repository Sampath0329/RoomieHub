import React from "react";
import { TouchableOpacity, Text, TouchableOpacityProps } from "react-native";
import { useTheme } from "../../hooks/useTheme";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
}

export const Button = ({
  title,
  onPress,
  variant = "primary",
  className = "",
  style,
  ...rest
}: ButtonProps) => {
  const { theme } = useTheme();

  const bg =
    variant === "primary"
      ? theme.colors.primary
      : variant === "danger"
      ? theme.colors.danger
      : "transparent";

  const borderColor = variant === "secondary" ? theme.colors.border : "transparent";
  const textColor = variant === "secondary" ? theme.colors.text : "#fff";

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`p-4 rounded-2xl items-center ${className}`}
      style={[
        { backgroundColor: bg, borderWidth: variant === "secondary" ? 1 : 0, borderColor },
        style,
      ]}
      {...rest}
    >
      <Text style={{ color: textColor, fontWeight: "800", fontSize: 16 }}>{title}</Text>
    </TouchableOpacity>
  );
};
