import React from 'react';
import MatchRow from './MatchCard';
import { PredictedMatch } from '../types';
import { ViewMode } from './EventView';

interface MatchListProps {
  matches: PredictedMatch[];
  viewMode: ViewMode;
  teamOPRs: Map<number, number>;
}

const MatchList: React.FC<MatchListProps> = ({ matches, viewMode, teamOPRs }) => {
  if (matches.length === 0) {
    return (
      <div className="match-list-wrap">
        <p className="no-data-msg">No qualification matches found for this event.</p>
      </div>
    );
  }

  return (
    <div className="match-list-wrap">
      <div className="match-list-header">
        <h3 className="panel-title">
          {viewMode === 'predicted' ? '🔮 Match Predictions' : '📊 Match Results'}
        </h3>
        <p className="match-list-hint">
          OPR Pred blends each team's current event OPR with their season-best prior OPR.
        </p>
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
