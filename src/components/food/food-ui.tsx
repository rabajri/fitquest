import { GAME } from '@/constants/game-theme';
import { type Meal, MEALS, type Nutrition } from '@/lib/food-log';
import type { ReactNode } from 'react';
import {
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';

/** Pieces shared by the Add food and Edit food screens, in the dashboard's style. */

const SERVING_STEP = 0.5;
const MIN_SERVINGS = 0.5;
const MAX_SERVINGS = 20;

/** A tappable food line: name, portion and calories, with an optional thing on the right. */
export function FoodRow({
  name,
  detail,
  calories,
  onPress,
  right,
}: {
  name: string;
  detail?: string;
  calories: number;
  onPress?: () => void;
  right?: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole={onPress ? 'button' : undefined}>
      <View style={styles.rowText}>
        <Text style={styles.rowName} numberOfLines={1}>
          {name}
        </Text>
        {!!detail && (
          <Text style={styles.rowDetail} numberOfLines={1}>
            {detail}
          </Text>
        )}
      </View>
      <Text style={styles.rowCalories}>{Math.round(calories)} kcal</Text>
      {right}
    </Pressable>
  );
}

export function SectionHeading({ children }: { children: ReactNode }) {
  return <Text style={styles.sectionHeading}>{children}</Text>;
}

/** − 1.5 + with quick ½ / 1 / 2 buttons underneath. */
export function ServingStepper({
  servings,
  onChange,
}: {
  servings: number;
  onChange: (servings: number) => void;
}) {
  const set = (n: number) => onChange(Math.min(Math.max(n, MIN_SERVINGS), MAX_SERVINGS));

  return (
    <View style={styles.stepperWrap}>
      <View style={styles.stepper}>
        <StepButton label="−" onPress={() => set(servings - SERVING_STEP)} disabled={servings <= MIN_SERVINGS} />
        <View style={styles.stepperValue}>
          <Text style={styles.stepperNumber}>{servings}</Text>
          <Text style={styles.stepperUnit}>{servings === 1 ? 'serving' : 'servings'}</Text>
        </View>
        <StepButton label="+" onPress={() => set(servings + SERVING_STEP)} disabled={servings >= MAX_SERVINGS} />
      </View>
      <View style={styles.quickRow}>
        {[0.5, 1, 1.5, 2].map((n) => (
          <Chip key={n} label={n === 0.5 ? '½' : n === 1.5 ? '1½' : String(n)} selected={servings === n} onPress={() => set(n)} />
        ))}
      </View>
    </View>
  );
}

/** One hand-portion line: emoji, what it means, and − count +. */
export function HandCounter({
  emoji,
  label,
  foods,
  howTo,
  count,
  onChange,
}: {
  emoji: string;
  label: string;
  foods: string;
  howTo: string;
  count: number;
  onChange: (count: number) => void;
}) {
  const set = (n: number) => onChange(Math.min(Math.max(n, 0), 10));
  const shown = Number.isInteger(count) ? String(count) : count === 0.5 ? '½' : `${Math.floor(count)}½`;

  return (
    <View style={styles.hand}>
      <Text style={styles.handEmoji}>{emoji}</Text>
      <View style={styles.handText}>
        <Text style={styles.handLabel}>{label}</Text>
        <Text style={styles.handFoods}>{foods}</Text>
        <Text style={styles.handHowTo}>{howTo}</Text>
      </View>
      <View style={styles.handStepper}>
        <SmallStepButton label="−" onPress={() => set(count - SERVING_STEP)} disabled={count <= 0} />
        <Text style={[styles.handCount, count > 0 && styles.handCountOn]}>{shown}</Text>
        <SmallStepButton label="+" onPress={() => set(count + SERVING_STEP)} disabled={count >= 10} />
      </View>
    </View>
  );
}

function SmallStepButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      style={({ pressed }) => [styles.smallStep, disabled && styles.disabled, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={label === '+' ? 'More' : 'Less'}>
      <Text style={styles.smallStepLabel}>{label}</Text>
    </Pressable>
  );
}

function StepButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      style={({ pressed }) => [styles.stepButton, disabled && styles.disabled, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={label === '+' ? 'More' : 'Less'}>
      <Text style={styles.stepButtonLabel}>{label}</Text>
    </Pressable>
  );
}

/** Big calories number with protein / fat / carbs beside it. */
export function NutritionSummary({ nutrition }: { nutrition: Nutrition }) {
  return (
    <View style={styles.summary}>
      <View style={styles.summaryMain}>
        <Text style={styles.summaryCalories}>{Math.round(nutrition.calories)}</Text>
        <Text style={styles.summaryUnit}>kcal</Text>
      </View>
      <View style={styles.summaryMacros}>
        <Macro label="Protein" grams={nutrition.protein_g} />
        <Macro label="Fat" grams={nutrition.fat_g} />
        <Macro label="Carbs" grams={nutrition.carbs_g} />
      </View>
    </View>
  );
}

function Macro({ label, grams }: { label: string; grams: number }) {
  return (
    <View style={styles.macro}>
      <Text style={styles.macroValue}>{grams} g</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityState={{ selected }}>
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

export function MealPicker({ meal, onChange }: { meal: Meal; onChange: (meal: Meal) => void }) {
  return (
    <View style={styles.chipRow}>
      {MEALS.map((m) => (
        <Chip key={m.id} label={m.label} selected={meal === m.id} onPress={() => onChange(m.id)} />
      ))}
    </View>
  );
}

export function GameField({
  label,
  suffix,
  containerStyle,
  ...rest
}: TextInputProps & { label?: string; suffix?: string; containerStyle?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.field, containerStyle]}>
      {!!label && <Text style={styles.fieldLabel}>{label}</Text>}
      <View style={styles.inputBox}>
        <TextInput
          placeholderTextColor={GAME.colors.textMuted}
          selectionColor={GAME.colors.primary}
          cursorColor={GAME.colors.primary}
          style={styles.input}
          {...rest}
        />
        {!!suffix && <Text style={styles.suffix}>{suffix}</Text>}
      </View>
    </View>
  );
}

export function GameButton({
  label,
  onPress,
  disabled,
  tone = 'primary',
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'primary' | 'danger' | 'quiet';
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        tone === 'danger' && styles.buttonDanger,
        tone === 'quiet' && styles.buttonQuiet,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button">
      <Text
        style={[
          styles.buttonLabel,
          tone === 'danger' && styles.buttonLabelDanger,
          tone === 'quiet' && styles.buttonLabelQuiet,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

export const foodStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: GAME.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: GAME.spacing.screen,
    paddingVertical: 12,
  },
  headerTitle: { flex: 1, color: GAME.colors.text, fontSize: 20, fontWeight: '700' },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: GAME.colors.surface,
    borderWidth: 1,
    borderColor: GAME.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonLabel: { color: GAME.colors.text, fontSize: 18, fontWeight: '600' },
  content: { paddingHorizontal: GAME.spacing.screen, paddingBottom: 40, gap: GAME.spacing.gap },
  card: {
    backgroundColor: GAME.colors.surface,
    borderRadius: GAME.radius.card,
    borderWidth: 1,
    borderColor: GAME.colors.border,
    padding: 16,
    gap: 14,
  },
  title: { color: GAME.colors.text, fontSize: 22, fontWeight: '700' },
  muted: { color: GAME.colors.textMuted, fontSize: 14, lineHeight: 20 },
  error: { color: '#FF8A8A', fontSize: 14, lineHeight: 20 },
  pressed: { opacity: 0.75 },
});

const styles = StyleSheet.create({
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.4 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: GAME.radius.button,
    backgroundColor: GAME.colors.surface,
    borderWidth: 1,
    borderColor: GAME.colors.border,
  },
  rowText: { flex: 1, gap: 2 },
  rowName: { color: GAME.colors.text, fontSize: 15, fontWeight: '600' },
  rowDetail: { color: GAME.colors.textMuted, fontSize: 13 },
  rowCalories: { color: GAME.colors.text, fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },

  sectionHeading: {
    color: GAME.colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 6,
  },

  stepperWrap: { gap: 10 },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: GAME.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: GAME.colors.edgeLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonLabel: { color: GAME.colors.text, fontSize: 26, fontWeight: '500', lineHeight: 30 },
  stepperValue: { alignItems: 'center' },
  stepperNumber: { color: GAME.colors.text, fontSize: 32, fontWeight: '700', fontVariant: ['tabular-nums'] },
  stepperUnit: { color: GAME.colors.textMuted, fontSize: 13 },
  quickRow: { flexDirection: 'row', gap: 8, justifyContent: 'center' },

  hand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  handEmoji: { fontSize: 30 },
  handText: { flex: 1, gap: 2 },
  handLabel: { color: GAME.colors.text, fontSize: 15, fontWeight: '700' },
  handFoods: { color: GAME.colors.text, fontSize: 13, opacity: 0.85 },
  handHowTo: { color: GAME.colors.textMuted, fontSize: 12 },
  handStepper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  handCount: {
    minWidth: 28,
    textAlign: 'center',
    color: GAME.colors.textMuted,
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  handCountOn: { color: GAME.colors.text },
  smallStep: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: GAME.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: GAME.colors.edgeLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallStepLabel: { color: GAME.colors.text, fontSize: 20, fontWeight: '500', lineHeight: 22 },

  summary: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  summaryMain: { alignItems: 'center', minWidth: 84 },
  summaryCalories: { color: GAME.quest.food, fontSize: 34, fontWeight: '800', fontVariant: ['tabular-nums'] },
  summaryUnit: { color: GAME.colors.textMuted, fontSize: 13 },
  summaryMacros: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
  macro: { alignItems: 'center', gap: 2 },
  macroValue: { color: GAME.colors.text, fontSize: 15, fontWeight: '700' },
  macroLabel: { color: GAME.colors.textMuted, fontSize: 12 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: GAME.radius.pill,
    borderWidth: 1,
    borderColor: GAME.colors.border,
    backgroundColor: GAME.colors.surface,
  },
  chipSelected: { borderColor: GAME.colors.primary, backgroundColor: 'rgba(43, 212, 208, 0.14)' },
  chipLabel: { color: GAME.colors.textMuted, fontSize: 14, fontWeight: '600' },
  chipLabelSelected: { color: GAME.colors.primary },

  field: { gap: 6 },
  fieldLabel: { color: GAME.colors.textMuted, fontSize: 13, fontWeight: '600' },
  inputBox: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: GAME.radius.button,
    borderWidth: 1,
    borderColor: GAME.colors.border,
    backgroundColor: GAME.colors.background,
    paddingHorizontal: 14,
  },
  input: { flex: 1, color: GAME.colors.text, fontSize: 16, paddingVertical: 12 },
  suffix: { color: GAME.colors.textMuted, fontSize: 14, fontWeight: '600', marginLeft: 8 },

  button: {
    height: 52,
    borderRadius: 26,
    backgroundColor: GAME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDanger: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#FF8A8A' },
  buttonQuiet: { backgroundColor: 'transparent' },
  buttonLabel: { color: GAME.colors.onPrimary, fontSize: 16, fontWeight: '700' },
  buttonLabelDanger: { color: '#FF8A8A' },
  buttonLabelQuiet: { color: GAME.colors.textMuted, fontWeight: '600' },
});
