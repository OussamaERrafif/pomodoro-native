import React, { useEffect, useId } from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, ClipPath, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

function buildWavePath(size, progress, offset) {
  'worklet';
  const r = size / 2 - 4;
  const cx = size / 2;
  const cy = size / 2;
  const fillY = cy - r + (size - 8) * Math.min(1, Math.max(0, progress));
  const segs = 10;
  const waveH = 7;

  let d = `M ${cx - r} ${size} L ${cx - r} ${fillY.toFixed(2)}`;
  for (let i = 0; i <= segs; i++) {
    const x = cx - r + (i / segs) * (r * 2);
    const y = fillY + Math.sin(i * 1.4 + offset) * waveH;
    d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  d += ` L ${cx + r} ${size} Z`;
  return d;
}

export function BlobTimer({ size = 280, progress = 0.3, isBreak = false, colors, paused = false }) {
  const uid = `bt${size}${isBreak ? 'b' : 'f'}`;
  const waveOffset = useSharedValue(0);

  const r = size / 2 - 4;
  const cx = size / 2;
  const cy = size / 2;

  const fillColor = isBreak ? colors.breakC : colors.focus;
  const fillSoft = isBreak ? colors.breakSoft : colors.focusSoft;

  useEffect(() => {
    waveOffset.value = 0;
    if (!paused) {
      waveOffset.value = withRepeat(
        withTiming(Math.PI * 2, { duration: 4000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      cancelAnimation(waveOffset);
    }
    return () => cancelAnimation(waveOffset);
  }, [paused]);

  const animatedProps1 = useAnimatedProps(() => {
    'worklet';
    return { d: buildWavePath(size, progress, waveOffset.value) };
  });

  const animatedProps2 = useAnimatedProps(() => {
    'worklet';
    return { d: buildWavePath(size, progress, waveOffset.value + 1.5) };
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id={`${uid}g`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={fillSoft} />
            <Stop offset="100%" stopColor={fillColor} />
          </LinearGradient>
          <ClipPath id={`${uid}c`}>
            <Circle cx={cx} cy={cy} r={r} />
          </ClipPath>
        </Defs>

        <Circle cx={cx} cy={cy} r={r} fill={colors.surfaceAlt} />
        <Circle cx={cx} cy={cy} r={r} fill="none" stroke={colors.line} strokeWidth={1} />

        <G clipPath={`url(#${uid}c)`}>
          <AnimatedPath
            animatedProps={animatedProps1}
            fill={`url(#${uid}g)`}
            opacity={0.95}
          />
          <AnimatedPath
            animatedProps={animatedProps2}
            fill={fillSoft}
            opacity={0.28}
          />
        </G>

        <Circle cx={cx} cy={cy} r={r} fill="none" stroke={colors.line} strokeWidth={1.5} />
      </Svg>
    </View>
  );
}
