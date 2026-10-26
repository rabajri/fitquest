import { GAME } from '@/constants/game-theme';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type Props = {
  /** Everything earned today: quests plus the logging and streak bonuses. */
  points: number;
  /** The most a perfect day can earn. */
  maxPoints: number;
  /** Points earned from the daily quests alone (calories, movement, ...). */
  questPoints: number;
  /** Quest points needed for the day to count as a good day. */
  goodDayAt: number;
};

const SIZE = 190;
const RADIUS = 78;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScoreRing({ points, maxPoints, questPoints, goodDayAt }: Props) {
  const share = maxPoints > 0 ? Math.min(points / maxPoints, 1) : 0;
  const isGoodDay = questPoints >= goodDayAt;

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
        </Svg>
        <View style={styles.center}>
          <Text style={styles.number}>{Math.round(points)}</Text>
          <Text style={styles.muted}>of {maxPoints} points</Text>
        </View>
      </View>
      <Text style={styles.caption}>
        {isGoodDay
          ? 'Good day! Your quests are past the mark.'
          : `Good day = ${goodDayAt} points from your quests. You have ${Math.round(questPoints)}.`}
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