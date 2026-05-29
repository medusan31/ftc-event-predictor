import React from 'react';

export type Theme = 'neon' | 'synthwave' | 'matrix' | 'amber' | 'ice';

const THEMES: { id: Theme; label: string; color: string }[] = [
  { id: 'neon',      label: 'Neon',      color: '#00f5ff' },
  { id: 'synthwave', label: 'Synthwave', color: '#ff00ff' },
  { id: 'matrix',    label: 'Matrix',    color: '#00ff41' },
  { id: 'amber',     label: 'Amber',     color: '#ffb300' },
  { id: 'ice',       label: 'Ice',       color: '#7dd4fc' },
];

interface ThemePickerProps {
  theme: Theme;
  onChange: (t: Theme) => void;
}

const ThemePicker: React.FC<ThemePickerProps> = ({ theme, onChange }) => (
  <div className="theme-picker">
    {THEMES.map(t => {
      const active = theme === t.id;
      return (
        <button
          key={t.id}
          className={'theme-btn' + (active ? ' theme-btn-active' : '')}
          onClick={() => onChange(t.id)}
          title={t.label}
          style={active ? { borderColor: t.color, color: t.color } : undefined}
        >
          <span
            className="theme-dot"
            style={{ background: t.color, boxShadow: '0 0 5px ' + t.color }}
          />
          {t.label}
        </button>
      );
    })}
  </div>
);

export default ThemePicker;
