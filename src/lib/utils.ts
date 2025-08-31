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
  const needsWhite = needsWhiteBackground(leagueId);
  
  if (needsWhite) {
    return `${baseClassName} object-contain bg-white rounded-sm p-0.5 border border-gray-200 dark:border-gray-600 shadow-sm`.trim();
  }
  
  return `${baseClassName} object-contain bg-gray-50 dark:bg-gray-800 rounded-sm p-0.5 border border-gray-200 dark:border-gray-600`.trim();
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