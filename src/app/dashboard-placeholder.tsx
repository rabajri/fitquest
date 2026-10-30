import { FoodRow } from '@/components/food/food-ui';
import { JourneyPath } from '@/components/game/journey-path';
import { QuestCard } from '@/components/game/quest-card';
import { FoodIcon, SleepIcon, StepsIcon, TasksIcon, WaterIcon } from '@/components/game/quest-icons';
import { RankCard } from '@/components/game/rank-card';
import { ScoreRing } from '@/components/game/score-ring';
import { StreakRow } from '@/components/game/streak-row';
import { GAME } from '@/constants/game-theme';
import {
  FOOD_POINTS,
  LOGGING,
  PERFECT_DAY_POINTS,
  POINTS,
  SLEEP,
  STREAK,
  type StreakDay,
  calculateStreak,
  foodPoints,
  levelFromXp,
  loggedItemCount,
  loggingPoints,
  movementPoints,
  rankLabel,
  sleepHoursBetween,
  sleepPoints,
  streakPoints,
  waterFullBonusItems,
  weightPath,
} from '@/engine';
import { dateToTime, formatClock, timeToDate, todayLocalDate } from '@/lib/dates';
import { describeServing, fetchEntries, type FoodEntry, MEALS, scaleNutrition } from '@/lib/food-log';
import { supabase } from '@/lib/supabase';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PlanSummary = {
  id: string;
  current_weight_kg: number;
  target_weight_kg: number | null;
  deadline_weeks: number | null;
  end_date: string | null;
  current_calorie_target: number | null;
  protein_grams: number | null;
  fat_grams: number | null;
  carb_grams: number | null;
  water_liters: number | null;
  step_goal: number | null;
};

type TodayLog = {
  id: string;
  calorie_target: number | null;
  calorie_logged: number;
  protein_target: number | null;
  protein_logged: number;
  fat_target: number | null;
  fat_logged: number;
  carb_target: number | null;
  carb_logged: number;
  water_target_liters: number | null;
  water_logged_liters: number;
  steps_target: number | null;
  steps_logged: number;
  meals_logged: number;
  points_earned: number;
  /** Local "HH:MM:SS" from the database, or null if sleep isn't logged yet. */
  sleep_bedtime: string | null;
  sleep_wake_time: string | null;
  sleep_hours: number | null;
  sleep_target_hours: number | null;
};

const LOG_COLUMNS =
  'id, calorie_target, calorie_logged, protein_target, protein_logged, fat_target, fat_logged, carb_target, carb_logged, water_target_liters, water_logged_liters, steps_target, steps_logged, meals_logged, points_earned, sleep_bedtime, sleep_wake_time, sleep_hours, sleep_target_hours';

type SleepField = 'bedtime' | 'wake';

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

/** Share from 0 to 1, safe when there is no target. */
function share(logged: number, target: number | null) {
  return target && target > 0 ? Math.min(logged / target, 1) : 0;
}

export default function DashboardPlaceholder() {
  const [plan, setPlan] = useState<PlanSummary | null>(null);
  const [log, setLog] = useState<TodayLog | null>(null);
  const [message, setMessage] = useState('Loading your plan...');

  // Today's foods, one row each (the day's totals live in the log)
  const [foods, setFoods] = useState<FoodEntry[]>([]);
  const [foodError, setFoodError] = useState('');
  const [stepsInput, setStepsInput] = useState('');

  // Last night's sleep, picked as two clock times. Which picker is open, if any.
  const [bedtime, setBedtime] = useState(() => timeToDate(SLEEP.defaultBedtime));
  const [wakeTime, setWakeTime] = useState(() => timeToDate(SLEEP.defaultWakeTime));
  const [openPicker, setOpenPicker] = useState<SleepField | null>(null);

  // Earlier days, used to work out the streak (today is added live below)
  const [history, setHistory] = useState<StreakDay[]>([]);

  // XP from earlier days (the sum of their points), and the points already saved for today
  const [pastXp, setPastXp] = useState(0);
  const [savedPoints, setSavedPoints] = useState(0);

  // Reload every time the dashboard appears
  useFocusEffect(
    useCallback(() => {
      async function loadEverything() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setMessage('Not logged in.');
          return;
        }

        const { data: planData, error: planError } = await supabase
          .from('user_plans')
          .select(
            'id, current_weight_kg, target_weight_kg, deadline_weeks, end_date, current_calorie_target, protein_grams, fat_grams, carb_grams, water_liters, step_goal'
          )
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (planError) {
          setMessage(`Could not load your plan: ${planError.message}`);
          return;
        }
        if (!planData) {
          setMessage('No plan found yet.');
          return;
        }
        setPlan(planData);

        // Find today's log, or create it with today's targets copied from the plan
        const today = todayLocalDate();
        const { data: existing, error: logError } = await supabase
          .from('daily_logs')
          .select(LOG_COLUMNS)
          .eq('user_id', user.id)
          .eq('log_date', today)
          .maybeSingle();

        if (logError) {
          setMessage(`Could not load today's log: ${logError.message}`);
          return;
        }

        let todayLog = existing;
        if (!todayLog) {
          const { data: created, error: createError } = await supabase
            .from('daily_logs')
            .insert({
              user_id: user.id,
              plan_id: planData.id,
              log_date: today,
              calorie_target: planData.current_calorie_target,
              protein_target: planData.protein_grams,
              fat_target: planData.fat_grams,
              carb_target: planData.carb_grams,
              water_target_liters: planData.water_liters,
              steps_target: planData.step_goal,
              sleep_target_hours: SLEEP.targetHours,
            })
            .select(LOG_COLUMNS)
            .single();

          if (createError) {
            setMessage(`Could not start today's log: ${createError.message}`);
            return;
          }
          todayLog = created;
        }

        setLog(todayLog);
        setSavedPoints(Number(todayLog.points_earned));
        // Show the saved sleep times, or the usual defaults if nothing is logged yet
        setBedtime(timeToDate(todayLog.sleep_bedtime ?? SLEEP.defaultBedtime));
        setWakeTime(timeToDate(todayLog.sleep_wake_time ?? SLEEP.defaultWakeTime));

        fetchEntries(today)
          .then((entries) => {
            setFoods(entries);
            setFoodError('');
          })
          .catch((e: Error) => setFoodError(`Could not load today's foods: ${e.message}`));

        // Earlier days, for the streak and XP. A day with no row counts as nothing logged.
        const { data: pastRows } = await supabase
          .from('daily_logs')
          .select('log_date, meals_logged, water_logged_liters, water_target_liters, steps_logged, sleep_hours, points_earned')
          .eq('user_id', user.id)
          .lt('log_date', today)
          .order('log_date', { ascending: true });

        setPastXp((pastRows ?? []).reduce((sum, row) => sum + Number(row.points_earned), 0));

        setHistory(
          (pastRows ?? []).map((row) => ({
            date: row.log_date,
            itemsLogged: loggedItemCount({
              mealsLogged: row.meals_logged,
              waterLiters: row.water_logged_liters,
              waterTargetLiters: row.water_target_liters,
              steps: row.steps_logged,
              sleepHours: row.sleep_hours,
            }),
          }))
        );

        setMessage('');
      }

      loadEverything();
    }, [])
  );

  async function handleAddWater() {
    if (!log) return;
    const next = Math.round((log.water_logged_liters + LOGGING.waterStepLiters) * 100) / 100;

    const { error } = await supabase
      .from('daily_logs')
      .update({ water_logged_liters: next })
      .eq('id', log.id);

    if (error) {
      setMessage(`Could not save water: ${error.message}`);
      return;
    }
    setMessage('');
    setLog({ ...log, water_logged_liters: next });
  }

  async function handleAddSteps() {
    if (!log) return;

    const steps = Number(stepsInput);
    if (!stepsInput || Number.isNaN(steps) || steps <= 0) {
      setMessage('Please enter the number of steps you walked.');
      return;
    }

    const next = Math.round(log.steps_logged + steps);

    const { error } = await supabase
      .from('daily_logs')
      .update({ steps_logged: next })
      .eq('id', log.id);

    if (error) {
      setMessage(`Could not save steps: ${error.message}`);
      return;
    }

    setMessage('');
    setLog({ ...log, steps_logged: next });
    setStepsInput('');
  }

  function handlePickTime(_event: unknown, selected: Date) {
    const field = openPicker;
    setOpenPicker(null);
    if (field === 'bedtime') setBedtime(selected);
    if (field === 'wake') setWakeTime(selected);
  }

  async function handleSaveSleep() {
    if (!log) return;

    const bed = dateToTime(bedtime);
    const wake = dateToTime(wakeTime);
    const hours = sleepHoursBetween(bed, wake);
    if (hours > SLEEP.maxHours) {
      setMessage(`That's ${hours} hours of sleep. Please check the times (AM / PM).`);
      return;
    }

    const next = {
      sleep_bedtime: bed,
      sleep_wake_time: wake,
      sleep_hours: hours,
      sleep_target_hours: log.sleep_target_hours ?? SLEEP.targetHours,
    };

    const { error } = await supabase.from('daily_logs').update(next).eq('id', log.id);

    if (error) {
      setMessage(`Could not save sleep: ${error.message}`);
      return;
    }
    setMessage('');
    setLog({ ...log, ...next });
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  // Live preview of today's points (all the maths is in the engine)
  const food = log
    ? foodPoints({
        calories: { logged: log.calorie_logged, target: log.calorie_target },
        protein: { logged: log.protein_logged, target: log.protein_target },
        fat: { logged: log.fat_logged, target: log.fat_target },
        carbs: { logged: log.carb_logged, target: log.carb_target },
      })
    : null;
  const todayFoodPoints = food?.total ?? 0;
  const todayStepPoints =
    log && log.steps_target ? movementPoints(log.steps_logged, log.steps_target) : 0;
  const sleepTarget = log?.sleep_target_hours ?? SLEEP.targetHours;
  const todaySleepPoints =
    log && log.sleep_hours != null ? sleepPoints(log.sleep_hours, sleepTarget) : 0;
  // Daily tasks are not tracked yet, so they count as 0 for now
  const todayTotalPoints = todayFoodPoints + todayStepPoints + todaySleepPoints;

  // Logging bonus and streak (rules live in the engine). Mood is not tracked yet.
  const loggedToday = log
    ? {
        mealsLogged: log.meals_logged,
        waterLiters: log.water_logged_liters,
        waterTargetLiters: log.water_target_liters,
        steps: log.steps_logged,
        sleepHours: log.sleep_hours,
      }
    : null;
  const itemsLoggedToday = loggedToday ? loggedItemCount(loggedToday) : 0;
  // Finishing the water target earns one extra bonus point, but it doesn't count toward the streak
  const todayLoggingBonus = loggingPoints(
    itemsLoggedToday,
    loggedToday ? waterFullBonusItems(loggedToday) : 0
  );
  const today = todayLocalDate();
  const streakInfo = calculateStreak(
    [...history, { date: today, itemsLogged: itemsLoggedToday }],
    today
  );
  const todayStreakBonus = streakPoints(streakInfo.streakDays);

  // Everything earned today, and total XP (every earlier day plus today). 1 point = 1 XP.
  const totalPointsToday = todayTotalPoints + todayLoggingBonus + todayStreakBonus;
  const levelInfo = levelFromXp(Math.round(pastXp + totalPointsToday));

  // Save today's points whenever they change, so tomorrow they count toward XP
  useEffect(() => {
    if (!log) return;
    const rounded = Math.round(totalPointsToday * 10) / 10;
    if (rounded === savedPoints) return;

    supabase
      .from('daily_logs')
      .update({ points_earned: rounded })
      .eq('id', log.id)
      .then(({ error }) => {
        if (!error) setSavedPoints(rounded);
      });
  }, [log?.id, totalPointsToday, savedPoints]);

  // The weights drawn on the journey path (from the engine)
  const journeyWeights =
    plan && plan.target_weight_kg && plan.deadline_weeks
      ? weightPath({
          goal: 'lose_weight',
          startKg: plan.current_weight_kg,
          targetKg: plan.target_weight_kg,
          totalDays: plan.deadline_weeks * 7,
        })
      : null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[GAME.colors.glowTop, GAME.colors.background]}
        style={styles.atmosphere}
        pointerEvents="none"
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.eyebrow}>TODAY</Text>

          {!!message && <Text style={styles.message}>{message}</Text>}

          {log && food && (
            <>
              <RankCard
                rankId="recruit"
                rankLabel={rankLabel('recruit')}
                level={levelInfo.level}
                xpIntoLevel={levelInfo.xpIntoLevel}
                xpForNext={levelInfo.xpForNext}
              />

              <ScoreRing
                points={totalPointsToday}
                maxPoints={PERFECT_DAY_POINTS}
                questPoints={todayTotalPoints}
                goodDayAt={POINTS.goodDayBase}
              />

              <StreakRow
                loggingPoints={todayLoggingBonus}
                loggingMax={POINTS.loggingMax}
                streakDays={streakInfo.streakDays}
                streakBonus={todayStreakBonus}
                streakBonusMax={POINTS.streakCapPoints}
                atRisk={streakInfo.atRisk && itemsLoggedToday < STREAK.minItemsPerDay}
              />

              <Text style={styles.sectionTitle}>Daily quests</Text>

              <QuestCard
                icon={<FoodIcon />}
                accent={GAME.quest.food}
                title="Calories"
                subtitle={`${log.calorie_logged.toLocaleString()} / ${
                  log.calorie_target?.toLocaleString() ?? '?'
                } kcal · ${food.calories} / ${FOOD_POINTS.calories} pts`}
                chipText={`${todayFoodPoints} / ${POINTS.calorieMax}`}
                chipStyle={todayFoodPoints >= POINTS.calorieMax ? 'complete' : 'earning'}
                progress={share(log.calorie_logged, log.calorie_target)}
                actionLabel="Add food"
                onAction={() => router.push('/add-food')}
                actionStyle="secondary"
              >
                <View style={styles.macroRow}>
                  <MacroBar
                    label="Protein"
                    logged={log.protein_logged}
                    target={log.protein_target}
                    points={food.protein}
                    maxPoints={FOOD_POINTS.protein}
                  />
                  <MacroBar
                    label="Fat"
                    logged={log.fat_logged}
                    target={log.fat_target}
                    points={food.fat}
                    maxPoints={FOOD_POINTS.fat}
                  />
                  <MacroBar
                    label="Carbs"
                    logged={log.carb_logged}
                    target={log.carb_target}
                    points={food.carbs}
                    maxPoints={FOOD_POINTS.carbs}
                  />
                </View>
                {!!foodError && <Text style={styles.hint}>{foodError}</Text>}
                {foods.length === 0 && !foodError && (
                  <Text style={styles.hint}>Nothing logged yet today. Tap Add food to start.</Text>
                )}
                {MEALS.map((meal) => {
                  const mealFoods = foods.filter((f) => f.meal === meal.id);
                  if (mealFoods.length === 0) return null;
                  return (
                    <View key={meal.id} style={styles.mealGroup}>
                      <Text style={styles.mealTitle}>{meal.label}</Text>
                      {mealFoods.map((f) => (
                        <FoodRow
                          key={f.id}
                          name={f.name}
                          detail={describeServing(f.portion, f.servings)}
                          calories={scaleNutrition(f, f.servings).calories}
                          onPress={() => router.push({ pathname: '/edit-food', params: { id: f.id } })}
                        />
                      ))}
                    </View>
                  );
                })}
              </QuestCard>

              {log.steps_target !== null && (
                <QuestCard
                  icon={<StepsIcon />}
                  accent={GAME.quest.steps}
                  title="Steps"
                  subtitle={`${log.steps_logged.toLocaleString()} / ${log.steps_target.toLocaleString()} steps`}
                  chipText={`${round1(todayStepPoints)} / ${POINTS.movementMax}`}
                  chipStyle={todayStepPoints >= POINTS.movementMax ? 'complete' : 'earning'}
                  progress={share(log.steps_logged, log.steps_target)}
                  actionLabel="Add steps"
                  onAction={handleAddSteps}
                  actionStyle="secondary"
                >
                  <TextInput
                    placeholder="Steps you just walked"
                    value={stepsInput}
                    onChangeText={setStepsInput}
                    keyboardType="number-pad"
                    style={styles.input}
                    placeholderTextColor={GAME.colors.textMuted}
                  />
                </QuestCard>
              )}

              <QuestCard
                icon={<WaterIcon />}
                accent={GAME.quest.water}
                title="Water"
                subtitle={`${log.water_logged_liters} / ${log.water_target_liters ?? '?'} L`}
                chipText="Tracked"
                chipStyle="neutral"
                progress={share(log.water_logged_liters, log.water_target_liters)}
                actionLabel={`+ ${LOGGING.waterStepLiters * 1000} ml`}
                onAction={handleAddWater}
                actionStyle="primary"
              />

              <QuestCard
                icon={<SleepIcon />}
                accent={GAME.quest.sleep}
                title="Sleep"
                subtitle={
                  log.sleep_hours != null
                    ? `${log.sleep_hours} h slept · target ${sleepTarget} h`
                    : `Log last night's sleep · target ${sleepTarget} h`
                }
                chipText={`${round1(todaySleepPoints)} / ${POINTS.sleepMax}`}
                chipStyle={
                  todaySleepPoints >= POINTS.sleepMax
                    ? 'complete'
                    : log.sleep_hours != null
                      ? 'earning'
                      : 'neutral'
                }
                progress={todaySleepPoints / POINTS.sleepMax}
                actionLabel={log.sleep_hours != null ? 'Update sleep' : 'Save sleep'}
                onAction={handleSaveSleep}
                actionStyle="secondary"
              >
                <View style={styles.sleepRow}>
                  <Pressable onPress={() => setOpenPicker('bedtime')} style={styles.timeBox}>
                    <Text style={styles.macroLabel}>Went to bed</Text>
                    <Text style={styles.timeValue}>{formatClock(bedtime)}</Text>
                  </Pressable>
                  <Pressable onPress={() => setOpenPicker('wake')} style={styles.timeBox}>
                    <Text style={styles.macroLabel}>Woke up</Text>
                    <Text style={styles.timeValue}>{formatClock(wakeTime)}</Text>
                  </Pressable>
                </View>
                <Text style={styles.hint}>
                  {sleepHoursBetween(dateToTime(bedtime), dateToTime(wakeTime))} hours of sleep
                </Text>
                {openPicker && (
                  <DateTimePicker
                    value={openPicker === 'bedtime' ? bedtime : wakeTime}
                    mode="time"
                    onValueChange={handlePickTime}
                    onDismiss={() => setOpenPicker(null)}
                  />
                )}
              </QuestCard>

              <QuestCard
                icon={<TasksIcon color={GAME.colors.textMuted} />}
                title="Daily tasks"
                subtitle="Coming soon · worth 20 points"
                dimmed
              />
            </>
          )}

          {plan && journeyWeights && (
            <>
              <Text style={styles.sectionTitle}>Your journey</Text>
              <JourneyPath weightsKg={journeyWeights} weeks={plan.deadline_weeks} />
            </>
          )}

          <Pressable onPress={handleLogout} style={styles.logout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function MacroBar({
  label,
  logged,
  target,
  points,
  maxPoints,
}: {
  label: string;
  logged: number;
  target: number | null;
  points: number;
  maxPoints: number;
}) {
  return (
    <View style={styles.macro}>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroValue}>
        {logged} / {target ?? '?'} g
      </Text>
      <View style={styles.macroTrack}>
        <View style={[styles.macroFill, { width: `${share(logged, target) * 100}%` }]} />
      </View>
      <Text style={styles.macroLabel}>
        {points} / {maxPoints} pts
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: GAME.colors.background },
  atmosphere: { position: 'absolute', top: 0, left: 0, right: 0, height: 480 },
  safeArea: { flex: 1 },
  content: { padding: GAME.spacing.screen, gap: GAME.spacing.gap },
  eyebrow: { letterSpacing: 2, color: GAME.colors.textMuted, fontSize: 12, fontWeight: '700' },
  message: { color: GAME.colors.text, fontSize: 14 },
  sectionTitle: { color: GAME.colors.text, fontSize: 16, fontWeight: '700', marginTop: 6 },
  hint: { color: GAME.colors.textMuted, fontSize: 13 },
  macroRow: { flexDirection: 'row', gap: 12 },
  macro: { flex: 1, gap: 6 },
  macroLabel: { color: GAME.colors.textMuted, fontSize: 12 },
  macroValue: { color: GAME.colors.text, fontSize: 13, fontWeight: '700' },
  macroTrack: {
    height: 4,
    borderRadius: GAME.radius.pill,
    backgroundColor: GAME.colors.surfaceRaised,
    overflow: 'hidden',
  },
  macroFill: { height: 4, backgroundColor: GAME.colors.primary },
  input: {
    borderWidth: 1,
    borderColor: GAME.colors.border,
    borderRadius: GAME.radius.button,
    padding: 12,
    width: '100%',
    color: GAME.colors.text,
    backgroundColor: GAME.colors.background,
  },
  mealGroup: { gap: 8 },
  mealTitle: { color: GAME.colors.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
  sleepRow: { flexDirection: 'row', gap: 12 },
  timeBox: {
    flex: 1,
    gap: 4,
    borderWidth: 1,
    borderColor: GAME.colors.border,
    borderRadius: GAME.radius.button,
    padding: 12,
    backgroundColor: GAME.colors.background,
  },
  timeValue: { color: GAME.colors.text, fontSize: 18, fontWeight: '700' },
  logout: {
    backgroundColor: '#ef4444',
    padding: 14,
    borderRadius: GAME.radius.button,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutText: { color: 'white', fontWeight: '700' },
});