import React from 'react';
import { PredictedMatch } from '../types';
import { ViewMode } from './EventView';

interface MatchRowProps {
  match: PredictedMatch;
  viewMode: ViewMode;
  teamOPRs: Map<number, number>;
}

/** Sigmoid win probability for red alliance (0–100 integer) */
function redWinPct(redOPR: number, blueOPR: number): number {
  if (redOPR + blueOPR < 1) return 50;
  const sigma = Math.max(25, (redOPR + blueOPR) * 0.08);
  return Math.round(100 / (1 + Math.exp(-(redOPR - blueOPR) / sigma)));
}

const MatchRow: React.FC<MatchRowProps> = ({ match, viewMode, teamOPRs }) => {
  const { redTeams, blueTeams, matchNum, hasBeenPlayed } = match;
  const showActual = viewMode === 'actual' && hasBeenPlayed;

  const redOPR  = match.redPredictedScore;
  const blueOPR = match.bluePredictedScore;
  const pct     = redWinPct(redOPR, blueOPR);

  // Determine displayed winner
  const predWinner  = match.predictedWinner;
  const actualWinner = match.actualWinner;

  // Row highlight: winning alliance side gets a glow class
  const rowClass = [
    'mr',
    !hasBeenPlayed ? 'mr-upcoming' : '',
    showActual && actualWinner === 'red'  ? 'mr-actual-red'  : '',
    showActual && actualWinner === 'blue' ? 'mr-actual-blue' : '',
  ].filter(Boolean).join(' ');

  const renderTeam = (num: number, side: 'red' | 'blue', isWinningActual: boolean) => {
    const opr = teamOPRs.get(num) ?? 0;
    return (
      <td key={num} className={`td-team td-${side}${isWinningActual ? ' td-winner' : ''}`}>
        <span className="t-num">{num}</span>
        <span className="t-opr">{opr > 0 ? opr.toFixed(1) : '—'}</span>
      </td>
    );
  };

  const redActualWon  = showActual && actualWinner === 'red';
  const blueActualWon = showActual && actualWinner === 'blue';

  // Pad to 2 teams each side so columns stay consistent
  const redPad  = [...redTeams,  0, 0].slice(0, 2);
  const bluePad = [...blueTeams, 0, 0].slice(0, 2);

  return (
    <tr className={rowClass}>
      {/* Match label */}
      <td className="td-match">
        <span className="match-num-label">Q{matchNum}</span>
        {!hasBeenPlayed && <span className="upcoming-dot" title="Upcoming" />}
      </td>

      {/* Red teams */}
      {redPad.map((num, i) =>
        num
          ? renderTeam(num, 'red', redActualWon)
          : <td key={`rp${i}`} className="td-team td-red td-empty" />
      )}

      {/* Divider */}
      <td className="td-vs">vs</td>

      {/* Blue teams */}
      {bluePad.map((num, i) =>
        num
          ? renderTeam(num, 'blue', blueActualWon)
          : <td key={`bp${i}`} className="td-team td-blue td-empty" />
      )}

      {/* Actual scores */}
      <td className="td-scores">
        {hasBeenPlayed ? (
          <>
            <span className={`score-val sv-red${redActualWon ? ' sv-win' : ''}`}>
              {match.actualRedScore ?? 0}
            </span>
            <span className="score-sep"> / </span>
            <span className={`score-val sv-blue${blueActualWon ? ' sv-win' : ''}`}>
              {match.actualBlueScore ?? 0}
            </span>
          </>
        ) : <span className="score-na">—</span>}
      </td>

      {/* OPR predictions (always shown) */}
      <td className="td-pred">
        <span className={`pred-val pv-red${predWinner === 'red' ? ' pv-win' : ''}`}>
          {redOPR.toFixed(1)}
        </span>
        <span className="score-sep"> / </span>
        <span className={`pred-val pv-blue${predWinner === 'blue' ? ' pv-win' : ''}`}>
          {blueOPR.toFixed(1)}
        </span>
      </td>

      {/* Win prediction */}
      <td className={`td-winpred wp-${predWinner}`}>
        <span className="wp-side">{predWinner === 'tie' ? 'TIE' : predWinner.toUpperCase()}</span>
        {predWinner !== 'tie' && (
          <span className="wp-pct">
            {predWinner === 'red' ? pct : 100 - pct}%
          </span>
        )}
      </td>

      {/* Prediction accuracy */}
      <td className="td-accuracy">
        {!hasBeenPlayed
          ? <span className="acc-na">N/A</span>
          : predWinner === actualWinner
            ? <span className="acc-correct">✓</span>
            : <span className="acc-wrong">✗</span>
        }
      </td>
    </tr>
  );
};

export default MatchRow;
