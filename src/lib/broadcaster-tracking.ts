// Broadcaster click tracking utility
const STORAGE_KEY = 'broadcaster_clicks_pending';
const BATCH_SIZE = 5; // Send to server every 5 clicks
const BATCH_TIMEOUT = 5 * 60 * 1000; // 5 minutes

interface PendingClick {
  broadcasterId: number;
  matchId: number;
  timestamp: number;
}

// Get pending clicks from localStorage
export function getPendingClicks(): PendingClick[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    // Silently handle errors in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Error reading pending clicks:', error);
    }
    return [];
  }
}

// Save pending clicks to localStorage
export function savePendingClicks(clicks: PendingClick[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clicks));
  } catch (error) {
    // Silently handle errors in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Error saving pending clicks:', error);
    }
  }
}

// Track a click for a broadcaster
export function trackBroadcasterClick(broadcasterId: number, matchId: number): void {
  // Validate inputs
  if (!broadcasterId || !matchId || broadcasterId <= 0 || matchId <= 0) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Invalid broadcaster or match ID provided');
    }
    return;
  }
  
  const pendingClicks = getPendingClicks();
  
  // Add new click
  pendingClicks.push({
    broadcasterId,
    matchId,
    timestamp: Date.now()
  });
  
  // Save to localStorage
  savePendingClicks(pendingClicks);
  
  // Check if we should send to server
  if (pendingClicks.length >= BATCH_SIZE) {
    sendPendingClicks();
  } else {
    // Send immediately for better user experience
    sendPendingClicks();
  }
}

// Send pending clicks to server
export async function sendPendingClicks(): Promise<void> {
  const pendingClicks = getPendingClicks();
  
  if (pendingClicks.length === 0) return;
  
  try {
    // Group clicks by broadcaster ID and match ID
    const clickData: { [key: string]: { broadcasterId: number, matchId: number, count: number } } = {};
    pendingClicks.forEach(click => {
      const key = `${click.matchId}-${click.broadcasterId}`;
      if (!clickData[key]) {
        clickData[key] = { broadcasterId: click.broadcasterId, matchId: click.matchId, count: 0 };
      }
      clickData[key].count++;
    });
    
    const clicksToSend = Object.values(clickData);
    
    // Send to API
    const response = await fetch('/api/broadcaster-clicks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clicksToSend }),
    });
    
    if (response.ok) {
      // Clear pending clicks on success
      savePendingClicks([]);
    } else {
      // Only log errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to send broadcaster clicks:', response.statusText);
      }
    }
  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error sending broadcaster clicks:', error);
    }
  }
}

// Format click count for display
export function formatClickCount(count: number): string {
  if (count === 0) return '';
  if (count < 5) return '';
  if (count < 50) return '5+';
  if (count < 100) return '50+';
  if (count < 200) return '100+';
  if (count < 300) return '200+';
  if (count < 500) return '300+';
  if (count < 1000) return '500+';
  if (count < 1500) return '1k+';
  if (count < 2000) return '1.5k+';
  if (count < 5000) return '2k+';
  if (count < 10000) return '5k+';
  return '10k+';
}

// Initialize periodic sending (every 5 minutes)
export function initializeClickTracking(): void {
  if (typeof window === 'undefined') return;
  
  // Send pending clicks every 5 minutes
  setInterval(() => {
    sendPendingClicks();
  }, BATCH_TIMEOUT);
  
  // Send pending clicks when page is about to unload
  window.addEventListener('beforeunload', () => {
    sendPendingClicks();
  });
}
