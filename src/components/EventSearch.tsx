import React, { useState, useEffect, useRef, useCallback } from 'react';
import { searchEvents, searchTeams, SEASONS } from '../services/ftcScoutApi';
import { EventSearchResult } from '../types';
import '../styles/EventSearch.css';

interface EventSearchProps {
  onEventSelect: (event: EventSearchResult) => void;
  onTeamSelect: (teamNumber: number, season: number) => void;
  onSeasonChange?: (season: number) => void;
}

const EventSearch: React.FC<EventSearchProps> = ({ onEventSelect, onTeamSelect, onSeasonChange }) => {
  const [season, setSeason] = useState(SEASONS[0].value);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<EventSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searchMode, setSearchMode] = useState<'event' | 'team'>('event');
  const [teamInput, setTeamInput] = useState('');
  const [teamError, setTeamError] = useState('');
  const [teamSuggestions, setTeamSuggestions] = useState<{ number: number; name: string }[]>([]);
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const teamDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchSuggestions = useCallback(async (q: string, s: number) => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    setLoading(true);
    setSearchError('');
    try {
      const results = await searchEvents(q, s);
      setSuggestions(results);
      setShowDropdown(results.length > 0);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Event search failed:', msg);
      setSearchError(msg);
      setSuggestions([]);
      setShowDropdown(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(query, season), 320);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, season, fetchSuggestions]);

  useEffect(() => {
    if (searchMode !== 'team') return;
    if (teamDebounceRef.current) clearTimeout(teamDebounceRef.current);
    if (teamInput.trim().length < 1) {
      setTeamSuggestions([]);
      setShowTeamDropdown(false);
      return;
    }
    teamDebounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchTeams(teamInput.trim());
        setTeamSuggestions(results);
        setShowTeamDropdown(results.length > 0);
      } catch {
        setTeamSuggestions([]);
        setShowTeamDropdown(false);
      } finally {
        setLoading(false);
      }
    }, 320);
    return () => {
      if (teamDebounceRef.current) clearTimeout(teamDebounceRef.current);
    };
  }, [teamInput, season, searchMode]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const node = e.target;
      if (containerRef.current && node instanceof Node && !containerRef.current.contains(node)) {
        setShowDropdown(false);
        setShowTeamDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectTeam = (t: { number: number; name: string }) => {
    setTeamInput(`${t.number} — ${t.name}`);
    setShowTeamDropdown(false);
    setTeamError('');
    onTeamSelect(t.number, season);
  };

  const handleTeamSearch = () => {
    if (teamSuggestions.length === 1) { selectTeam(teamSuggestions[0]); return; }
    const num = parseInt(teamInput.trim(), 10);
    if (isNaN(num) || num <= 0) {
      setTeamError('Enter a team number or name to search.');
      return;
    }
    setTeamError('');
    onTeamSelect(num, season);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (searchMode === 'team') {
      if (e.key === 'Enter') { e.preventDefault(); handleTeamSearch(); }
      if (e.key === 'Escape') setShowTeamDropdown(false);
      return;
    }
    if (!showDropdown || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      selectEvent(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const switchMode = (mode: 'event' | 'team') => {
    setSearchMode(mode);
    setTeamInput('');
    setTeamError('');
    setQuery('');
    setSuggestions([]);
    setShowDropdown(false);
    setSearchError('');
  };

  const selectEvent = (event: EventSearchResult) => {
    setQuery(event.name);
    setShowDropdown(false);
    setActiveIndex(-1);
    onEventSelect(event);
  };

  const fmtDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      });
    } catch {
      return d;
    }
  };

  const locationStr = (loc: EventSearchResult['location']) =>
    [loc.city, loc.state, loc.country].filter(Boolean).join(', ');

  return (
    <div className="event-search-container neon-card" ref={containerRef}>
      <h2 className="section-title">
        {searchMode === 'event' ? 'Find an Event' : 'Find a Team'}
      </h2>

      <div className="search-controls">
        <div className="year-selector">
          <label htmlFor="season-select">Season</label>
          <select
            id="season-select"
            value={season}
            onChange={e => {
              const s = Number(e.target.value);
              setSeason(s);
              onSeasonChange?.(s);
              setQuery('');
              setSuggestions([]);
              setShowDropdown(false);
              setSearchError('');
            }}
          >
            {SEASONS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="view-toggle-group" style={{ alignSelf: 'flex-end', marginBottom: '2px' }}>
          <button
            className={`view-toggle-btn${searchMode === 'event' ? ' active-predicted' : ''}`}
            onClick={() => switchMode('event')}
          >
            🏆 Event
          </button>
          <button
            className={`view-toggle-btn${searchMode === 'team' ? ' active-team' : ''}`}
            onClick={() => switchMode('team')}
          >
            👤 Team
          </button>
        </div>

        <div className="search-input-wrapper">
          <div className="input-row">
            <span className="search-icon-glyph">⚡</span>
            {searchMode === 'event' ? (
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setActiveIndex(-1); }}
                onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                onKeyDown={handleKeyDown}
                placeholder="Event name or code (e.g. FTCCMP1LOVE)..."
                autoComplete="off"
                spellCheck={false}
              />
            ) : (
              <input
                ref={inputRef}
                type="text"
                value={teamInput}
                onChange={e => { setTeamInput(e.target.value); setTeamError(''); }}
                onKeyDown={handleKeyDown}
                onFocus={() => teamSuggestions.length > 0 && setShowTeamDropdown(true)}
                placeholder="Team number or name (e.g. 30030)..."
                autoComplete="off"
                spellCheck={false}
              />
            )}
            {loading && <span className="spinner-dot" aria-label="Searching" />}
          </div>

          {searchMode === 'team' && showTeamDropdown && teamSuggestions.length > 0 && (
            <ul className="autocomplete-dropdown" role="listbox">
              {teamSuggestions.map(t => (
                <li
                  key={t.number}
                  role="option"
                  aria-selected={false}
                  className="autocomplete-item"
                  onMouseDown={() => selectTeam(t)}
                >
                  <span className="ev-name">#{t.number} — {t.name}</span>
                </li>
              ))}
            </ul>
          )}

          {searchMode === 'event' && showDropdown && (
            <ul className="autocomplete-dropdown" role="listbox">
              {suggestions.map((ev, idx) => (
                <li
                  key={ev.code}
                  role="option"
                  aria-selected={idx === activeIndex}
                  className={`autocomplete-item${idx === activeIndex ? ' active' : ''}`}
                  onMouseDown={() => selectEvent(ev)}
                  onMouseEnter={() => setActiveIndex(idx)}
                >
                  <span className="ev-name">{ev.name}</span>
                  <span className="ev-meta">
                    <span className="ev-location">📍 {locationStr(ev.location)}</span>
                    <span className="ev-date">📅 {fmtDate(ev.start)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}

          {searchMode === 'team' && teamError && (
            <p style={{ color: 'var(--neon-pink)', fontSize: '12px', margin: '6px 0 0' }}>{teamError}</p>
          )}
        </div>
      </div>

      {searchMode === 'event' && searchError && (
        <p className="error-message">Search error: {searchError}</p>
      )}
    </div>
  );
};

export default EventSearch;
