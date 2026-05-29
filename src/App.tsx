import React, { useState } from 'react';
import EventSearch from './components/EventSearch';
import EventView from './components/EventView';
import { EventSearchResult } from './types';
import './styles/neon-theme.css';
import './index.css';

const App: React.FC = () => {
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

export default App;
