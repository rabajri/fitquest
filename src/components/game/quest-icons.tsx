import { GAME } from '@/constants/game-theme';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

type IconProps = { color?: string };

const SIZE = 22;
const STROKE = 1.8;

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24" fill="none">
      {children}
    </Svg>
  );
}

export function FoodIcon({ color = GAME.colors.primary }: IconProps) {
  return (
    <Frame>
      <Circle cx={12} cy={12} r={8} stroke={color} strokeWidth={STROKE} />
      <Circle cx={12} cy={12} r={3.5} stroke={color} strokeWidth={STROKE} />
    </Frame>
  );
}

export function StepsIcon({ color = GAME.colors.primary }: IconProps) {
  return (
    <Frame>
      <Path
        d="M4 18l4-9 4 5 3-7 5 11"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Frame>
  );
}

export function WaterIcon({ color = GAME.colors.primary }: IconProps) {
  return (
    <Frame>
      <Path
        d="M12 3c3.5 4.2 6 7.2 6 10.5a6 6 0 0 1-12 0C6 10.2 8.5 7.2 12 3z"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Frame>
  );
}

export function SleepIcon({ color = GAME.colors.primary }: IconProps) {
  return (
    <Frame>
      <Path
        d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Frame>
  );
}

export function TasksIcon({ color = GAME.colors.primary }: IconProps) {
  return (
    <Frame>
      <Rect x={4} y={4} width={16} height={16} rx={3} stroke={color} strokeWidth={STROKE} />
      <Path
        d="M8.5 12.5l2.5 2.5 4.5-5"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Frame>
  );
}