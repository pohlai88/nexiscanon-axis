'use client';

import { useState, useEffect } from 'react';
import { Button } from "@workspace/design-system";

export function ThemeSwitcher() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(document.documentElement.classList.contains('dark'));
  };

  return (
    <Button 
      size="sm" 
      variant="ghost" 
      onClick={toggleDark}
      className="w-9 h-9 p-0"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </Button>
  );
}

export function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState('neutral');

  const themes = [
    { name: 'neutral', label: 'Neutral', description: 'Clean & balanced' },
    { name: 'gray', label: 'Gray', description: 'Professional & cool' },
    { name: 'stone', label: 'Stone', description: 'Warm & natural' },
    { name: 'slate', label: 'Slate', description: 'Cool slate blue' },
    { name: 'zinc', label: 'Zinc', description: 'Modern & sleek' },
    { name: 'midnight', label: 'Midnight', description: 'Deep & electric' },
    { name: 'opulence', label: 'Opulence', description: 'Luxurious & bold' },
    { name: 'heirloom', label: 'Heirloom', description: 'Classic & timeless' },
    { name: 'zenith', label: 'Zenith', description: 'Content-first' },
  ];

  const selectTheme = (themeName: string) => {
    document.documentElement.dataset.theme = themeName;
    setCurrentTheme(themeName);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
      {themes.map((theme) => (
        <button
          key={theme.name}
          onClick={() => selectTheme(theme.name)}
          className={`p-4 rounded-lg border text-left transition-all hover:scale-105 ${
            currentTheme === theme.name
              ? 'bg-primary text-primary-foreground border-primary shadow-lg'
              : 'bg-card hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          <div className="font-medium">{theme.label}</div>
          <div className={`text-xs mt-1 ${
            currentTheme === theme.name ? 'opacity-90' : 'text-muted-foreground'
          }`}>
            {theme.description}
          </div>
        </button>
      ))}
    </div>
  );
}

export function AccentSwitcher() {
  const [currentAccent, setCurrentAccent] = useState('');

  const accents = [
    { name: 'rose', color: 'bg-rose-500', label: 'Rose' },
    { name: 'orange', color: 'bg-orange-500', label: 'Orange' },
    { name: 'amber', color: 'bg-amber-500', label: 'Amber' },
    { name: 'emerald', color: 'bg-emerald-500', label: 'Emerald' },
    { name: 'cyan', color: 'bg-cyan-500', label: 'Cyan' },
    { name: 'blue', color: 'bg-blue-500', label: 'Blue' },
    { name: 'violet', color: 'bg-violet-500', label: 'Violet' },
    { name: 'fuchsia', color: 'bg-fuchsia-500', label: 'Fuchsia' },
  ];

  const selectAccent = (accentName: string) => {
    document.documentElement.dataset.accent = accentName;
    setCurrentAccent(accentName);
  };

  return (
    <div className="flex gap-3 flex-wrap">
      {accents.map((accent) => (
        <button
          key={accent.name}
          onClick={() => selectAccent(accent.name)}
          className={`group flex items-center gap-2 px-4 py-2 rounded-lg border transition-all hover:scale-105 ${
            currentAccent === accent.name
              ? 'bg-primary text-primary-foreground border-primary shadow-lg'
              : 'bg-card hover:bg-accent'
          }`}
        >
          <div className={`w-4 h-4 rounded-full ${accent.color} ring-2 ring-offset-2 ${
            currentAccent === accent.name ? 'ring-primary-foreground' : 'ring-transparent'
          }`}></div>
          <span className="text-sm font-medium">{accent.label}</span>
        </button>
      ))}
    </div>
  );
}
