import { LogoMark } from '@/components/welcome/badges';
import { WELCOME } from '@/constants/welcome-theme';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { type ReactNode, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  type StyleProp,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Building blocks for the sign-in and onboarding forms, in the intro's dark + lime style.
 * These screens are always dark, whatever the phone's light/dark setting.
 */

type FormScreenProps = {
  children: ReactNode;
  /** Shows "Step x of total" with a progress bar. Leave out on sign-in screens. */
  step?: { current: number; total: number };
};

export function FormScreen({ children, step }: FormScreenProps) {
  const canGoBack = router.canGoBack();

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.header}>
            {canGoBack ? (
              <Pressable
                onPress={() => router.back()}
                hitSlop={12}
                style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Back">
                <Text style={styles.backIcon}>‹</Text>
              </Pressable>
            ) : (
              <LogoMark />
            )}

            {step ? (
              <View style={styles.stepWrap}>
                <View style={styles.stepTrack}>
                  <View
                    style={[styles.stepFill, { width: `${(step.current / step.total) * 100}%` }]}
                  />
                </View>
                <Text style={styles.stepLabel}>
                  {step.current}/{step.total}
                </Text>
              </View>
            ) : (
              <Text style={styles.brand}>FitQuest</Text>
            )}
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}>
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

export function FormTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.titleBlock}>
      {!!eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
      <Text style={styles.title}>{title}</Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

/** A small heading above a group of fields or options. */
export function SectionLabel({ children }: { children: ReactNode }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

type FieldProps = TextInputProps & {
  label?: string;
  /** Unit shown inside the box on the right, e.g. "kg". */
  suffix?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export function Field({ label, suffix, containerStyle, onFocus, onBlur, ...rest }: FieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.field, containerStyle]}>
      {!!label && <Text style={styles.fieldLabel}>{label}</Text>}
      <View style={[styles.inputBox, focused && styles.inputBoxFocused]}>
        <TextInput
          placeholderTextColor={WELCOME.placeholder}
          selectionColor={WELCOME.accent}
          cursorColor={WELCOME.accent}
          style={styles.input}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {!!suffix && <Text style={styles.suffix}>{suffix}</Text>}
      </View>
    </View>
  );
}

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function PrimaryButton({ label, onPress, loading, disabled }: PrimaryButtonProps) {
  const inactive = loading || disabled;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.primaryButton,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}>
      {loading ? (
        <ActivityIndicator color={WELCOME.onAccent} />
      ) : (
        <Text style={styles.primaryLabel}>{label}</Text>
      )}
    </Pressable>
  );
}

/** Quiet text button, e.g. "Already have an account? Log in". `strong` is the lime part. */
export function LinkButton({
  label,
  strong,
  onPress,
  align = 'center',
}: {
  label: string;
  strong?: string;
  onPress: () => void;
  align?: 'center' | 'left' | 'right';
}) {
  const alignSelf = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => [styles.linkButton, { alignSelf }, pressed && styles.pressed]}
      accessibilityRole="button">
      <Text style={styles.linkLabel}>
        {label}
        {!!strong && <Text style={styles.linkStrong}> {strong}</Text>}
      </Text>
    </Pressable>
  );
}

type OptionProps = {
  label: string;
  sublabel?: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  /** Stretch to share the row with the other options. */
  grow?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** A selectable pill (single or multi choice). */
export function Option({ label, sublabel, selected, disabled, onPress, grow, style }: OptionProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.option,
        grow && styles.optionGrow,
        selected && styles.optionSelected,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}>
      <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{label}</Text>
      {!!sublabel && <Text style={styles.optionSublabel}>{sublabel}</Text>}
    </Pressable>
  );
}

/** Lays options out in a row that wraps onto new lines. */
export function OptionRow({ children }: { children: ReactNode }) {
  return <View style={styles.optionRow}>{children}</View>;
}

type NoticeTone = 'info' | 'warning' | 'error';

/** A small boxed message: hints, warnings and errors. */
export function Notice({ text, tone = 'info' }: { text: string; tone?: NoticeTone }) {
  return (
    <View
      style={[
        styles.notice,
        tone === 'warning' && styles.noticeWarning,
        tone === 'error' && styles.noticeError,
      ]}>
      <Text
        style={[
          styles.noticeText,
          tone === 'warning' && { color: WELCOME.warning },
          tone === 'error' && { color: WELCOME.danger },
        ]}>
        {text}
      </Text>
    </View>
  );
}

/**
 * The status line under a form. Progress messages ("Saving...") are hidden because the
 * button shows a spinner; everything else is shown as an error unless a tone is given.
 */
export function FormMessage({ text, tone }: { text: string; tone?: NoticeTone }) {
  if (!text || isBusyMessage(text)) return null;
  return <Notice text={text} tone={tone ?? 'error'} />;
}

/** Screens set messages like "Saving..." while they work. */
export function isBusyMessage(text: string) {
  return text.endsWith('...');
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: WELCOME.background },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.4 },

  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: WELCOME.card,
    borderWidth: 1,
    borderColor: WELCOME.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { color: WELCOME.text, fontSize: 26, lineHeight: 28, marginTop: -2, marginLeft: -2 },
  brand: { color: WELCOME.text, fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },
  stepWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: WELCOME.track, overflow: 'hidden' },
  stepFill: { height: '100%', borderRadius: 3, backgroundColor: WELCOME.accent },
  stepLabel: { color: WELCOME.textMuted, fontSize: 13, fontWeight: '600', fontVariant: ['tabular-nums'] },

  content: { flexGrow: 1, gap: 16, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32 },

  titleBlock: { gap: 10, marginBottom: 8 },
  eyebrow: { color: WELCOME.accent, fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  title: { color: WELCOME.text, fontSize: 30, fontWeight: '700', lineHeight: 35, letterSpacing: -0.5 },
  subtitle: { color: WELCOME.textMuted, fontSize: 16, lineHeight: 23 },

  sectionLabel: { color: WELCOME.textSoft, fontSize: 14, fontWeight: '600', marginTop: 4 },

  field: { gap: 8 },
  fieldLabel: { color: WELCOME.textSoft, fontSize: 14, fontWeight: '600' },
  inputBox: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: WELCOME.cardBorder,
    backgroundColor: WELCOME.card,
    paddingHorizontal: 16,
  },
  inputBoxFocused: { borderColor: WELCOME.accent },
  input: { flex: 1, color: WELCOME.text, fontSize: 16, paddingVertical: 14 },
  suffix: { color: WELCOME.textMuted, fontSize: 15, fontWeight: '600', marginLeft: 8 },

  primaryButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: WELCOME.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 15,
    elevation: 8,
  },
  primaryLabel: { color: WELCOME.onAccent, fontSize: 16, fontWeight: '700' },

  linkButton: { paddingVertical: 6 },
  linkLabel: { color: WELCOME.textMuted, fontSize: 15 },
  linkStrong: { color: WELCOME.accent, fontWeight: '600' },

  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  option: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: WELCOME.cardBorder,
    backgroundColor: WELCOME.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionGrow: { flexGrow: 1, flexBasis: 0 },
  optionSelected: { borderColor: WELCOME.accent, backgroundColor: WELCOME.accentSoft },
  optionLabel: { color: WELCOME.textSoft, fontSize: 15, fontWeight: '600' },
  optionLabelSelected: { color: WELCOME.accent },
  optionSublabel: { color: WELCOME.textMuted, fontSize: 12, marginTop: 2 },

  notice: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: WELCOME.cardBorder,
    backgroundColor: WELCOME.card,
    padding: 14,
  },
  noticeWarning: { borderColor: 'rgba(251, 191, 36, 0.35)', backgroundColor: WELCOME.warningSoft },
  noticeError: { borderColor: 'rgba(255, 122, 122, 0.35)', backgroundColor: WELCOME.dangerSoft },
  noticeText: { color: WELCOME.textSoft, fontSize: 14, lineHeight: 20 },
});
