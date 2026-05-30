export interface EventSearchResult {
  code: string;
  name: string;
  start: string;
  end: string;
  season: number;
  location: {
    venue?: string;
    city: string;
    state?: string;
    country: string;
  };
  type?: string;
}

export interface MatchTeamAssignment {
  teamNumber: number;
  alliance: string;
  surrogate?: boolean;
  noShow?: boolean;
  dq?: boolean;
}

export interface RawMatch {
  matchNum: number;
  hasBeenPlayed: boolean;
  teams: MatchTeamAssignment[];
  scores?: {
    red?: { totalPoints?: number; total?: number; totalPointsNp?: number };
    blue?: { totalPoints?: number; total?: number; totalPointsNp?: number };
  };
}

export interface RawEventTeamStats {
  rank: number;
  wins: number;
  losses: number;
  ties: number;
  rp: number;
  opr?: { totalPoints?: number; totalPointsNp?: number };
}

export interface RawEventTeam {
  teamNumber: number;
  stats?: RawEventTeamStats | null;
}

export interface ActualRanking {
  teamNumber: number;
  rank: number;
  wins: number;
  losses: number;
  ties: number;
  rp: number;
}

export interface RawEventData {
  code: string;
  name: string;
  start: string;
  end: string;
  finished: boolean;
  location: {
    venue?: string;
    city: string;
    state?: string;
    country: string;
  };
  teams: RawEventTeam[];
  matches: RawMatch[];
}

export interface PredictedMatch {
  matchNum: number;
  redTeams: number[];
  blueTeams: number[];
  surrogateTeams: number[];   // these teams play but result doesn't count for their ranking
  redPredictedScore: number;
  bluePredictedScore: number;
  predictedWinner: 'red' | 'blue' | 'tie';
  actualRedScore?: number;
  actualBlueScore?: number;
  actualWinner?: 'red' | 'blue' | 'tie';
  hasBeenPlayed: boolean;
}

export interface TeamStanding {
  teamNumber: number;
  opr: number;
  predictedWins: number;
  predictedLosses: number;
  predictedTies: number;
  actualWins: number;
  actualLosses: number;
  actualTies: number;
}

// Legacy types kept for backward compatibility
export interface Event {
  id: string;
  name: string;
  location: string;
  date: string;
  matches: Match[];
}

export interface Match {
  id: string;
  redAlliance: Team[];
  blueAlliance: Team[];
  scheduleTime: string;
  redOPR: number;
  blueOPR: number;
}

export interface Team {
  id: string;
  name: string;
  wins: number;
  losses: number;
  opr: number;
  strengthOfVictory: number;
}
