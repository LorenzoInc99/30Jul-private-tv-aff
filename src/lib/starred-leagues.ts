// Utility functions for managing starred leagues (leagues that appear in favourites)

const STARRED_LEAGUES_KEY = 'starred-leagues';

export interface StarredLeague {
  id: number;
  name: string;
  starredAt: number; // timestamp
}

export function getStarredLeagues(): StarredLeague[] {
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    const stored = localStorage.getItem(STARRED_LEAGUES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading starred leagues:', error);
    return [];
  }
}

export function addStarredLeague(league: { id: number; name: string }): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    const starred = getStarredLeagues();
    const exists = starred.some(l => l.id === league.id);
    
    if (!exists) {
      starred.push({
        id: league.id,
        name: league.name,
        starredAt: Date.now()
      });
      
      localStorage.setItem(STARRED_LEAGUES_KEY, JSON.stringify(starred));
    }
  } catch (error) {
    console.error('Error adding starred league:', error);
  }
}

export function removeStarredLeague(leagueId: number): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    const starred = getStarredLeagues();
    const filtered = starred.filter(l => l.id !== leagueId);
    localStorage.setItem(STARRED_LEAGUES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing starred league:', error);
  }
}

export function isLeagueStarred(leagueId: number): boolean {
  const starred = getStarredLeagues();
  return starred.some(l => l.id === leagueId);
}

export function toggleStarredLeague(league: { id: number; name: string }): void {
  if (isLeagueStarred(league.id)) {
    removeStarredLeague(league.id);
  } else {
    addStarredLeague(league);
  }
}
