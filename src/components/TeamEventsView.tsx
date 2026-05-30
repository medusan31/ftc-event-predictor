import React, { useEffect, useState } from 'react';
import { getTeamEvents, TeamEventsResult } from '../services/ftcScoutApi';
import { EventSearchResult } from '../types';

interface TeamEventsViewProps {
  teamNumber: number;
  season: number;
  onEventSelect: (event: EventSearchResult) => void;
  onBack: () => void;
}

const fmtDate = (d: string) => {
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return d;
  }
};

const locationStr = (loc: EventSearchResult['location']) =>
  [loc.city, loc.state, loc.country].filter(Boolean).join(', ');

const backBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid var(--neon-cyan)',
  color: 'var(--neon-cyan)',
  borderRadius: '6px',
  padding: '4px 12px',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: '12px',
  flexShrink: 0,
};

const TeamEventsView: React.FC<TeamEventsViewProps> = ({ teamNumber, season, onEventSelect, onBack }) => {
  const [result, setResult] = useState<TeamEventsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setResult(null);
    getTeamEvents(teamNumber, season)
      .then(setResult)
      .catch(err => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, [teamNumber, season]);

  const seasonLabel = `${season}–${season + 1}`;
  const now = Date.now();

  const statusBadge = (ev: EventSearchResult) => {
    const start = new Date(ev.start).getTime();
    const end = new Date(ev.end).getTime();
    if (start <= now && end >= now) return <span style={{ color: 'var(--neon-pink)', fontSize: '11px' }}>● LIVE</span>;
    if (start > now)               return <span style={{ color: 'var(--neon-yellow)', fontSize: '11px' }}>Upcoming</span>;
    return                                <span style={{ color: 'var(--neon-green)', fontSize: '11px' }}>Completed</span>;
  };

  const ftcScoutUrl = `https://ftcscout.org/teams/${teamNumber}`;

  return (
    <div className="event-search-container neon-card" style={{ marginTop: '24px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <button onClick={onBack} style={backBtnStyle}>← Back</button>
        <div>
          <h2 className="section-title" style={{ margin: 0 }}>
            #{teamNumber}{result ? ` — ${result.teamName}` : ''}
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-dim)' }}>{seasonLabel}</p>
        </div>
        <a
          href={ftcScoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginLeft: 'auto',
            fontSize: '11px',
            color: 'var(--neon-cyan)',
            border: '1px solid var(--neon-cyan)',
            borderRadius: '6px',
            padding: '4px 10px',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          FTCScout ↗
        </a>
      </div>

      {/* Season best OPR stat */}
      {result && result.seasonBestOPR > 0 && (
        <div style={{
          display: 'inline-block',
          background: 'rgba(0,245,255,.07)',
          border: '1px solid var(--border-dim)',
          borderRadius: '8px',
          padding: '6px 14px',
          marginBottom: '16px',
          fontSize: '13px',
        }}>
          <span style={{ color: 'var(--text-dim)' }}>Season Best OPR </span>
          <span style={{ color: 'var(--neon-cyan)', fontWeight: 700 }}>
            {result.seasonBestOPR.toFixed(1)}
          </span>
        </div>
      )}

      {loading && <p style={{ color: 'var(--text-dim)', margin: 0 }}>Loading events...</p>}
      {error   && <p className="error-message">Failed to load: {error}</p>}

      {!loading && !error && result && result.events.length === 0 && (
        <p style={{ color: 'var(--text-dim)', margin: 0 }}>No events found for this team in {seasonLabel}.</p>
      )}

      {!loading && !error && result && result.events.length > 0 && (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {result.events.map(ev => (
            <li
              key={ev.code}
              className="autocomplete-item"
              onClick={() => onEventSelect(ev)}
              style={{ borderRadius: '8px', marginBottom: '4px', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="ev-name">{ev.name}</span>
                {statusBadge(ev)}
              </div>
              <span className="ev-meta">
                <span className="ev-location">📍 {locationStr(ev.location)}</span>
                <span className="ev-date">📅 {fmtDate(ev.start)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TeamEventsView;
