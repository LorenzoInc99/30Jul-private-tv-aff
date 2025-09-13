// Broadcaster click tracking utility
const STORAGE_KEY = 'broadcaster_clicks_pending';
const BATCH_SIZE = 5; // Send to server every 5 clicks
const BATCH_TIMEOUT = 5 * 60 * 1000; // 5 minutes

interface PendingClick {
  broadcasterId: number;
  timestamp: number;
}

// Get pending clicks from localStorage
export function getPendingClicks(): PendingClick[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    console.log('Raw localStorage data:', stored);
    const parsed = stored ? JSON.parse(stored) : [];
    console.log('Parsed pending clicks:', parsed);
    return parsed;
  } catch (error) {
    console.error('Error reading pending clicks:', error);
    return [];
  }
}

// Save pending clicks to localStorage
export function savePendingClicks(clicks: PendingClick[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clicks));
    console.log('Successfully saved pending clicks to localStorage:', clicks);
  } catch (error) {
    console.error('Error saving pending clicks:', error);
  }
}

// Track a click for a broadcaster
export function trackBroadcasterClick(broadcasterId: number): void {
  console.log('trackBroadcasterClick called with ID:', broadcasterId);
  
  const pendingClicks = getPendingClicks();
  console.log('Current pending clicks:', pendingClicks);
  
  // Add new click
  pendingClicks.push({
    broadcasterId,
    timestamp: Date.now()
  });
  
  console.log('New pending clicks:', pendingClicks);
  
  // Save to localStorage
  savePendingClicks(pendingClicks);
  
  // Verify the save worked
  const verifyClicks = getPendingClicks();
  console.log('Verification - clicks in localStorage after save:', verifyClicks);
  
  // Check if we should send to server
  if (pendingClicks.length >= BATCH_SIZE) {
    console.log('Reached batch size, sending clicks...');
    sendPendingClicks();
  } else {
    // For testing: send immediately if localStorage is working
    console.log('Sending single click immediately for testing...');
    sendPendingClicks();
  }
}

// Send pending clicks to server
export async function sendPendingClicks(): Promise<void> {
  const pendingClicks = getPendingClicks();
  
  if (pendingClicks.length === 0) return;
  
  try {
    // Group clicks by broadcaster ID
    const clickCounts: { [key: number]: number } = {};
    pendingClicks.forEach(click => {
      clickCounts[click.broadcasterId] = (clickCounts[click.broadcasterId] || 0) + 1;
    });
    
    const broadcasterIds = Object.keys(clickCounts).map(Number);
    
    // Send to API
    const response = await fetch('/api/broadcaster-clicks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ broadcasterIds }),
    });
    
    if (response.ok) {
      // Clear pending clicks on success
      savePendingClicks([]);
      console.log('Successfully sent broadcaster clicks to server');
    } else {
      console.error('Failed to send broadcaster clicks:', response.statusText);
    }
  } catch (error) {
    console.error('Error sending broadcaster clicks:', error);
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
