import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useAppStore } from '../store';
import { getTokens } from '../constants/tokens';

export function useTheme() {
  const palette = useAppStore((s) => s.palette);
  const themeMode = useAppStore((s) => s.themeMode) ?? 'light';
  const systemScheme = useColorScheme();

  const isDark =
    themeMode === 'dark' ? true :
    themeMode === 'auto' ? systemScheme === 'dark' :
    false;

  const tokens = useMemo(() => getTokens(palette, isDark), [palette, isDark]);

  return tokens;
}
