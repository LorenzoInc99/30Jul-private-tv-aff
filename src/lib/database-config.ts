// Database configuration and constants for the new schema

// Match status mappings (adjust these based on your actual state_id values)
export const MATCH_STATUS_MAP: { [key: number]: string } = {
  1: 'Scheduled',
  2: 'Live',
  3: 'Finished',
  4: 'Postponed',
  5: 'Cancelled',
  6: 'Suspended',
  7: 'Abandoned',
  8: 'Not Started',
  9: 'First Half',
  10: 'Half Time',
  11: 'Second Half',
  12: 'Extra Time',
  13: 'Penalty In Progress',
  14: 'Break Time',
  15: 'Match Suspended',
  16: 'Match Interrupted',
  17: 'Match Postponed',
  18: 'Match Cancelled',
  19: 'Match Abandoned',
  20: 'Technical Loss',
  21: 'Walkover',
  22: 'Live Extra Time',
  23: 'Match Finished',
  24: 'After Penalties',
  25: 'After Extra Time'
};

// Reverse mapping for status to state_id
export const STATUS_TO_STATE_ID: { [key: string]: number } = {
  'Scheduled': 1,
  'Live': 2,
  'Finished': 3,
  'Postponed': 4,
  'Cancelled': 5,
  'Suspended': 6,
  'Abandoned': 7
};

// Database table names
export const TABLES = {
  FIXTURES: 'fixtures',
  LEAGUES: 'leagues',
  TEAMS: 'teams_new',
  FIXTURE_TV_STATIONS: 'fixturetvstations',
  TV_STATIONS: 'tvstations',
  ODDS: 'odds',
  BOOKMAKERS: 'bookmakers',
  COUNTRIES: 'countries'
} as const;

// Foreign key relationships
export const RELATIONSHIPS = {
  FIXTURES: {
    LEAGUE: 'league_id',
    HOME_TEAM: 'home_team_id',
    AWAY_TEAM: 'away_team_id'
  },
  FIXTURE_TV_STATIONS: {
    FIXTURE: 'fixture_id',
    TV_STATION: 'tvstation_id',
    COUNTRY: 'country_id'
  },
  ODDS: {
    FIXTURE: 'fixture_id',
    BOOKMAKER: 'bookmaker_id'
  }
} as const;

// Default values for missing data
export const DEFAULTS = {
  MATCH_STATUS: 'Scheduled',
  TEAM_SHORT_CODE: null,
  TV_STATION_URL: null,
  BOOKMAKER_URL: null
} as const;

// Validation functions
export function isValidMatchStatus(status: string): boolean {
  return Object.values(STATUS_TO_STATE_ID).includes(STATUS_TO_STATE_ID[status] || 0);
}

export function getMatchStatus(stateId: number): string {
  return MATCH_STATUS_MAP[stateId] || DEFAULTS.MATCH_STATUS;
}

export function getStateId(status: string): number {
  return STATUS_TO_STATE_ID[status] || STATUS_TO_STATE_ID[DEFAULTS.MATCH_STATUS];
}

// Data transformation helpers
export function transformTeamData(team: any) {
  return {
    id: team.id,
    name: team.name,
    short_code: team.short_code || DEFAULTS.TEAM_SHORT_CODE
  };
}

export function transformTvStationData(tvStation: any) {
  return {
    id: tvStation.id,
    name: tvStation.name,
    url: tvStation.url || DEFAULTS.TV_STATION_URL,
    logo_url: tvStation.image_path,
    affiliate_url: tvStation.url || DEFAULTS.TV_STATION_URL
  };
}

export function transformBookmakerData(bookmaker: any) {
  return {
    id: bookmaker.id,
    name: bookmaker.name,
    url: bookmaker.url || DEFAULTS.BOOKMAKER_URL,
    affiliate_url: bookmaker.url || DEFAULTS.BOOKMAKER_URL
  };
} 