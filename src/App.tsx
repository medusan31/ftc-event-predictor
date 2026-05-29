import React, { useState } from 'react';
import EventSearch from './components/EventSearch';
import EventView from './components/EventView';
import ThemeSwitcher from './components/ThemeSwitcher';
import { ThemeProvider } from './context/ThemeContext';
import { EventSearchResult } from './types';
import './styles/neon-theme.css';
import './index.css';

const AppContent: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<EventSearchResult | null>(null);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <span className="header-icon">⚡</span>
          <div className="header-text">
            <h1 className="app-title">FTC EVENT PREDICTOR</h1>
            <p className="app-subtitle">OPR-based match outcome prediction</p>
          </div>
          <ThemeSwitcher />
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
          {' '}· Season OPR used for all predictions
        </p>
      </footer>
    </div>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;
