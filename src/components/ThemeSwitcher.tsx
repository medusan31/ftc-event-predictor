import React from 'react';
import { useTheme, type ThemeName } from '../context/ThemeContext';

const THEME_LABELS: Record<ThemeName, string> = {
  cyan: '🔷 Cyan',
  purple: '🟣 Purple',
  green: '🟢 Green',
  blue: '🔵 Blue',
  orange: '🟠 Orange',
};

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-switcher">
      {(Object.keys(THEME_LABELS) as ThemeName[]).map((t) => (
        <button
          key={t}
          className={`theme-btn${theme === t ? ' theme-active' : ''}`}
          onClick={() => setTheme(t)}
          title={`Switch to ${THEME_LABELS[t]}`}
        >
          {THEME_LABELS[t]}
        </button>
      ))}
    </div>
  );
};

export default ThemeSwitcher;
