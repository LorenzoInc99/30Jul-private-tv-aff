import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge class names with Tailwind CSS
 * Combines clsx and tailwind-merge for optimal class handling
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency values
 */
export function formatCurrency(amount: number, currency = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format odds to 2 decimal places
 */
export function formatOdds(odds: number): string {
  return odds.toFixed(2);
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * Capitalize first letter of string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// List of league IDs that are known to have dark logos that need white backgrounds
const DARK_LOGO_LEAGUES = new Set([
  8,   // Premier League
  564, // La Liga
  82,  // Bundesliga
  384, // Serie A
  301, // Ligue 1
  9,   // Championship
  24,  // League One
  27,  // League Two
  72,  // Eredivisie
  208, // Pro League
  271, // Superliga
  387, // Serie B
  390, // Coppa Italia
  444, // Norway
  462, // Liga Portugal
  501, // Scotland
  570, // Copa Del Rey
  600, // Super Lig
]);

export function needsWhiteBackground(leagueId: number): boolean {
  return DARK_LOGO_LEAGUES.has(leagueId);
}

export function getLeagueLogoClassName(leagueId: number, baseClassName: string = ''): string {
  // Special case for Premier League (ID: 8) - needs white background due to purple logo
  if (leagueId === 8) {
    return `${baseClassName} object-contain bg-white rounded-sm p-1 border border-gray-200 dark:border-gray-600`.trim();
  }
  
  // All other leagues get clean styling without background
  return `${baseClassName} object-contain`.trim();
} 

/**
 * Creates a clean URL slug without hyphens
 * Example: "FC København" -> "fckobenhavn"
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD') // Normalize unicode characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (accents, umlauts, etc.)
    .replace(/ø/g, 'o') // Replace ø with o
    .replace(/ö/g, 'o') // Replace ö with o
    .replace(/ü/g, 'u') // Replace ü with u
    .replace(/ä/g, 'a') // Replace ä with a
    .replace(/ß/g, 'ss') // Replace ß with ss
    .replace(/æ/g, 'ae') // Replace æ with ae
    .replace(/å/g, 'aa') // Replace å with aa
    .replace(/[^a-z0-9]/g, '') // Remove all non-alphanumeric characters (no hyphens)
    .trim();
}

/**
 * Gets the correct URL slug for a team name
 * This helps users understand the correct format
 */
export function getTeamUrlSlug(teamName: string): string {
  return slugify(teamName);
}

/**
 * Suggests the correct URL for a team based on common typos
 */
export function suggestTeamUrl(teamName: string): string {
  const suggestions: { [key: string]: string } = {
    'fckbenhavn': 'fckobenhavn', // FC København
    'fckobenhavn': 'fckobenhavn', // FC København (correct)
    'malm': 'malmo', // Malmö
    'malmo': 'malmo', // Malmö (correct)
    'goteborg': 'goteborg', // Göteborg
    'manchesterunited': 'manchesterunited', // Manchester United
    'realmadrid': 'realmadrid', // Real Madrid
  };
  
  const normalized = teamName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return suggestions[normalized] || normalized;
}

/**
 * Legacy slugify function that uses hyphens (for backward compatibility)
 * Example: "FC København" -> "fc-kobenhavn"
 */
export function slugifyWithHyphens(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD') // Normalize unicode characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (accents, umlauts, etc.)
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * League qualification rules for different competitions
 * Defines Champions League, Europa League, Conference League, and Relegation spots
 */
interface LeagueQualificationRules {
  championsLeague: number[]; // Positions that qualify for Champions League
  europaLeague: number[];    // Positions that qualify for Europa League
  conferenceLeague: number[]; // Positions that qualify for Conference League
  relegation: number[];      // Positions that get relegated
  totalTeams: number;        // Total number of teams in the league
}

const LEAGUE_QUALIFICATION_RULES: Record<number, LeagueQualificationRules> = {
  // Premier League (England) - 20 teams
  8: {
    championsLeague: [1, 2, 3, 4], // Top 4
    europaLeague: [5], // 5th place
    conferenceLeague: [6], // 6th place (or FA Cup winner)
    relegation: [18, 19, 20], // Bottom 3
    totalTeams: 20
  },
  
  
  // La Liga (Spain) - 20 teams
  564: {
    championsLeague: [1, 2, 3, 4], // Top 4
    europaLeague: [5], // 5th place
    conferenceLeague: [6], // 6th place (or Copa del Rey winner)
    relegation: [18, 19, 20], // Bottom 3
    totalTeams: 20
  },
  
  // Bundesliga (Germany) - 18 teams
  82: {
    championsLeague: [1, 2, 3, 4], // Top 4
    europaLeague: [5], // 5th place
    conferenceLeague: [6], // 6th place (or DFB-Pokal winner)
    relegation: [17, 18], // Bottom 2 (16th goes to playoff)
    totalTeams: 18
  },
  
  // Serie A (Italy) - 20 teams
  384: {
    championsLeague: [1, 2, 3, 4], // Top 4
    europaLeague: [5], // 5th place
    conferenceLeague: [6], // 6th place (or Coppa Italia winner)
    relegation: [18, 19, 20], // Bottom 3
    totalTeams: 20
  },
  
  // Ligue 1 (France) - 20 teams
  301: {
    championsLeague: [1, 2, 3], // Top 3
    europaLeague: [4], // 4th place
    conferenceLeague: [5], // 5th place (or Coupe de France winner)
    relegation: [18, 19, 20], // Bottom 3
    totalTeams: 20
  },
  
  // Eredivisie (Netherlands) - 18 teams
  72: {
    championsLeague: [1, 2], // Top 2
    europaLeague: [3], // 3rd place
    conferenceLeague: [4], // 4th place (or KNVB Cup winner)
    relegation: [17, 18], // Bottom 2
    totalTeams: 18
  },
  
  // Pro League (Belgium) - 18 teams
  208: {
    championsLeague: [1], // 1st place
    europaLeague: [2], // 2nd place
    conferenceLeague: [3, 4], // 3rd and 4th place
    relegation: [17, 18], // Bottom 2
    totalTeams: 18
  },
  
  // Superliga (Denmark) - 12 teams
  271: {
    championsLeague: [1], // 1st place
    europaLeague: [2], // 2nd place
    conferenceLeague: [3], // 3rd place
    relegation: [11, 12], // Bottom 2
    totalTeams: 12
  },
  
  // Liga Portugal (Portugal) - 18 teams
  462: {
    championsLeague: [1, 2], // Top 2
    europaLeague: [3], // 3rd place
    conferenceLeague: [4], // 4th place (or Taça de Portugal winner)
    relegation: [17, 18], // Bottom 2
    totalTeams: 18
  },
  
  // Scotland Premiership - 12 teams
  501: {
    championsLeague: [1], // 1st place
    europaLeague: [2], // 2nd place
    conferenceLeague: [3], // 3rd place (or Scottish Cup winner)
    relegation: [12], // Bottom 1 (11th goes to playoff)
    totalTeams: 12
  },
  
  // Super Lig (Turkey) - 20 teams
  600: {
    championsLeague: [1, 2], // Top 2
    europaLeague: [3], // 3rd place
    conferenceLeague: [4], // 4th place (or Turkish Cup winner)
    relegation: [18, 19, 20], // Bottom 3
    totalTeams: 20
  },
  
  // Norway Eliteserien - 16 teams
  444: {
    championsLeague: [1], // 1st place
    europaLeague: [2], // 2nd place
    conferenceLeague: [3], // 3rd place (or Norwegian Cup winner)
    relegation: [15, 16], // Bottom 2
    totalTeams: 16
  },
  
  // SECOND-TIER LEAGUES
  
  // Serie B (Italy) - 20 teams
  387: {
    championsLeague: [1, 2], // Automatic promotion to Serie A
    europaLeague: [3, 4, 5, 6, 7, 8], // Playoff spots for promotion
    conferenceLeague: [], // No Conference League qualification
    relegation: [18, 19, 20], // Automatic relegation to Serie C
    totalTeams: 20
  },
  
  // Championship (England) - 24 teams
  9: {
    championsLeague: [1, 2], // Automatic promotion to Premier League
    europaLeague: [3, 4, 5, 6], // Playoff spots for promotion
    conferenceLeague: [], // No Conference League qualification
    relegation: [22, 23, 24], // Automatic relegation to League One
    totalTeams: 24
  },
  
  // League One (England) - 24 teams
  24: {
    championsLeague: [1, 2], // Automatic promotion to Championship
    europaLeague: [3, 4, 5, 6], // Playoff spots for promotion
    conferenceLeague: [], // No Conference League qualification
    relegation: [21, 22, 23, 24], // Automatic relegation to League Two
    totalTeams: 24
  },
  
  // League Two (England) - 24 teams
  27: {
    championsLeague: [1, 2, 3], // Automatic promotion to League One
    europaLeague: [4, 5, 6, 7], // Playoff spots for promotion
    conferenceLeague: [], // No Conference League qualification
    relegation: [23, 24], // Automatic relegation to National League
    totalTeams: 24
  }
};

/**
 * Check if a league is a second-tier league (promotion/relegation instead of European qualification)
 */
function isSecondTierLeague(leagueId: number): boolean {
  const secondTierLeagues = [387, 9, 24, 27]; // Serie B, Championship, League One, League Two
  return secondTierLeagues.includes(leagueId);
}

/**
 * Get the qualification color for a position in a specific league
 */
export function getPositionQualificationColor(leagueId: number, position: number): string {
  const rules = LEAGUE_QUALIFICATION_RULES[leagueId];
  
  if (!rules) {
    // Default fallback for unknown leagues
    return position <= 6 ? 'bg-green-500' : 'bg-gray-800';
  }
  
  const isSecondTier = isSecondTierLeague(leagueId);
  
  if (rules.championsLeague.includes(position)) {
    if (isSecondTier) {
      return 'bg-green-500'; // Automatic promotion - Green
    } else {
      return 'bg-blue-500'; // Champions League - Blue
    }
  }
  
  if (rules.europaLeague.includes(position)) {
    if (isSecondTier) {
      return 'bg-blue-500'; // Playoff spots - Blue
    } else {
      return 'bg-orange-500'; // Europa League - Orange
    }
  }
  
  if (rules.conferenceLeague.includes(position)) {
    return 'bg-purple-500'; // Conference League - Purple
  }
  
  if (rules.relegation.includes(position)) {
    return 'bg-red-500'; // Relegation - Red
  }
  
  return 'bg-gray-800'; // Default - Black
}

/**
 * Get qualification description for a position in a specific league
 */
export function getPositionQualificationDescription(leagueId: number, position: number): string {
  const rules = LEAGUE_QUALIFICATION_RULES[leagueId];
  
  if (!rules) {
    return 'Mid-table';
  }
  
  const isSecondTier = isSecondTierLeague(leagueId);
  
  if (rules.championsLeague.includes(position)) {
    if (isSecondTier) {
      return 'Automatic Promotion';
    } else {
      return 'Champions League';
    }
  }
  
  if (rules.europaLeague.includes(position)) {
    if (isSecondTier) {
      return 'Promotion Playoffs';
    } else {
      return 'Europa League';
    }
  }
  
  if (rules.conferenceLeague.includes(position)) {
    return 'Conference League';
  }
  
  if (rules.relegation.includes(position)) {
    return 'Relegation';
  }
  
  return 'Mid-table';
} 