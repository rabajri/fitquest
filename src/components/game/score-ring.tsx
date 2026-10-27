import { GAME } from '@/constants/game-theme';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
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

const SIZE = 200;
const RADIUS = 78;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** Changes in the first moments after the card appears are loading, not earning. */
const IGNORE_CHANGES_MS = 2000;

export function ScoreRing({ points, maxPoints, questPoints, goodDayAt }: Props) {
  const target = maxPoints > 0 ? Math.min(points / maxPoints, 1) : 0;
  const isGoodDay = questPoints >= goodDayAt;
  // Teal while you build the day, gold once the day counts as a good one
  const color = isGoodDay ? GAME.colors.reward : GAME.colors.primary;

  // The arc glides to its new length instead of jumping
  const [shown, setShown] = useState(target);
  const arc = useRef(new Animated.Value(target)).current;
  useEffect(() => {
    const id = arc.addListener(({ value }) => setShown(value));
    return () => arc.removeListener(id);
  }, [arc]);
  useEffect(() => {
    Animated.timing(arc, {
      toValue: target,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [target, arc]);

  // "+N" floats up and the number pulses whenever points go up
  const previous = useRef(points);
  const mountedAt = useRef(Date.now());
  const popY = useRef(new Animated.Value(0)).current;
  const popOpacity = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const [gain, setGain] = useState(0);

  useEffect(() => {
    const diff = points - previous.current;
    previous.current = points;
    if (diff < 0.5) return;
    if (Date.now() - mountedAt.current < IGNORE_CHANGES_MS) return;

    setGain(diff);
    popY.setValue(0);
    popOpacity.setValue(1);
    Animated.parallel([
      Animated.timing(popY, { toValue: -48, duration: 1100, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(500),
        Animated.timing(popOpacity, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
    ]).start();
    Animated.sequence([
      Animated.timing(pulse, { toValue: 1.18, duration: 140, useNativeDriver: true }),
      Animated.spring(pulse, { toValue: 1, useNativeDriver: true }),
    ]).start();
  }, [points, popY, popOpacity, pulse]);

  const dash = `${CIRCUMFERENCE * shown} ${CIRCUMFERENCE}`;

  return (
    <View style={styles.card}>
      <View style={styles.ringBox}>
        <Svg width={SIZE} height={SIZE} viewBox="0 0 200 200">
          {/* Dotted inner dial */}
          <Circle
            cx={100}
            cy={100}
            r={58}
            fill="none"
            stroke={GAME.colors.border}
            strokeWidth={2}
            strokeDasharray="2 7"
            strokeLinecap="round"
          />
          {/* Track */}
          <Circle
            cx={100}
            cy={100}
            r={RADIUS}
            fill="none"
            stroke={GAME.colors.surfaceRaised}
            strokeWidth={14}
          />
          {shown > 0.002 && (
            <>
              {/* Soft glow: two wider, fainter copies of the arc underneath */}
              <Circle
                cx={100}
                cy={100}
                r={RADIUS}
                fill="none"
                stroke={color}
                strokeOpacity={0.12}
                strokeWidth={30}
                strokeLinecap="round"
                strokeDasharray={dash}
                rotation={-90}
                origin="100, 100"
              />
              <Circle
                cx={100}
                cy={100}
                r={RADIUS}
                fill="none"
                stroke={color}
                strokeOpacity={0.25}
                strokeWidth={22}
                strokeLinecap="round"
                strokeDasharray={dash}
                rotation={-90}
                origin="100, 100"
              />
              {/* The arc itself */}
              <Circle
                cx={100}
                cy={100}
                r={RADIUS}
                fill="none"
                stroke={color}
                strokeWidth={14}
                strokeLinecap="round"
                strokeDasharray={dash}
                rotation={-90}
                origin="100, 100"
              />
            </>
          )}
        </Svg>
        <View style={styles.center}>
          <Animated.Text
            style={[styles.number, { color, transform: [{ scale: pulse }] }]}
          >
            {Math.round(points)}
          </Animated.Text>
          <Text style={styles.muted}>of {maxPoints} points</Text>
          <Animated.Text
            style={[
              styles.pop,
              { color, opacity: popOpacity, transform: [{ translateY: popY }] },
            ]}
          >
            +{Math.round(gain * 10) / 10}
          </Animated.Text>
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
    borderTopColor: GAME.colors.edgeLight,
    borderRadius: GAME.radius.cardLarge,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
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
  number: { fontSize: 48, fontWeight: '800', lineHeight: 54 },
  muted: { color: GAME.colors.textMuted, fontSize: 13 },
  pop: { position: 'absolute', top: 44, fontSize: 24, fontWeight: '800' },
  caption: { color: GAME.colors.textMuted, fontSize: 14, textAlign: 'center' },
});