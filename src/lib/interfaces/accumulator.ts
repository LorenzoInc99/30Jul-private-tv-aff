export interface Match {
  id: string;
  home_team: {
    id: number;
    name: string;
    team_logo_url?: string;
  };
  away_team: {
    id: number;
    name: string;
    team_logo_url?: string;
  };
  start_time: string;
  status: string;
  home_score?: number | null;
  away_score?: number | null;
  Odds: any[];
  Event_Broadcasters?: any[];
  Competitions?: {
    id: number;
    name: string;
    league_logo?: string;
    country?: {
      id: number;
      name: string;
    };
  };
  competition?: {
    id: number;
    name: string;
    country?: {
      id: number;
      name: string;
    };
  };
}

export interface Operator {
  id: number;
  name: string;
  url: string;
  logo_url?: string | null;
}

export interface AccumulatorSelection {
  matchId: string;
  match: Match;
  selectedMarket: 'home' | 'draw' | 'away';
  selectedOdds: number;
  operator: Operator;
}

export interface OperatorComparison {
  operator: Operator;
  totalOdds: number;
  selections: AccumulatorSelection[];
  potentialReturn: number;
  ranking: number;
}

export interface BettingMarket {
  id: string;
  name: string;
  outcomes: MarketOutcome[];
}

export interface MarketOutcome {
  id: string;
  label: string;
  odds: OperatorOdds[];
}

export interface OperatorOdds {
  operator: Operator;
  value: number;
  lastUpdated?: string;
}
