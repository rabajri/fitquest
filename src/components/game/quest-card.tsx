import { GAME } from '@/constants/game-theme';
import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

type ChipStyle = 'complete' | 'earning' | 'neutral';

type Props = {
  icon: ReactNode;
  title: string;
  subtitle: string;
  chipText?: string;
  /** complete = filled gold, earning = gold outline, neutral = grey outline */
  chipStyle?: ChipStyle;
  /** This quest's own colour (icon ring, progress bar, button). */
  accent?: string;
  /** 0 to 1. Leave out for no progress bar. */
  progress?: number;
  /** Extra content between the progress bar and the action button. */
  children?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionStyle?: 'primary' | 'secondary';
  /** Greyed-out, dashed card for things that are not built yet. */
  dimmed?: boolean;
};

export function QuestCard({
  icon,
  title,
  subtitle,
  chipText,
  chipStyle = 'neutral',
  accent = GAME.colors.primary,
  progress,
  children,
  actionLabel,
  onAction,
  actionStyle = 'secondary',
  dimmed = false,
}: Props) {
  const fillPercent = progress === undefined ? 0 : Math.min(Math.max(progress, 0), 1) * 100;

  // The bar slides to its new length instead of jumping
  const bar = useRef(new Animated.Value(fillPercent)).current;
  useEffect(() => {
    Animated.timing(bar, {
      toValue: fillPercent,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [fillPercent, bar]);
  const barWidth = bar.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

  return (
    <View style={[styles.card, dimmed && styles.cardDimmed]}>
      <View style={styles.topRow}>
        <View style={[styles.iconBox, !dimmed && { borderColor: `${accent}88` }]}>{icon}</View>
        <View style={styles.titleBox}>
          <Text style={[styles.title, dimmed && styles.titleDimmed]}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        {!!chipText && (
          <View
            style={[
              styles.chip,
              chipStyle === 'complete' && styles.chipComplete,
              chipStyle === 'earning' && styles.chipEarning,
              chipStyle === 'neutral' && styles.chipNeutral,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                chipStyle === 'complete' && styles.chipTextComplete,
                chipStyle === 'earning' && styles.chipTextEarning,
                chipStyle === 'neutral' && styles.chipTextNeutral,
              ]}
            >
              {chipText}
            </Text>
          </View>
        )}
      </View>

      {progress !== undefined && (
        <View style={styles.track}>
          <Animated.View style={[styles.fill, { width: barWidth, backgroundColor: accent }]} />
        </View>
      )}

      {children}

      {!!actionLabel && (
        <Pressable
          onPress={onAction}
          style={[
            styles.action,
            { borderColor: accent },
            actionStyle === 'primary' && { backgroundColor: accent },
          ]}
        >
          <Text
            style={[
              styles.actionText,
              { color: accent },
              actionStyle === 'primary' && styles.actionTextPrimary,
            ]}
          >
            {actionLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Soft raised panel: lighter top edge, rounder corners, a little shadow
  card: {
    backgroundColor: GAME.colors.surface,
    borderWidth: 1,
    borderColor: GAME.colors.border,
    borderTopColor: GAME.colors.edgeLight,
    borderRadius: GAME.radius.cardLarge,
    padding: 16,
    gap: 14,
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardDimmed: { borderStyle: 'dashed', elevation: 0, shadowOpacity: 0 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: GAME.radius.pill,
    backgroundColor: GAME.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: GAME.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBox: { flex: 1, gap: 2 },
  title: { color: GAME.colors.text, fontSize: 16, fontWeight: '700' },
  titleDimmed: { color: GAME.colors.textMuted },
  subtitle: { color: GAME.colors.textMuted, fontSize: 13 },
  chip: { borderRadius: GAME.radius.pill, paddingVertical: 5, paddingHorizontal: 12, borderWidth: 1 },
  chipComplete: { backgroundColor: GAME.colors.reward, borderColor: GAME.colors.reward },
  chipEarning: { borderColor: GAME.colors.reward },
  chipNeutral: { borderColor: GAME.colors.border },
  chipText: { fontSize: 13, fontWeight: '700' },
  chipTextComplete: { color: GAME.colors.onReward },
  chipTextEarning: { color: GAME.colors.reward },
  chipTextNeutral: { color: GAME.colors.textMuted },
  track: {
    height: 8,
    borderRadius: GAME.radius.pill,
    backgroundColor: GAME.colors.surfaceRaised,
    overflow: 'hidden',
  },
  fill: { height: 8, borderRadius: GAME.radius.pill },
  // Pill buttons: outlined in the quest's colour, or filled for the main action
  action: {
    minHeight: 46,
    borderRadius: GAME.radius.pill,
    borderWidth: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { fontSize: 14, fontWeight: '700' },
  actionTextPrimary: { color: GAME.colors.onPrimary },
});