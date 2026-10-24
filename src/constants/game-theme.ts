/** Every colour and size used by the game-style dashboard. Change them here, nowhere else. */
export const GAME = {
  colors: {
    background: '#0B0E13',
    surface: '#141922',
    surfaceRaised: '#1B2230',
    border: '#263041',
    text: '#F1F4F9',
    textMuted: '#A2ACBB',
    primary: '#4C8DF6',
    onPrimary: '#07101F',
    reward: '#F4B740',
    onReward: '#1A1305',
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