import React, { useEffect, useState, useMemo } from 'react';
import {
  getEventDetails,
  loadTeamBestOPRs,
  extractScore,
  getTeamAlliance,
} from '../services/ftcScoutApi';
import { ActualRanking, PredictedMatch, RawEventData, TeamStanding } from '../types';
import MatchList from './MatchList';
import TeamRankings from './TeamRankings';

interface EventViewProps {
  eventCode: string;
  season: number;
  eventName: string;
}

export type ViewMode = 'predicted' | 'actual';

const EventView: React.FC<EventViewProps> = ({ eventCode, season }) => {
  const [eventData, setEventData] = useState<RawEventData | null>(null);
  const [teamOPRs, setTeamOPRs] = useState<Map<number, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [loadingOPRs, setLoadingOPRs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('predicted');

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      setEventData(null);
      setTeamOPRs(new Map());

      try {
        const data = await getEventDetails(eventCode, season);
        if (cancelled) return;
        setEventData(data);
        setLoading(false);

        // Collect all unique team numbers from matches
        const teamNums = new Set<number>();
        for (const m of data.matches ?? []) {
          for (const t of m.teams ?? []) teamNums.add(t.teamNumber);
        }

        // Build current-event OPR map from team stats
        const currentEventOPRs = new Map<number, number>();
        for (const t of data.teams ?? []) {
          const opr = t.stats?.opr?.totalPoints;
          if (typeof opr === 'number' && opr > 0) {
            currentEventOPRs.set(t.teamNumber, opr);
          }
        }

        setLoadingOPRs(true);
        const best = await loadTeamBestOPRs(Array.from(teamNums), season, data.start, currentEventOPRs);
        if (cancelled) return;
        setTeamOPRs(best);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load event');
          setLoading(false);
        }
      } finally {
        if (!cancelled) setLoadingOPRs(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [eventCode, season]);

  const qualMatches = useMemo(() => {
    if (!eventData?.matches) return [];
    return [...eventData.matches]
      .filter((m: any) => !m.tournamentLevel || m.tournamentLevel === 'Quals')
      .sort((a, b) => a.matchNum - b.matchNum);
  }, [eventData]);

  const predictedMatches = useMemo((): PredictedMatch[] =>
    qualMatches.map(match => {
      const redTeams = match.teams
        .filter(t => getTeamAlliance(t.alliance) === 'red')
        .map(t => t.teamNumber);
      const blueTeams = match.teams
        .filter(t => getTeamAlliance(t.alliance) === 'blue')
        .map(t => t.teamNumber);
      const surrogateTeams = match.teams
        .filter(t => t.surrogate)
        .map(t => t.teamNumber);

      const redOPR = redTeams.reduce((s, n) => s + (teamOPRs.get(n) ?? 0), 0);
      const blueOPR = blueTeams.reduce((s, n) => s + (teamOPRs.get(n) ?? 0), 0);
      const diff = redOPR - blueOPR;

      const predictedWinner: 'red' | 'blue' | 'tie' =
        Math.abs(diff) < 0.5 ? 'tie' : diff > 0 ? 'red' : 'blue';

      const actualRed = extractScore(match.scores?.red);
      const actualBlue = extractScore(match.scores?.blue);
      let actualWinner: 'red' | 'blue' | 'tie' | undefined;
      if (match.hasBeenPlayed) {
        actualWinner = actualRed > actualBlue ? 'red'
          : actualBlue > actualRed ? 'blue' : 'tie';
      }

      return {
        matchNum: match.matchNum,
        redTeams,
        blueTeams,
        surrogateTeams,
        redPredictedScore: redOPR,
        bluePredictedScore: blueOPR,
        predictedWinner,
        actualRedScore: match.hasBeenPlayed ? actualRed : undefined,
        actualBlueScore: match.hasBeenPlayed ? actualBlue : undefined,
        actualWinner,
        hasBeenPlayed: match.hasBeenPlayed,
      };
    }),
    [qualMatches, teamOPRs]
  );

  const teamStandings = useMemo((): TeamStanding[] => {
    const map = new Map<number, TeamStanding>();

    const ensureTeam = (num: number): TeamStanding => {
      if (!map.has(num)) {
        map.set(num, {
          teamNumber: num,
          opr: teamOPRs.get(num) || 0,
          predictedWins: 0, predictedLosses: 0, predictedTies: 0,
          actualWins: 0, actualLosses: 0, actualTies: 0,
        });
      }
      const standing = map.get(num);
      if (standing) return standing;
      return { teamNumber: num, opr: 0, predictedWins: 0, predictedLosses: 0, predictedTies: 0, actualWins: 0, actualLosses: 0, actualTies: 0 };
    };

    for (const m of predictedMatches) {
      const isSurrogate = (num: number) => m.surrogateTeams.includes(num);

      for (const t of m.redTeams) {
        ensureTeam(t); // ensure entry exists even for surrogates
        if (isSurrogate(t)) continue;
        const s = ensureTeam(t);
        if (m.predictedWinner === 'red') s.predictedWins++;
        else if (m.predictedWinner === 'blue') s.predictedLosses++;
        else s.predictedTies++;
      }
      for (const t of m.blueTeams) {
        ensureTeam(t);
        if (isSurrogate(t)) continue;
        const s = ensureTeam(t);
        if (m.predictedWinner === 'blue') s.predictedWins++;
        else if (m.predictedWinner === 'red') s.predictedLosses++;
        else s.predictedTies++;
      }

      if (m.hasBeenPlayed && m.actualWinner) {
        for (const t of m.redTeams) {
          if (isSurrogate(t)) continue;
          const s = ensureTeam(t);
          if (m.actualWinner === 'red') s.actualWins++;
          else if (m.actualWinner === 'blue') s.actualLosses++;
          else s.actualTies++;
        }
        for (const t of m.blueTeams) {
          if (isSurrogate(t)) continue;
          const s = ensureTeam(t);
          if (m.actualWinner === 'blue') s.actualWins++;
          else if (m.actualWinner === 'red') s.actualLosses++;
          else s.actualTies++;
        }
      }
    }

    return Array.from(map.values());
  }, [predictedMatches, teamOPRs]);

  // Actual qual rankings directly from FTCScout team stats (rank, W/L/T, RP)
  const actualRankings = useMemo((): ActualRanking[] => {
    if (!eventData?.teams) return [];
    const ranked: ActualRanking[] = [];
    for (const t of eventData.teams) {
      const s = t.stats;
      if (s && s.rank != null) {
        ranked.push({
          teamNumber: t.teamNumber,
          rank: s.rank,
          wins: s.wins,
          losses: s.losses,
          ties: s.ties,
          rp: s.rp,
        });
      }
    }
    return ranked.sort((a, b) => a.rank - b.rank);
  }, [eventData]);

  const hasResults = eventData?.finished || predictedMatches.some(m => m.hasBeenPlayed);

  const accuracy = useMemo(() => {
    const played = predictedMatches.filter(m => m.hasBeenPlayed);
    if (played.length === 0) return null;
    const correct = played.filter(m => m.predictedWinner === m.actualWinner).length;
    return { correct, total: played.length, pct: Math.round((correct / played.length) * 100) };
  }, [predictedMatches]);

  const fmtDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      });
    } catch { return d; }
  };

  if (loading) {
    return (
      <div className="event-view neon-card loading-card">
        <div className="loading-ring" />
        <p className="loading-label">Loading event data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="event-view neon-card error-card">
        <h3 className="neon-text-pink">⚠ Could not load event</h3>
        <p className="error-detail">{error}</p>
      </div>
    );
  }

  if (!eventData) return null;

  const loc = eventData.location;
  const locStr = [loc.venue, loc.city, loc.state, loc.country].filter(Boolean).join(', ');

  return (
    <div className="event-view">
      <div className="event-header neon-card">
        <div className="event-header-inner">
          <div className="event-info-block">
            <h2 className="event-title">{eventData.name}</h2>
            <div className="event-meta-row">
              {locStr && <span>📍 {locStr}</span>}
              <span>📅 {fmtDate(eventData.start)} – {fmtDate(eventData.end)}</span>
              <span>🏆 {qualMatches.length} qual match{qualMatches.length !== 1 ? 'es' : ''}</span>
              {accuracy && (
                <span className="accuracy-badge">
                  🎯 {accuracy.pct}% accurate ({accuracy.correct}/{accuracy.total} matches)
                </span>
              )}
              {loadingOPRs && (
                <span className="opr-loading-badge">⏳ Fetching season OPRs…</span>
              )}
            </div>
          </div>

          {hasResults && (
            <div className="view-toggle-group">
              <button
                className={`view-toggle-btn${viewMode === 'predicted' ? ' active-predicted' : ''}`}
                onClick={() => setViewMode('predicted')}
              >
                🔮 Predicted
              </button>
              <button
                className={`view-toggle-btn${viewMode === 'actual' ? ' active-actual' : ''}`}
                onClick={() => setViewMode('actual')}
              >
                📊 Actual
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="event-content-grid">
        <section className="rankings-panel">
          <TeamRankings standings={teamStandings} actualRankings={actualRankings} viewMode={viewMode} />
        </section>
        <section className="matches-panel">
          <MatchList matches={predictedMatches} viewMode={viewMode} teamOPRs={teamOPRs} />
        </section>
      </div>
    </div>
  );
};

export default EventView;
