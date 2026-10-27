import { GAME } from '@/constants/game-theme';
import type { RankId } from '@/engine';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type Props = {
  rankId: RankId;
  rankLabel: string;
  level: number;
  xpIntoLevel: number;
  xpForNext: number;
};

// One picture for every rank for now. Later this can become one image per rank.
const HERO_IMAGE = require('../../../assets/images/hero-full.jpg');

export function RankCard({ rankId, rankLabel, level, xpIntoLevel, xpForNext }: Props) {
  const accent = GAME.rank[rankId];
  const stage = GAME.colors.heroStage;
  const fillPercent = xpForNext > 0 ? Math.min((xpIntoLevel / xpForNext) * 100, 100) : 0;
  const widthPercent = GAME.hero.widthShare * 100;
  const sidePercent = (100 - widthPercent) / 2;

  return (
    <View style={styles.card}>
      {/* A fixed box for the photo. "contain" shows the whole picture and never zooms. */}
      <View
        style={[
          styles.heroBox,
          { top: GAME.hero.top, left: `${sidePercent}%`, width: `${widthPercent}%` },
        ]}
      >
        <Image source={HERO_IMAGE} style={styles.heroImage} resizeMode="contain" />
        {/* Soft fades on the left and right edges so the photo blends into the stage */}
        <LinearGradient
          colors={[stage, `${stage}00`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.sideFadeLeft}
          pointerEvents="none"
        />
        <LinearGradient
          colors={[`${stage}00`, stage]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.sideFadeRight}
          pointerEvents="none"
        />
      </View>

      {/* Rank-coloured tint at the top, fade into the stage at the bottom */}
      <LinearGradient
        colors={[`${accent}66`, `${accent}00`]}
        style={styles.topTint}
        pointerEvents="none"
      />
      <LinearGradient
        colors={[`${stage}00`, stage]}
        locations={[0, 0.85]}
        style={styles.bottomFade}
        pointerEvents="none"
      />

      <View style={[styles.badge, { borderColor: accent }]}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z"
            stroke={accent}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M9 12l2 2 4-4"
            stroke={accent}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>

      <View style={[styles.levelChip, { borderColor: accent }]}>
        <Text style={[styles.levelChipText, { color: accent }]}>LEVEL {level}</Text>
      </View>

      <View style={styles.bottom}>
        <Text style={[styles.rank, { textShadowColor: accent }]}>{rankLabel}</Text>
        <Text style={styles.muted}>Rank changes at the monthly Trial</Text>

        <View style={styles.track}>
          <View style={[styles.fill, { width: `${fillPercent}%`, backgroundColor: accent }]} />
        </View>
        <View style={styles.xpRow}>
          <Text style={styles.small}>{xpIntoLevel} XP</Text>
          <Text style={styles.small}>
            {xpForNext - xpIntoLevel} XP to Level {level + 1}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: GAME.hero.height,
    backgroundColor: GAME.colors.heroStage,
    borderWidth: 1,
    borderColor: GAME.colors.border,
    borderTopColor: GAME.colors.edgeLight,
    borderRadius: GAME.radius.cardLarge,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  heroBox: { position: 'absolute', bottom: 0 },
  heroImage: { width: '100%', height: '100%' },
  sideFadeLeft: { position: 'absolute', top: 0, bottom: 0, left: 0, width: '22%' },
  sideFadeRight: { position: 'absolute', top: 0, bottom: 0, right: 0, width: '22%' },
  topTint: { position: 'absolute', top: 0, left: 0, right: 0, height: 180 },
  bottomFade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 230 },
  badge: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: GAME.colors.panelOverlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelChip: {
    position: 'absolute',
    top: 14,
    right: 14,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: GAME.radius.pill,
    borderWidth: 1,
    backgroundColor: GAME.colors.panelOverlay,
  },
  levelChipText: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 18, gap: 6 },
  rank: {
    color: GAME.colors.text,
    fontSize: 36,
    fontWeight: '800',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  muted: { color: GAME.colors.textMuted, fontSize: 13, marginBottom: 6 },
  track: {
    height: 8,
    borderRadius: GAME.radius.pill,
    backgroundColor: GAME.colors.surfaceRaised,
    overflow: 'hidden',
  },
  fill: { height: 8, borderRadius: GAME.radius.pill },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between' },
  small: { color: GAME.colors.textMuted, fontSize: 12 },
});