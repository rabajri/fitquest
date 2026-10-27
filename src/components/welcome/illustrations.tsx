import { FoodIcon, StepsIcon, WaterIcon } from '@/components/game/quest-icons';
import { floatShadow, FlameOrb, XpCoin } from '@/components/welcome/badges';
import { GAME } from '@/constants/game-theme';
import { WELCOME } from '@/constants/welcome-theme';
import { StyleSheet, Text, View } from 'react-native';

/** Screen 2: a few sample quests filling up and earning points. */
export function QuestsArt() {
  const quests = [
    { label: 'Calories', detail: '1,420 / 1,850 kcal', share: 0.77, points: '+16', icon: <FoodIcon color={GAME.quest.food} />, color: GAME.quest.food },
    { label: 'Steps', detail: '6,300 / 8,000 steps', share: 0.79, points: '+15', icon: <StepsIcon color={GAME.quest.steps} />, color: GAME.quest.steps },
    { label: 'Water', detail: '2.5 / 2.5 L', share: 1, points: 'Done', icon: <WaterIcon color={GAME.quest.water} />, color: GAME.quest.water },
  ];

  return (
    <View style={styles.center}>
      <View style={styles.stack}>
        {quests.map((quest) => (
          <View key={quest.label} style={styles.card}>
            <View style={[styles.iconWell, { borderColor: quest.color }]}>{quest.icon}</View>
            <View style={styles.cardBody}>
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle}>{quest.label}</Text>
                <Text style={styles.chip}>{quest.points}</Text>
              </View>
              <Text style={styles.cardDetail}>{quest.detail}</Text>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${quest.share * 100}%`, backgroundColor: quest.color }]} />
              </View>
            </View>
          </View>
        ))}
      </View>
      <XpCoin size={64} style={[floatShadow, styles.questCoin]} />
    </View>
  );
}

/** Screen 3: a growing streak, one tile per day of the week. */
export function StreakArt() {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const doneDays = 5;

  return (
    <View style={styles.center}>
      <FlameOrb size={130} style={floatShadow} />
      <Text style={styles.streakCount}>5 day streak</Text>
      <View style={styles.week}>
        {days.map((day, i) => {
          const done = i < doneDays;
          const today = i === doneDays;
          return (
            <View key={i} style={styles.dayColumn}>
              <View style={[styles.dayTile, done && styles.dayDone, today && styles.dayToday]}>
                {done && <Text style={styles.dayCheck}>✓</Text>}
              </View>
              <Text style={styles.dayLabel}>{day}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/** Screen 4: an example of the daily plan the coach builds. */
export function PlanArt() {
  const rows = [
    { label: 'Calories', value: '1,850 kcal', color: GAME.quest.food },
    { label: 'Protein', value: '120 g', color: GAME.quest.tasks },
    { label: 'Water', value: '2.6 L', color: GAME.quest.water },
    { label: 'Steps', value: '8,000', color: GAME.quest.steps },
  ];

  return (
    <View style={styles.center}>
      <View style={[styles.planCard, floatShadow]}>
        <Text style={styles.planEyebrow}>YOUR DAILY PLAN</Text>
        {rows.map((row) => (
          <View key={row.label} style={styles.planRow}>
            <View style={[styles.planDot, { backgroundColor: row.color }]} />
            <Text style={styles.planLabel}>{row.label}</Text>
            <Text style={styles.planValue}>{row.value}</Text>
          </View>
        ))}
        <View style={styles.paceBadge}>
          <Text style={styles.paceText}>Safe pace · at most 1% of body weight a week</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  stack: { width: '100%', maxWidth: 320, gap: 12 },
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: WELCOME.card,
    borderWidth: 1,
    borderColor: WELCOME.cardBorder,
  },
  iconWell: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1, gap: 6 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { color: WELCOME.text, fontSize: 15, fontWeight: '700' },
  chip: {
    color: WELCOME.onAccent,
    backgroundColor: WELCOME.accent,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: 'hidden',
  },
  cardDetail: { color: WELCOME.textMuted, fontSize: 12 },
  track: { height: 6, borderRadius: 3, backgroundColor: WELCOME.track, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  questCoin: { position: 'absolute', right: -6, top: '12%', transform: [{ rotate: '14deg' }] },

  streakCount: {
    color: WELCOME.text,
    fontSize: 26,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 18,
  },
  week: { flexDirection: 'row', gap: 8 },
  dayColumn: { alignItems: 'center', gap: 6 },
  dayTile: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: WELCOME.card,
    borderWidth: 1,
    borderColor: WELCOME.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDone: { backgroundColor: WELCOME.accent, borderColor: WELCOME.accent },
  dayToday: { borderColor: WELCOME.accent, borderWidth: 2 },
  dayCheck: { color: WELCOME.onAccent, fontSize: 16, fontWeight: '800' },
  dayLabel: { color: WELCOME.textMuted, fontSize: 12, fontWeight: '600' },

  planCard: {
    width: '100%',
    maxWidth: 320,
    padding: 20,
    gap: 14,
    borderRadius: 22,
    backgroundColor: WELCOME.card,
    borderWidth: 1,
    borderColor: WELCOME.cardBorder,
  },
  planEyebrow: { color: WELCOME.accent, fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  planDot: { width: 10, height: 10, borderRadius: 5 },
  planLabel: { flex: 1, color: WELCOME.textSoft, fontSize: 16 },
  planValue: { color: WELCOME.text, fontSize: 18, fontWeight: '700' },
  paceBadge: {
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(198, 244, 50, 0.12)',
  },
  paceText: { color: WELCOME.accent, fontSize: 13, fontWeight: '600', textAlign: 'center' },
});
