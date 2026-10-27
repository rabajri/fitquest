import { floatShadow, FlameOrb, LogoMark, XpCoin } from '@/components/welcome/badges';
import { PlanArt, QuestsArt, StreakArt } from '@/components/welcome/illustrations';
import { WELCOME } from '@/constants/welcome-theme';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  type ScrollViewInstance,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** The photo is 896 x 1200, so its height is 1200/896 of its width. */
const HERO_ASPECT = 1200 / 896;
const HEADER_HEIGHT = 44;

type Page = {
  key: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
};

const PAGES: Page[] = [
  {
    key: 'welcome',
    eyebrow: 'AI HEALTH COACH',
    title: 'Your health, played like a game.',
    body: 'A personal AI coach that builds your plan, tracks your day and levels you up as you make real progress.',
    cta: 'Start your journey',
  },
  {
    key: 'quests',
    eyebrow: 'DAILY QUESTS',
    title: 'Small quests, every single day.',
    body: 'Log your meals, steps and water. Every quest you complete earns points toward a perfect day.',
    cta: 'Next',
  },
  {
    key: 'streak',
    eyebrow: 'STREAKS & XP',
    title: 'Show up, and watch it stack.',
    body: 'Log at least two things a day to grow your streak. Miss a day and your streak survives, once a week.',
    cta: 'Next',
  },
  {
    key: 'plan',
    eyebrow: 'YOUR PLAN',
    title: 'A plan built around you.',
    body: 'Tell us your goal and deadline. We set your calories, protein, water and steps, at a pace that stays safe.',
    cta: 'Create my account',
  },
];

export default function WelcomeScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const [index, setIndex] = useState(0);

  const isLast = index === PAGES.length - 1;
  const heroHeight = width * HERO_ASPECT;
  const pageTop = insets.top + 8 + HEADER_HEIGHT;

  function goTo(page: number) {
    scrollRef.current?.scrollTo({ x: page * width, animated: true });
    setIndex(page);
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const page = Math.round(event.nativeEvent.contentOffset.x / width);
    if (page !== index && page >= 0 && page < PAGES.length) setIndex(page);
  }

  function handlePrimary() {
    if (isLast) router.push('/register');
    else goTo(index + 1);
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.pager}>
        {PAGES.map((page, i) => (
          <View key={page.key} style={{ width }}>
            {i === 0 && (
              <>
                <Image
                  source={require('../../assets/images/welcome-hero.jpg')}
                  style={[styles.hero, { width, height: heroHeight }]}
                  contentFit="cover"
                  contentPosition="top"
                  accessibilityLabel="Athlete in a lime tank top lifting a dumbbell on a glowing podium"
                />
                <LinearGradient
                  colors={['rgba(10,12,17,0.75)', 'rgba(10,12,17,0)']}
                  style={[styles.fade, { top: 0, height: 120 }]}
                  pointerEvents="none"
                />
                <LinearGradient
                  colors={['rgba(10,12,17,0)', WELCOME.background]}
                  style={[styles.fade, { top: heroHeight - 140, height: 141 }]}
                  pointerEvents="none"
                />
              </>
            )}

            <View style={[styles.page, { paddingTop: pageTop }]}>
              <View style={styles.stage}>
                {i === 0 && (
                  <>
                    <XpCoin size={70} style={[floatShadow, styles.heroCoin]} />
                    <FlameOrb size={60} style={[floatShadow, styles.heroFlame]} />
                  </>
                )}
                {i === 1 && <QuestsArt />}
                {i === 2 && <StreakArt />}
                {i === 3 && <PlanArt />}
              </View>

              <View style={styles.copy}>
                <Text style={styles.eyebrow}>{page.eyebrow}</Text>
                <Text style={styles.title}>{page.title}</Text>
                <Text style={styles.body}>{page.body}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.header, { top: insets.top + 8 }]}>
        <LogoMark />
        <Text style={styles.brand}>FitQuest</Text>
        {!isLast && (
          <Pressable
            onPress={() => goTo(PAGES.length - 1)}
            hitSlop={12}
            style={styles.skip}
            accessibilityRole="button">
            <Text style={styles.skipLabel}>Skip</Text>
          </Pressable>
        )}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.dots}>
          {PAGES.map((page, i) => (
            <View key={page.key} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>

        <Pressable
          onPress={handlePrimary}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          accessibilityRole="button">
          <Text style={styles.primaryLabel}>{PAGES[index].cta}</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/login')}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          accessibilityRole="button">
          <Text style={styles.secondaryLabel}>I already have an account</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WELCOME.background },
  pager: { flex: 1 },
  hero: { position: 'absolute', top: 0, left: 0 },
  fade: { position: 'absolute', left: 0, right: 0 },
  page: { flex: 1, paddingHorizontal: 24 },
  stage: { flex: 1, minHeight: 120 },
  heroCoin: { position: 'absolute', right: -4, top: 60, transform: [{ rotate: '14deg' }] },
  heroFlame: { position: 'absolute', left: -2, top: 200, transform: [{ rotate: '-10deg' }] },
  copy: { gap: 12, marginTop: 18 },
  eyebrow: { color: WELCOME.accent, fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  title: { color: WELCOME.text, fontSize: 30, fontWeight: '700', lineHeight: 35, letterSpacing: -0.5 },
  body: { color: WELCOME.textMuted, fontSize: 16, lineHeight: 24 },

  header: {
    position: 'absolute',
    left: 24,
    right: 24,
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brand: { color: WELCOME.text, fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },
  skip: { marginLeft: 'auto' },
  skipLabel: { color: WELCOME.textSoft, fontSize: 15, fontWeight: '600' },

  footer: { gap: 14, paddingTop: 28, paddingHorizontal: 24 },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: WELCOME.dotIdle },
  dotActive: { width: 24, backgroundColor: WELCOME.accent },
  primaryButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: WELCOME.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 15,
    elevation: 8,
  },
  primaryLabel: { color: WELCOME.onAccent, fontSize: 16, fontWeight: '700' },
  secondaryButton: { height: 44, alignItems: 'center', justifyContent: 'center' },
  secondaryLabel: { color: WELCOME.textSoft, fontSize: 15, fontWeight: '500' },
  pressed: { opacity: 0.8 },
});
