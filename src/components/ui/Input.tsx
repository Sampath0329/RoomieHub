import { TextInput, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  placeholder: string;
  className?: string;
}

export const Input = ({
  placeholder,
  className = '',
  ...props
}: InputProps) => (
  <TextInput
    className={`bg-white px-6 py-5 rounded-full shadow-lg border border-gray-200 text-gray-800 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 ${className}`}
    placeholderTextColor="#94a3b8"
    placeholder={placeholder}
    {...props}
  />
);