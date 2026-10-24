import { GAME } from '@/constants/game-theme';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type ChipStyle = 'complete' | 'earning' | 'neutral';

type Props = {
  icon: ReactNode;
  title: string;
  subtitle: string;
  chipText?: string;
  /** complete = filled gold, earning = gold outline, neutral = grey outline */
  chipStyle?: ChipStyle;
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
  progress,
  children,
  actionLabel,
  onAction,
  actionStyle = 'secondary',
  dimmed = false,
}: Props) {
  const fillPercent = progress === undefined ? 0 : Math.min(Math.max(progress, 0), 1) * 100;

  return (
    <View style={[styles.card, dimmed && styles.cardDimmed]}>
      <View style={styles.topRow}>
        <View style={styles.iconBox}>{icon}</View>
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
          <View style={[styles.fill, { width: `${fillPercent}%` }]} />
        </View>
      )}

      {children}

      {!!actionLabel && (
        <Pressable
          onPress={onAction}
          style={[styles.action, actionStyle === 'primary' && styles.actionPrimary]}
        >
          <Text style={[styles.actionText, actionStyle === 'primary' && styles.actionTextPrimary]}>
            {actionLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: GAME.colors.surface,
    borderWidth: 1,
    borderColor: GAME.colors.border,
    borderRadius: GAME.radius.card,
    padding: 14,
    gap: 12,
  },
  cardDimmed: { borderStyle: 'dashed' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: GAME.radius.button,
    backgroundColor: GAME.colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBox: { flex: 1, gap: 2 },
  title: { color: GAME.colors.text, fontSize: 15, fontWeight: '700' },
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
    height: 6,
    borderRadius: GAME.radius.pill,
    backgroundColor: GAME.colors.surfaceRaised,
    overflow: 'hidden',
  },
  fill: { height: 6, backgroundColor: GAME.colors.primary },
  action: {
    minHeight: 44,
    borderRadius: GAME.radius.button,
    backgroundColor: GAME.colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPrimary: { backgroundColor: GAME.colors.primary },
  actionText: { color: GAME.colors.text, fontSize: 14, fontWeight: '700' },
  actionTextPrimary: { color: GAME.colors.onPrimary },
});