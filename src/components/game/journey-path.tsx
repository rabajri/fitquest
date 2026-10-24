import { GAME } from '@/constants/game-theme';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Polyline, Text as SvgText } from 'react-native-svg';

type Props = {
  /** Body weight at the start, then at the end of each marker (the last one is the goal). */
  weightsKg: number[];
  weeks: number | null;
};

const WIDTH = 350;
const HEIGHT = 170;
const LEFT = 25;
const RIGHT = 325;
const BOTTOM_Y = 130;
const TOP_Y = 46;
/** Beyond this many points, only every second weight is drawn so they don't collide. */
const MAX_LABELLED_POINTS = 12;

function formatKg(kg: number) {
  return Number(kg.toFixed(1)).toString();
}

export function JourneyPath({ weightsKg, weeks }: Props) {
  const count = weightsKg.length;
  if (count < 2) return null;

  const points = weightsKg.map((_, i) => ({
    x: LEFT + ((RIGHT - LEFT) * i) / (count - 1),
    y: BOTTOM_Y - ((BOTTOM_Y - TOP_Y) * i) / (count - 1),
  }));

  const showLabel = (i: number) =>
    count <= MAX_LABELLED_POINTS || i === 0 || i === count - 1 || i % 2 === 0;

  const startKg = weightsKg[0]!;
  const goalKg = weightsKg[count - 1]!;

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {formatKg(startKg)} kg → {formatKg(goalKg)} kg
        </Text>
        {weeks !== null && <Text style={styles.muted}>{weeks} weeks</Text>}
      </View>

      <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <Polyline
          points={points.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke={GAME.colors.border}
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((p, i) => {
          const isStart = i === 0;
          const isGoal = i === count - 1;
          return (
            <Circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={isStart || isGoal ? 8 : 6}
              fill={isStart ? GAME.colors.primary : isGoal ? GAME.colors.reward : GAME.colors.surface}
              stroke={isStart || isGoal ? undefined : GAME.colors.textMuted}
              strokeWidth={isStart || isGoal ? 0 : 2}
            />
          );
        })}
        {points.map((p, i) =>
          showLabel(i) ? (
            <SvgText
              key={`kg-${i}`}
              x={i === count - 1 ? p.x - 3 : p.x}
              y={p.y - 17}
              fontSize={11}
              fontWeight="700"
              fill={GAME.colors.text}
              textAnchor="middle"
            >
              {formatKg(weightsKg[i]!)}
            </SvgText>
          ) : null,
        )}
        <SvgText x={points[0]!.x} y={158} fontSize={11} fill={GAME.colors.textMuted} textAnchor="middle">
          You
        </SvgText>
        <SvgText
          x={points[count - 1]!.x - 3}
          y={158}
          fontSize={11}
          fill={GAME.colors.textMuted}
          textAnchor="middle"
        >
          Goal
        </SvgText>
      </Svg>

      <Text style={styles.caption}>
        Each stop on the path is a check-in. Hit enough of that stop's target and you rank up. Miss it and you keep your rank.
      </Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  title: { color: GAME.colors.text, fontSize: 15, fontWeight: '700' },
  muted: { color: GAME.colors.textMuted, fontSize: 13 },
  caption: { color: GAME.colors.textMuted, fontSize: 13, lineHeight: 19 },
});