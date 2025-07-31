// Utility functions for managing pinned leagues

const PINNED_LEAGUES_KEY = 'pinned-leagues';

export interface PinnedLeague {
  id: number;
  name: string;
  pinnedAt: number; // timestamp
}

export function getPinnedLeagues(): PinnedLeague[] {
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    const stored = localStorage.getItem(PINNED_LEAGUES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading pinned leagues:', error);
    return [];
  }
}

export function addPinnedLeague(league: { id: number; name: string }): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    const pinned = getPinnedLeagues();
    const exists = pinned.some(p => p.id === league.id);
    
    if (!exists) {
      const newPinned: PinnedLeague = {
        id: league.id,
        name: league.name,
        pinnedAt: Date.now()
      };
      
      const updated = [...pinned, newPinned];
      localStorage.setItem(PINNED_LEAGUES_KEY, JSON.stringify(updated));
    }
  } catch (error) {
    console.error('Error adding pinned league:', error);
  }
}

export function removePinnedLeague(leagueId: number): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    const pinned = getPinnedLeagues();
    const updated = pinned.filter(p => p.id !== leagueId);
    localStorage.setItem(PINNED_LEAGUES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error removing pinned league:', error);
  }
}

export function isLeaguePinned(leagueId: number): boolean {
  const pinned = getPinnedLeagues();
  return pinned.some(p => p.id === leagueId);
}

export function togglePinnedLeague(league: { id: number; name: string }): void {
  if (isLeaguePinned(league.id)) {
    removePinnedLeague(league.id);
  } else {
    addPinnedLeague(league);
  }
} 