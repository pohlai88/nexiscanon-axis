'use client';

import { useEffect, useState } from 'react';

import type { ThemeName } from '../tokens/theme';

export function useThemeName(): ThemeName {
  const [theme, setTheme] = useState<ThemeName>('neutral');

  useEffect(() => {
    const read = () => {
      const el = document.documentElement;
      const t = (el.getAttribute('data-theme') || 'neutral') as ThemeName;
      setTheme(t);
    };

    read();

    // Observe attribute changes (theme switch)
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => obs.disconnect();
  }, []);

  return theme;
}
