import { GAME } from '@/constants/game-theme';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type Props = {
  rankLabel: string;
  level: number;
  xpIntoLevel: number;
  xpForNext: number;
};

export function RankCard({ rankLabel, level, xpIntoLevel, xpForNext }: Props) {
  const fillPercent = xpForNext > 0 ? Math.min((xpIntoLevel / xpForNext) * 100, 100) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.emblem}>
          <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z"
              stroke={GAME.colors.reward}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M9 12l2 2 4-4"
              stroke={GAME.colors.reward}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
        <View style={styles.rankText}>
          <Text style={styles.rank}>{rankLabel}</Text>
          <Text style={styles.muted}>Level {level} · rank changes at the monthly Trial</Text>
        </View>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${fillPercent}%` }]} />
      </View>
      <View style={styles.xpRow}>
        <Text style={styles.small}>{xpIntoLevel} XP</Text>
        <Text style={styles.small}>
          {xpForNext - xpIntoLevel} XP to Level {level + 1}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: GAME.colors.surface,
    borderWidth: 1,
    borderColor: GAME.colors.border,
    borderRadius: GAME.radius.cardLarge,
    padding: 16,
    gap: 12,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  emblem: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: GAME.colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { flex: 1, gap: 2 },
  rank: { color: GAME.colors.text, fontSize: 22, fontWeight: '700' },
  muted: { color: GAME.colors.textMuted, fontSize: 13 },
  track: {
    height: 8,
    borderRadius: GAME.radius.pill,
    backgroundColor: GAME.colors.surfaceRaised,
    overflow: 'hidden',
  },
  fill: { height: 8, backgroundColor: GAME.colors.reward },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between' },
  small: { color: GAME.colors.textMuted, fontSize: 12 },
});