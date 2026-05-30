import React from 'react';
import MatchRow from './MatchCard';
import { PredictedMatch } from '../types';
import { ViewMode } from './EventView';

interface MatchListProps {
  matches: PredictedMatch[];
  viewMode: ViewMode;
  teamOPRs: Map<number, number>;
}

const exportBtnStyle: React.CSSProperties = {
  fontSize: '11px',
  padding: '4px 10px',
  background: 'transparent',
  border: '1px solid var(--neon-green)',
  color: 'var(--neon-green)',
  borderRadius: '6px',
  cursor: 'pointer',
  fontFamily: 'inherit',
  marginLeft: 'auto',
  flexShrink: 0,
};

const MatchList: React.FC<MatchListProps> = ({ matches, viewMode, teamOPRs }) => {
  if (matches.length === 0) {
    return (
      <div className="match-list-wrap">
        <p className="no-data-msg">No qualification matches found for this event.</p>
      </div>
    );
  }

  const exportToCSV = () => {
    const header = ['Match', 'Red 1', 'Red 2', 'Blue 1', 'Blue 2', 'Red Score', 'Blue Score', 'Red OPR Pred', 'Blue OPR Pred', 'Predicted Winner', 'Accuracy'];
    const rows = matches.map(m => [
      `Q${m.matchNum}`,
      m.redTeams[0] ?? '',
      m.redTeams[1] ?? '',
      m.blueTeams[0] ?? '',
      m.blueTeams[1] ?? '',
      m.actualRedScore ?? '',
      m.actualBlueScore ?? '',
      m.redPredictedScore.toFixed(0),
      m.bluePredictedScore.toFixed(0),
      m.predictedWinner,
      !m.hasBeenPlayed ? 'N/A' : m.predictedWinner === m.actualWinner ? 'Correct' : 'Wrong',
    ]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'matches.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="match-list-wrap">
      <div className="match-list-header">
        <h3 className="panel-title">
          {viewMode === 'predicted' ? '🔮 Match Predictions' : '📊 Match Results'}
        </h3>
        <p className="match-list-hint">
          OPR Pred blends each team's current event OPR with their season-best prior OPR.
        </p>
        <button onClick={exportToCSV} style={exportBtnStyle}>⬇ Export CSV</button>
      </div>

      <div className="match-table-scroll">
        <table className="match-table">
          <thead>
            <tr className="mth">
              <th className="th-match">Match</th>
              <th colSpan={2} className="th-alliance th-red">Red Alliance</th>
              <th className="th-vs" />
              <th colSpan={2} className="th-alliance th-blue">Blue Alliance</th>
              <th className="th-scores">Scores</th>
              <th className="th-pred">OPR Pred</th>
              <th className="th-win">Win Pred</th>
              <th className="th-acc">Acc</th>
            </tr>
          </thead>
          <tbody>
            {matches.map(m => (
              <MatchRow
                key={m.matchNum}
                match={m}
                viewMode={viewMode}
                teamOPRs={teamOPRs}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MatchList;
