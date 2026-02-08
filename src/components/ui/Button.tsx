import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;          
  textClassName?: string;      
}

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  className = '',
  textClassName = '',
  ...rest
}: ButtonProps) => {
  const bgStyle = variant === 'primary' ? 'bg-blue-600' : 'bg-transparent border border-blue-600';
  const textStyle = variant === 'primary' ? 'text-white' : 'text-blue-600';

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`${bgStyle} p-4 rounded-2xl items-center shadow-sm active:opacity-80 ${className}`}
      {...rest} // native props (disabled, etc) pass 
    >
      <Text className={`${textStyle} font-bold text-lg ${textClassName}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};