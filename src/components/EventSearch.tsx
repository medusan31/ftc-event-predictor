import React, { useState, useEffect, useRef, useCallback } from 'react';
import { searchEvents, SEASONS } from '../services/ftcScoutApi';
import { EventSearchResult } from '../types';
import '../styles/EventSearch.css';

interface EventSearchProps {
  onEventSelect: (event: EventSearchResult) => void;
}

const EventSearch: React.FC<EventSearchProps> = ({ onEventSelect }) => {
  const [season, setSeason] = useState(SEASONS[0].value);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<EventSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    const handler = (e: MouseEvent) => {
      const node = e.target;
      if (containerRef.current && node instanceof Node && !containerRef.current.contains(node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
      <h2 className="section-title">Find an Event</h2>

      <div className="search-controls">
        <div className="year-selector">
          <label htmlFor="season-select">Season</label>
          <select
            id="season-select"
            value={season}
            onChange={e => {
              setSeason(Number(e.target.value));
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

        <div className="search-input-wrapper">
          <div className="input-row">
            <span className="search-icon-glyph">⚡</span>
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
            {loading && <span className="spinner-dot" aria-label="Searching" />}
          </div>

          {showDropdown && (
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
        </div>
      </div>

      {searchError && (
        <p className="error-message">Search error: {searchError}</p>
      )}
    </div>
  );
};

export default EventSearch;
