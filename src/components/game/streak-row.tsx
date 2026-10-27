import { GAME } from '@/constants/game-theme';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

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

function shareOf(value: number, max: number) {
  return max > 0 ? Math.min(Math.max(value / max, 0), 1) * 100 : 0;
}

export function StreakRow({
  loggingPoints,
  loggingMax,
  streakDays,
  streakBonus,
  streakBonusMax,
  atRisk,
}: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        {/* Logging bonus */}
        <View style={styles.tile}>
          <View style={styles.tileTop}>
            <Text style={styles.label}>Logging bonus</Text>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M5 12l4.5 4.5L19 7"
                stroke={GAME.colors.primary}
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <Text style={styles.value}>
            +{loggingPoints} <Text style={styles.max}>/ {loggingMax}</Text>
          </Text>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                { width: `${shareOf(loggingPoints, loggingMax)}%`, backgroundColor: GAME.colors.primary },
              ]}
            />
          </View>
        </View>

        {/* Streak */}
        <View style={styles.tile}>
          <View style={styles.tileTop}>
            <Text style={styles.label}>Streak</Text>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 3c.6 3.6 4.6 5.2 4.6 9.4a4.6 4.6 0 0 1-9.2 0c0-1.9.9-3.1 1.9-4 .1 1.7.9 2.6 1.9 2.8C11.2 9 11 6 12 3z"
                stroke={GAME.colors.reward}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <Text style={styles.value}>
            {streakDays} {streakDays === 1 ? 'day' : 'days'}{' '}
            <Text style={styles.max}>
              +{streakBonus} / {streakBonusMax}
            </Text>
          </Text>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                { width: `${shareOf(streakBonus, streakBonusMax)}%`, backgroundColor: GAME.colors.reward },
              ]}
            />
          </View>
        </View>
      </View>

      {atRisk && (
        <View style={styles.warningBox}>
          <Text style={styles.warning}>
            Your free miss is used. Log something every day to keep your streak.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  // Soft raised tile: lighter top edge, rounded corners, a little shadow
  tile: {
    flex: 1,
    gap: 8,
    padding: 14,
    backgroundColor: GAME.colors.surface,
    borderWidth: 1,
    borderColor: GAME.colors.border,
    borderTopColor: GAME.colors.edgeLight,
    borderRadius: GAME.radius.cardLarge,
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  tileTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: GAME.colors.textMuted, fontSize: 12 },
  value: { color: GAME.colors.text, fontSize: 18, fontWeight: '700' },
  max: { color: GAME.colors.textMuted, fontSize: 13, fontWeight: '400' },
  track: {
    height: 6,
    borderRadius: GAME.radius.pill,
    backgroundColor: GAME.colors.surfaceRaised,
    overflow: 'hidden',
  },
  fill: { height: 6, borderRadius: GAME.radius.pill },
  warningBox: {
    borderWidth: 1,
    borderColor: GAME.colors.reward,
    backgroundColor: `${GAME.colors.reward}1A`,
    borderRadius: GAME.radius.card,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  warning: { color: GAME.colors.reward, fontSize: 13, lineHeight: 18 },
});