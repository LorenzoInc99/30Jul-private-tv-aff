// Database configuration and constants for the new schema

// Match status mappings - OFFICIAL SPORTMONKS API MAPPINGS
export const MATCH_STATUS_MAP: { [key: number]: string } = {
  1: 'Not Started',
  2: '1st Half',
  3: 'Half Time',
  4: 'Break',
  5: 'Full Time',
  6: 'Extra Time',
  7: 'After Extra Time',
  8: 'After Penalties',
  9: 'Penalties',
  10: 'Postponed',
  11: 'Suspended',
  12: 'Cancelled',
  13: 'To Be Announced',
  14: 'Walk Over',
  15: 'Abandoned',
  16: 'Delayed',
  17: 'Awarded',
  18: 'Interrupted',
  19: 'Awaiting Updates',
  20: 'Deleted',
  21: 'Extra Time - Break',
  22: '2nd Half',
  23: 'ET - 2nd Half',
  25: 'Penalties - Break',
  26: 'Pending'
};

// Reverse mapping for status to state_id
export const STATUS_TO_STATE_ID: { [key: string]: number } = {
  'Not Started': 1,
  '1st Half': 2,
  'Half Time': 3,
  'Break': 4,
  'Full Time': 5,
  'Extra Time': 6,
  'After Extra Time': 7,
  'After Penalties': 8,
  'Penalties': 9,
  'Postponed': 10,
  'Suspended': 11,
  'Cancelled': 12,
  'To Be Announced': 13,
  'Walk Over': 14,
  'Abandoned': 15,
  'Delayed': 16,
  'Awarded': 17,
  'Interrupted': 18,
  'Awaiting Updates': 19,
  'Deleted': 20,
  'Extra Time - Break': 21,
  '2nd Half': 22,
  'ET - 2nd Half': 23,
  'Penalties - Break': 25,
  'Pending': 26
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
    short_code: team.short_code || DEFAULTS.TEAM_SHORT_CODE,
    team_logo_url: team.team_logo_url || null
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