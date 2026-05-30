import React from 'react';
import { ActualRanking, TeamStanding } from '../types';
import { ViewMode } from './EventView';

interface TeamRankingsProps {
  standings: TeamStanding[];
  actualRankings: ActualRanking[];
  viewMode: ViewMode;
}

const RANK_ICONS = ['🥇', '🥈', '🥉'];

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

const downloadCSV = (csv: string, filename: string) => {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const TeamRankings: React.FC<TeamRankingsProps> = ({ standings, actualRankings, viewMode }) => {
  const useActual = viewMode === 'actual' && actualRankings.length > 0;

  const sorted = [...standings].sort((a, b) => {
    if (b.predictedWins !== a.predictedWins) return b.predictedWins - a.predictedWins;
    return b.opr - a.opr;
  });

  const exportToCSV = () => {
    const header = ['Rank', 'Team', 'W', 'L', 'T', 'AOPR'];
    const dataRows = useActual
      ? actualRankings.map((t, i) => [i + 1, t.teamNumber, t.wins, t.losses, t.ties, t.rp.toFixed(2)])
      : sorted.map((t, i) => [i + 1, t.teamNumber, t.predictedWins, t.predictedLosses, t.predictedTies, t.opr.toFixed(1)]);
    const csv = [header, ...dataRows].map(r => r.join(',')).join('\n');
    downloadCSV(csv, useActual ? 'actual-rankings.csv' : 'predicted-rankings.csv');
  };

  if (useActual) {
    return (
      <div className="team-rankings">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <h3 className="panel-title" style={{ margin: 0 }}>📊 Actual Rankings</h3>
          <button onClick={exportToCSV} style={exportBtnStyle}>⬇ Export CSV</button>
        </div>
        <div className="rankings-scroll">
          <table className="rankings-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Team</th>
                <th>W</th>
                <th>L</th>
                <th>T</th>
                <th>AOPR</th>
              </tr>
            </thead>
            <tbody>
              {actualRankings.map((team, idx) => (
                <tr key={team.teamNumber} className={idx < 3 ? `top-row rank-${idx + 1}` : ''}>
                  <td className="cell-rank">
                    {idx < 3 ? RANK_ICONS[idx] : team.rank}
                  </td>
                  <td className="cell-team">#{team.teamNumber}</td>
                  <td className="cell-w">{team.wins}</td>
                  <td className="cell-l">{team.losses}</td>
                  <td className="cell-t">{team.ties}</td>
                  <td className="cell-opr">{team.rp.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="team-rankings">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <h3 className="panel-title" style={{ margin: 0 }}>🔮 Predicted Rankings</h3>
        <button onClick={exportToCSV} style={exportBtnStyle}>⬇ Export CSV</button>
      </div>
      <div className="rankings-scroll">
        <table className="rankings-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Team</th>
              <th>W</th>
              <th>L</th>
              <th>T</th>
              <th>AOPR</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((team, idx) => (
              <tr key={team.teamNumber} className={idx < 3 ? `top-row rank-${idx + 1}` : ''}>
                <td className="cell-rank">
                  {idx < 3 ? RANK_ICONS[idx] : idx + 1}
                </td>
                <td className="cell-team">#{team.teamNumber}</td>
                <td className="cell-w">{team.predictedWins}</td>
                <td className="cell-l">{team.predictedLosses}</td>
                <td className="cell-t">{team.predictedTies}</td>
                <td className="cell-opr">{team.opr.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeamRankings;
