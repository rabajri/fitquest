import { TextInput, type TextInputProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

/** A text box whose typed text and placeholder follow light / dark mode, so they never vanish into the background. */
export function ThemedTextInput({ style, placeholderTextColor, ...rest }: TextInputProps) {
  const theme = useTheme();

  return (
    <TextInput
      style={[{ color: theme.text }, style]}
      placeholderTextColor={placeholderTextColor ?? theme.textSecondary}
      {...rest}
    />
  );
}
