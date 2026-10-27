import { WELCOME } from '@/constants/welcome-theme';
import { useId } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

/** Gradient ids must be unique on the page, or two badges would share (and break) a gradient. */
function useSvgId() {
  return useId().replace(/[^a-zA-Z0-9]/g, '');
}

/** Drop shadow that makes a badge look like it floats above the screen. */
export const floatShadow: ViewStyle = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 14 },
  shadowOpacity: 0.6,
  shadowRadius: 18,
  elevation: 12,
};

export function LogoMark({ size = 30 }: { size?: number }) {
  const id = useSvgId();
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Defs>
        <LinearGradient id={`logo${id}`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#EFFF9A" />
          <Stop offset="0.5" stopColor={WELCOME.accent} />
          <Stop offset="1" stopColor="#6E8F00" />
        </LinearGradient>
      </Defs>
      <Rect x={1} y={3} width={30} height={28} rx={9} fill="#4A6100" />
      <Rect x={1} y={1} width={30} height={28} rx={9} fill={`url(#logo${id})`} />
      <Path d="M18 6 L10 17 H16 L14 25 L22 13 H16 Z" fill={WELCOME.onAccent} />
    </Svg>
  );
}

type BadgeProps = { size: number; style?: StyleProp<ViewStyle> };

export function XpCoin({ size, style }: BadgeProps) {
  const id = useSvgId();
  return (
    <View style={style}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Defs>
          <RadialGradient id={`gold${id}`} cx="0.35" cy="0.3" r="0.8">
            <Stop offset="0" stopColor="#FFF1B0" />
            <Stop offset="0.5" stopColor="#FFC23D" />
            <Stop offset="1" stopColor="#B26A00" />
          </RadialGradient>
          <LinearGradient id={`rim${id}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFE08A" />
            <Stop offset="1" stopColor="#8A4F00" />
          </LinearGradient>
        </Defs>
        <Circle cx={32} cy={36} r={26} fill="#6B3A00" />
        <Circle cx={32} cy={32} r={26} fill={`url(#rim${id})`} />
        <Circle cx={32} cy={32} r={21} fill={`url(#gold${id})`} />
        <SvgText x={32} y={38} textAnchor="middle" fontSize={15} fontWeight="700" fill="#7A4300">
          XP
        </SvgText>
        <Ellipse cx={24} cy={21} rx={7} ry={3.5} fill="#FFFFFF" opacity={0.55} transform="rotate(-30 24 21)" />
      </Svg>
    </View>
  );
}

export function FlameOrb({ size, style }: BadgeProps) {
  const id = useSvgId();
  return (
    <View style={style}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Defs>
          <RadialGradient id={`orb${id}`} cx="0.35" cy="0.3" r="0.85">
            <Stop offset="0" stopColor="#3A4258" />
            <Stop offset="1" stopColor="#121621" />
          </RadialGradient>
          <LinearGradient id={`flame${id}`} x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0" stopColor="#FF5A1F" />
            <Stop offset="0.6" stopColor="#FFA531" />
            <Stop offset="1" stopColor="#FFE27A" />
          </LinearGradient>
        </Defs>
        <Circle cx={32} cy={32} r={29} fill={`url(#orb${id})`} stroke="#FFFFFF" strokeOpacity={0.15} strokeWidth={1} />
        <Path
          d="M32 13 C38 23 46 27 44 39 C43 47 37 51 32 51 C26 51 20 47 20 39 C20 31 26 29 28 21 C30 27 34 29 32 13 Z"
          fill={`url(#flame${id})`}
        />
        <Path
          d="M32 32 C35 37 38 39 37 44 C36 47 34 48 32 48 C29 48 27 46 27 43 C27 39 30 38 32 32 Z"
          fill="#FFF3B8"
          opacity={0.85}
        />
        <Ellipse cx={22} cy={18} rx={7} ry={3} fill="#FFFFFF" opacity={0.18} transform="rotate(-35 22 18)" />
      </Svg>
    </View>
  );
}
