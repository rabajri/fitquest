import { JourneyPath } from '@/components/game/journey-path';
import { QuestCard } from '@/components/game/quest-card';
import { FoodIcon, SleepIcon, StepsIcon, TasksIcon, WaterIcon } from '@/components/game/quest-icons';
import { RankCard } from '@/components/game/rank-card';
import { ScoreRing } from '@/components/game/score-ring';
import { GAME } from '@/constants/game-theme';
import {
  DAILY_POINTS_MAX,
  LOGGING,
  POINTS,
  caloriePoints,
  levelFromXp,
  movementPoints,
  rankLabel,
  weightPath,
} from '@/engine';
import { todayLocalDate } from '@/lib/dates';
import { supabase } from '@/lib/supabase';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
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
};

const LOG_COLUMNS =
  'id, calorie_target, calorie_logged, protein_target, protein_logged, fat_target, fat_logged, carb_target, carb_logged, water_target_liters, water_logged_liters, steps_target, steps_logged';

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

  const [foodCalories, setFoodCalories] = useState('');
  const [foodProtein, setFoodProtein] = useState('');
  const [foodFat, setFoodFat] = useState('');
  const [foodCarbs, setFoodCarbs] = useState('');
  const [stepsInput, setStepsInput] = useState('');

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

  async function handleAddFood() {
    if (!log) return;

    const calories = Number(foodCalories || 0);
    const protein = Number(foodProtein || 0);
    const fat = Number(foodFat || 0);
    const carbs = Number(foodCarbs || 0);

    if ([calories, protein, fat, carbs].some((n) => Number.isNaN(n) || n < 0)) {
      setMessage('Please enter numbers only (no negatives).');
      return;
    }
    if (calories + protein + fat + carbs === 0) {
      setMessage('Enter at least one number to add.');
      return;
    }

    const next = {
      calorie_logged: round1(log.calorie_logged + calories),
      protein_logged: round1(log.protein_logged + protein),
      fat_logged: round1(log.fat_logged + fat),
      carb_logged: round1(log.carb_logged + carbs),
    };

    const { error } = await supabase.from('daily_logs').update(next).eq('id', log.id);

    if (error) {
      setMessage(`Could not save food: ${error.message}`);
      return;
    }

    setMessage('');
    setLog({ ...log, ...next });
    setFoodCalories('');
    setFoodProtein('');
    setFoodFat('');
    setFoodCarbs('');
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

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  // Live preview of today's points (all the maths is in the engine)
  const todayCaloriePoints =
    log && log.calorie_target ? caloriePoints(log.calorie_logged, log.calorie_target) : 0;
  const todayStepPoints =
    log && log.steps_target ? movementPoints(log.steps_logged, log.steps_target) : 0;
  // Sleep and tasks are not tracked yet, so they count as 0 for now
  const todayTotalPoints = todayCaloriePoints + todayStepPoints;

  // XP and rank are not tracked yet: everyone is a Recruit with 0 XP for now
  const levelInfo = levelFromXp(0);

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
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.eyebrow}>TODAY</Text>

          {!!message && <Text style={styles.message}>{message}</Text>}

          {log && (
            <>
              <RankCard
                rankLabel={rankLabel('recruit')}
                level={levelInfo.level}
                xpIntoLevel={levelInfo.xpIntoLevel}
                xpForNext={levelInfo.xpForNext}
              />

              <ScoreRing
                points={todayTotalPoints}
                maxPoints={DAILY_POINTS_MAX}
                goodDayAt={POINTS.goodDayBase}
              />

              <Text style={styles.sectionTitle}>Daily quests</Text>

              <QuestCard
                icon={<FoodIcon />}
                title="Calories"
                subtitle={`${log.calorie_logged.toLocaleString()} / ${
                  log.calorie_target?.toLocaleString() ?? '?'
                } kcal`}
                chipText={`${round1(todayCaloriePoints)} / ${POINTS.calorieMax}`}
                chipStyle={todayCaloriePoints >= POINTS.calorieMax ? 'complete' : 'earning'}
                progress={share(log.calorie_logged, log.calorie_target)}
                actionLabel="Add food"
                onAction={handleAddFood}
                actionStyle="secondary"
              >
                <View style={styles.macroRow}>
                  <MacroBar label="Protein" logged={log.protein_logged} target={log.protein_target} />
                  <MacroBar label="Fat" logged={log.fat_logged} target={log.fat_target} />
                  <MacroBar label="Carbs" logged={log.carb_logged} target={log.carb_target} />
                </View>
                <Text style={styles.hint}>Add what you just ate:</Text>
                <TextInput
                  placeholder="Calories (kcal)"
                  value={foodCalories}
                  onChangeText={setFoodCalories}
                  keyboardType="decimal-pad"
                  style={styles.input}
                  placeholderTextColor={GAME.colors.textMuted}
                />
                <TextInput
                  placeholder="Protein (g)"
                  value={foodProtein}
                  onChangeText={setFoodProtein}
                  keyboardType="decimal-pad"
                  style={styles.input}
                  placeholderTextColor={GAME.colors.textMuted}
                />
                <TextInput
                  placeholder="Fat (g)"
                  value={foodFat}
                  onChangeText={setFoodFat}
                  keyboardType="decimal-pad"
                  style={styles.input}
                  placeholderTextColor={GAME.colors.textMuted}
                />
                <TextInput
                  placeholder="Carbs (g)"
                  value={foodCarbs}
                  onChangeText={setFoodCarbs}
                  keyboardType="decimal-pad"
                  style={styles.input}
                  placeholderTextColor={GAME.colors.textMuted}
                />
              </QuestCard>

              {log.steps_target !== null && (
                <QuestCard
                  icon={<StepsIcon />}
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
                icon={<SleepIcon color={GAME.colors.textMuted} />}
                title="Sleep"
                subtitle="Logging comes soon · worth 20 points"
                dimmed
              />

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
}: {
  label: string;
  logged: number;
  target: number | null;
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: GAME.colors.background },
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
  logout: {
    backgroundColor: '#ef4444',
    padding: 14,
    borderRadius: GAME.radius.button,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutText: { color: 'white', fontWeight: '700' },
});