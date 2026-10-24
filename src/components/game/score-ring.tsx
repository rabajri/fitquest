import { GAME } from '@/constants/game-theme';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

type Props = {
  points: number;
  maxPoints: number;
  /** Points needed for the day to count as a good day (shown as a tick). */
  goodDayAt: number;
};

const SIZE = 190;
const RADIUS = 78;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScoreRing({ points, maxPoints, goodDayAt }: Props) {
  const share = maxPoints > 0 ? Math.min(points / maxPoints, 1) : 0;
  const tickDegrees = maxPoints > 0 ? (goodDayAt / maxPoints) * 360 : 0;

  return (
    <View style={styles.card}>
      <View style={styles.ringBox}>
        <Svg width={SIZE} height={SIZE} viewBox="0 0 200 200">
          <Circle
            cx={100}
            cy={100}
            r={RADIUS}
            fill="none"
            stroke={GAME.colors.surfaceRaised}
            strokeWidth={14}
          />
          <Circle
            cx={100}
            cy={100}
            r={RADIUS}
            fill="none"
            stroke={GAME.colors.reward}
            strokeWidth={14}
            strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE * share} ${CIRCUMFERENCE}`}
            rotation={-90}
            origin="100, 100"
          />
          <Line
            x1={100}
            y1={12}
            x2={100}
            y2={34}
            stroke={GAME.colors.text}
            strokeWidth={3}
            strokeLinecap="round"
            rotation={tickDegrees}
            origin="100, 100"
          />
        </Svg>
        <View style={styles.center}>
          <Text style={styles.number}>{Math.round(points)}</Text>
          <Text style={styles.muted}>of {maxPoints} points</Text>
        </View>
      </View>
      <Text style={styles.caption}>
        The white tick is {goodDayAt}. Cross it and today counts as a good day.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: GAME.colors.surface,
    borderWidth: 1,
    borderColor: GAME.colors.border,
    borderRadius: GAME.radius.cardLarge,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 12,
  },
  ringBox: { width: SIZE, height: SIZE },
  center: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: { color: GAME.colors.text, fontSize: 44, fontWeight: '700', lineHeight: 50 },
  muted: { color: GAME.colors.textMuted, fontSize: 13 },
  caption: { color: GAME.colors.textMuted, fontSize: 14, textAlign: 'center' },
});