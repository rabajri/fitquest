import { GAME } from '@/constants/game-theme';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  /** Logging bonus earned today and its daily maximum. */
  loggingPoints: number;
  loggingMax: number;
  /** Current streak length (no limit), the bonus it earns, and the bonus cap. */
  streakDays: number;
  streakBonus: number;
  streakBonusMax: number;
  /** True when the free miss is used up: one more missed day ends the streak. */
  atRisk: boolean;
};

export function StreakRow({
  loggingPoints,
  loggingMax,
  streakDays,
  streakBonus,
  streakBonusMax,
  atRisk,
}: Props) {
  return (
    <View style={styles.panel}>
      <View style={styles.row}>
        <View style={styles.stat}>
          <Text style={styles.label}>Logging bonus</Text>
          <Text style={styles.value}>
            +{loggingPoints} <Text style={styles.max}>/ {loggingMax}</Text>
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.stat}>
          <Text style={styles.label}>Streak</Text>
          <Text style={styles.value}>
            {streakDays} {streakDays === 1 ? 'day' : 'days'}{' '}
            <Text style={styles.max}>
              +{streakBonus} / {streakBonusMax}
            </Text>
          </Text>
        </View>
      </View>

      {atRisk && (
        <Text style={styles.warning}>
          Your free miss is used. Log something every day to keep your streak.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: GAME.colors.surface,
    borderWidth: 1,
    borderColor: GAME.colors.border,
    borderRadius: GAME.radius.cardLarge,
    padding: 16,
    gap: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, gap: 4 },
  divider: { width: 1, height: 36, backgroundColor: GAME.colors.border, marginHorizontal: 12 },
  label: { color: GAME.colors.textMuted, fontSize: 12 },
  value: { color: GAME.colors.text, fontSize: 16, fontWeight: '700' },
  max: { color: GAME.colors.textMuted, fontSize: 13, fontWeight: '400' },
  warning: { color: GAME.colors.reward, fontSize: 13, lineHeight: 18 },
});