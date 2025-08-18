// Define what any sports data provider must implement
export interface SportsDataProvider {
  getMatchesForDate(date: Date): Promise<NormalizedMatch[]>;
  getMatchById(id: string): Promise<NormalizedMatch | null>;
  getTeamById(id: string): Promise<NormalizedTeam | null>;
  getLeagueById(id: string): Promise<NormalizedLeague | null>;
}

// Standard data models (API-agnostic)
export interface NormalizedMatch {
  id: string;
  title: string;
  startTime: string;
  homeTeam: NormalizedTeam;
  awayTeam: NormalizedTeam;
  competition: NormalizedLeague;
  status: string;
  scores?: {
    home: number;
    away: number;
  };
  hasOdds: boolean;
  hasTvInfo: boolean;
}

export interface NormalizedTeam {
  id: string;
  name: string;
  shortName?: string;
  logoUrl?: string;
  country?: string;
}

export interface NormalizedLeague {
  id: string;
  name: string;
  country?: string;
  logoUrl?: string;
}

