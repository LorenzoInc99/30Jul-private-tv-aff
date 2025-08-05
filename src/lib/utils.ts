import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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