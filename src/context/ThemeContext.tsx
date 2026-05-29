import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeName = 'cyan' | 'purple' | 'green' | 'blue' | 'orange';

export interface ThemeTokens {
  primary: string;
  secondary: string;
  accent: string;
}

const THEMES: Record<ThemeName, ThemeTokens> = {
  cyan: {
    primary: '#00f5ff',
    secondary: '#ff006e',
    accent: '#0080ff',
  },
  purple: {
    primary: '#b537f2',
    secondary: '#00f5ff',
    accent: '#ff6b35',
  },
  green: {
    primary: '#00ff41',
    secondary: '#ff6b35',
    accent: '#0080ff',
  },
  blue: {
    primary: '#0080ff',
    secondary: '#ffe600',
    accent: '#ff006e',
  },
  orange: {
    primary: '#ff6b35',
    secondary: '#b537f2',
    accent: '#00f5ff',
  },
};

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (name: ThemeName) => void;
  tokens: ThemeTokens;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeName>('cyan');

  useEffect(() => {
    const saved = localStorage.getItem('ftc-theme') as ThemeName | null;
    if (saved && saved in THEMES) {
      setThemeState(saved);
      applyTheme(saved);
    } else {
      applyTheme('cyan');
    }
  }, []);

  const setTheme = (name: ThemeName) => {
    setThemeState(name);
    localStorage.setItem('ftc-theme', name);
    applyTheme(name);
  };

  const applyTheme = (name: ThemeName) => {
    const t = THEMES[name];
    const root = document.documentElement;
    root.style.setProperty('--neon-primary', t.primary);
    root.style.setProperty('--neon-secondary', t.secondary);
    root.style.setProperty('--neon-accent', t.accent);
    root.setAttribute('data-theme', name);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, tokens: THEMES[theme] }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
