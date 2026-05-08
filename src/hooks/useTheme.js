import { useMemo } from 'react';
import { useAppStore } from '../store';
import { getTokens } from '../constants/tokens';

export function useTheme() {
  const palette = useAppStore((s) => s.palette);
  const darkMode = useAppStore((s) => s.darkMode);

  const tokens = useMemo(() => getTokens(palette, darkMode), [palette, darkMode]);

  return tokens;
}
