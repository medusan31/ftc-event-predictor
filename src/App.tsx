import React, { useState, useEffect } from 'react';
import EventSearch from './components/EventSearch';
import EventView from './components/EventView';
import ThemePicker, { Theme } from './components/ThemePicker';
import { EventSearchResult } from './types';
import './styles/neon-theme.css';
import './styles/themes.css';
import './index.css';

const App: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<EventSearchResult | null>(null);
  const [theme, setTheme] = useState<Theme>('neon');

  useEffect(() => {
    if (theme === 'neon') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <span className="header-icon">&#9889;</span>
          <div className="header-text">
            <h1 className="app-title">FTC EVENT PREDICTOR</h1>
            <p className="app-subtitle">OPR-based match outcome prediction</p>
          </div>
          <ThemePicker theme={theme} onChange={setTheme} />
        </div>
      </header>

      <main className="main-content">
        <EventSearch onEventSelect={setSelectedEvent} />

        {selectedEvent && (
          <EventView
            key={`${selectedEvent.code}-${selectedEvent.season}`}
            eventCode={selectedEvent.code}
            season={selectedEvent.season}
            eventName={selectedEvent.name}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>
          Data from{' '}
          <span className="neon-text-cyan">FTCScout</span>
          {' '}&middot; Season OPR used for all predictions
        </p>
        <p style={{ marginTop: '6px', fontSize: '12px', opacity: 0.6 }}>
          Inspired by{' '}
          <span className="neon-text-cyan">FRC Statbotics</span>
        </p>
      </footer>
    </div>
  );
};

export default App;

