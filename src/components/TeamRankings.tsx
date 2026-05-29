import React from 'react';
import { ActualRanking, TeamStanding } from '../types';
import { ViewMode } from './EventView';

interface TeamRankingsProps {
  standings: TeamStanding[];
  actualRankings: ActualRanking[];
  viewMode: ViewMode;
}

const RANK_ICONS = ['🥇', '🥈', '🥉'];

const TeamRankings: React.FC<TeamRankingsProps> = ({ standings, actualRankings, viewMode }) => {
  const useActual = viewMode === 'actual' && actualRankings.length > 0;

  if (useActual) {
    return (
      <div className="team-rankings">
        <h3 className="panel-title">📊 Actual Rankings</h3>
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

  const sorted = [...standings].sort((a, b) => {
    if (b.predictedWins !== a.predictedWins) return b.predictedWins - a.predictedWins;
    return b.opr - a.opr;
  });

  return (
    <div className="team-rankings">
      <h3 className="panel-title">🔮 Predicted Rankings</h3>
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
