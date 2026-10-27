/** Every colour and size used by the game-style dashboard. Change them here, nowhere else. */
export const GAME = {
  colors: {
    background: '#161C1E',
    glowTop: '#1F4A4C',
    surface: '#1E2528',
    surfaceRaised: '#283234',
    border: '#35423F',
    edgeLight: '#46585A',
    text: '#EEF3F3',
    textMuted: '#93A5A5',
    primary: '#2BD4D0',
    onPrimary: '#06201F',
    reward: '#FFC857',
    onReward: '#1A1305',
    panelOverlay: 'rgba(24, 31, 33, 0.9)',
    /** Near-black behind the hero photo, matched to the photo's own background. */
    heroStage: '#08090B',
  },
  /** Glow and accent colour for each rank. The hero card uses these. */
  rank: {
    recruit: '#8FA6A8',
    trainee: '#4ADE80',
    athlete: '#2BD4D0',
    warrior: '#A78BFA',
    elite: '#FB923C',
    legend: '#FFD76A',
  },
  /** Accent colour for each daily quest. */
  quest: {
    food: '#FF9F5A',
    steps: '#2BD4D0',
    water: '#4C9BFF',
    sleep: '#A78BFA',
    tasks: '#FF7AA8',
  },
  /** How the hero photo is framed. Smaller widthShare = she looks further away. */
  hero: {
    height: 400,
    /** Share of the card width the photo takes (0.5 to 1). */
    widthShare: 0.78,
    /** Gap above the photo in pixels. */
    top: 28,
  },
  radius: {
    card: 18,
    cardLarge: 20,
    pill: 999,
    button: 12,
  },
  spacing: {
    screen: 20,
    gap: 14,
  },
} as const;