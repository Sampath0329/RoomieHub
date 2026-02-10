import React from "react";
import { TextInput, TextInputProps } from "react-native";
import { useTheme } from "../../hooks/useTheme";

interface InputProps extends TextInputProps {
  placeholder: string;
  className?: string;
}

export const Input = ({ placeholder, className = "", style, ...props }: InputProps) => {
  const { theme } = useTheme();

  return (
    <TextInput
      className={`px-6 py-5 rounded-full shadow-lg ${className}`}
      style={[
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          borderWidth: 1,
          color: theme.colors.text,
        },
        style,
      ]}
      placeholderTextColor={theme.colors.subtext}
      placeholder={placeholder}
      {...props}
    />
  );
};
