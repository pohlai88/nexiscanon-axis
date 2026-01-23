'use client';

import { useTheme as useNextTheme } from 'next-themes';

export function useTheme() {
  const { theme, systemTheme } = useNextTheme();
  return (theme === 'system' ? systemTheme : theme) || 'light';
}
