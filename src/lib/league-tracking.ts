// League tracking system using your existing Supabase setup
import { supabaseBrowser } from './supabase';

// Generate session ID for anonymous tracking
export const getSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

// Store user preferences locally
export const storeUserPreferences = (preferences: { leagueId: number; priority: number }[]) => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('league_preferences', JSON.stringify(preferences));
  localStorage.setItem('preferences_updated', Date.now().toString());
};

// Get stored user preferences
export const getUserPreferences = (): { leagueId: number; priority: number }[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem('league_preferences');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to parse stored preferences:', error);
    return [];
  }
};

// Check if preferences are recent (within 7 days)
export const arePreferencesRecent = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const lastUpdate = localStorage.getItem('preferences_updated');
  if (!lastUpdate) return false;
  
  const daysSinceUpdate = (Date.now() - parseInt(lastUpdate)) / (1000 * 60 * 60 * 24);
  return daysSinceUpdate < 7;
};

// Track league interactions
export const trackLeagueInteraction = async (
  leagueId: number, 
  action: string, 
  value?: number
): Promise<void> => {
  try {
    const sessionId = getSessionId();
    
    // Use your existing Supabase setup
    const { error } = await supabaseBrowser
      .from('league_interactions')
      .insert({
        league_id: leagueId,
        session_id: sessionId,
        action: action,
        value: value || null,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Tracking error:', error);
    } else {
      // Update local preferences immediately for faster response
      updateLocalPreferences(leagueId, action, value);
    }
  } catch (error) {
    console.error('Failed to track interaction:', error);
  }
};

// Update local preferences immediately
const updateLocalPreferences = (leagueId: number, action: string, value?: number) => {
  try {
    const currentPrefs = getUserPreferences();
    const existingIndex = currentPrefs.findIndex(p => p.leagueId === leagueId);
    
    let newPriority = 100; // Default priority
    
    if (existingIndex >= 0) {
      // Update existing preference
      const currentPriority = currentPrefs[existingIndex].priority;
      
      // Boost priority based on action
      if (action === 'league_view') newPriority = Math.max(1, currentPriority - 5);
      if (action === 'match_click') newPriority = Math.max(1, currentPriority - 10);
      if (action === 'time_spent') newPriority = Math.max(1, currentPriority - Math.floor((value || 0) / 10));
      if (action === 'league_search') newPriority = Math.max(1, currentPriority - 3);
      
      currentPrefs[existingIndex].priority = newPriority;
    } else {
      // Add new preference
      if (action === 'league_view') newPriority = 95;
      if (action === 'match_click') newPriority = 90;
      if (action === 'time_spent') newPriority = Math.max(1, 100 - Math.floor((value || 0) / 10));
      if (action === 'league_search') newPriority = 97;
      
      currentPrefs.push({ leagueId, priority: newPriority });
    }
    
    // Sort by priority (lower = higher priority)
    currentPrefs.sort((a, b) => a.priority - b.priority);
    
    // Store updated preferences
    storeUserPreferences(currentPrefs);
    
    console.log('Updated local preferences for league', leagueId, 'with priority', newPriority);
  } catch (error) {
    console.error('Failed to update local preferences:', error);
  }
};

// Calculate dynamic priority for a league
export const calculateLeaguePriority = async (leagueId: number): Promise<number> => {
  try {
    const { data, error } = await supabaseBrowser
      .from('league_interactions')
      .select('action, value')
      .eq('league_id', leagueId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

    if (error || !data) return 100; // Default priority

    const stats = data.reduce((acc, row) => {
      if (row.action === 'league_view') acc.views++;
      if (row.action === 'match_click') acc.matchClicks++;
      if (row.action === 'time_spent') acc.totalTime += row.value || 0;
      if (row.action === 'league_search') acc.searches++;
      return acc;
    }, { views: 0, matchClicks: 0, totalTime: 0, searches: 0 });

    const avgTime = stats.views > 0 ? stats.totalTime / stats.views : 0;
    
    // Calculate interaction score
    const interactionScore = 
      (stats.views * 0.3) +
      (stats.matchClicks * 0.4) +
      (avgTime * 0.2) +
      (stats.searches * 0.1);

    // Convert to priority (lower = higher priority)
    return Math.max(1, Math.floor(100 - interactionScore));
  } catch (error) {
    console.error('Failed to calculate priority:', error);
    return 100;
  }
};

// Get personalized league order for current session
export const getPersonalizedLeagueOrder = async (): Promise<{ leagueId: number; priority: number }[]> => {
  try {
    // First, try to get stored preferences (faster)
    const storedPreferences = getUserPreferences();
    if (storedPreferences.length > 0 && arePreferencesRecent()) {
      console.log('Using stored preferences for faster loading');
      return storedPreferences;
    }

    const sessionId = getSessionId();
    console.log('Getting personalized order for session:', sessionId);
    
    // Get THIS USER'S interactions only (not global)
    const { data: sessionData } = await supabaseBrowser
      .from('league_interactions')
      .select('league_id, action, value')
      .eq('session_id', sessionId) // Only this user's session
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

    console.log('Found interactions for this user:', sessionData?.length || 0);

    if (!sessionData || sessionData.length === 0) {
      // If no recent data, try to get stored preferences anyway
      console.log('No recent interactions, using stored preferences');
      return storedPreferences;
    }

    // Calculate personal preferences for THIS USER only
    const personalPrefs = sessionData.reduce((acc, row) => {
      if (!acc[row.league_id]) {
        acc[row.league_id] = { views: 0, clicks: 0, time: 0, searches: 0 };
      }
      
      if (row.action === 'league_view') acc[row.league_id].views++;
      if (row.action === 'match_click') acc[row.league_id].clicks++;
      if (row.action === 'time_spent') acc[row.league_id].time += row.value || 0;
      if (row.action === 'league_search') acc[row.league_id].searches++;
      
      return acc;
    }, {} as Record<number, any>);

    console.log('Personal preferences calculated:', personalPrefs);

    // Convert to priority array
    const preferences = Object.entries(personalPrefs).map(([leagueId, stats]) => ({
      leagueId: parseInt(leagueId),
      priority: Math.max(1, 100 - Math.floor(
        (stats.views * 0.3) + 
        (stats.clicks * 0.4) + 
        (stats.time * 0.2) + 
        (stats.searches * 0.1)
      ))
    }));

    console.log('Final preferences for this user:', preferences);

    // Store preferences locally for faster future access
    storeUserPreferences(preferences);
    
    return preferences;
  } catch (error) {
    console.error('Failed to get personalized order:', error);
    // Fallback to stored preferences if available
    return getUserPreferences();
  }
};

// Analyze individual user behavior patterns
export const analyzeUserBehavior = async (sessionId: string) => {
  try {
    const { data: userInteractions } = await supabaseBrowser
      .from('league_interactions')
      .select('league_id, action, value, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (!userInteractions || userInteractions.length === 0) {
      return {
        userType: 'new_user',
        preferences: [],
        behaviorPattern: 'no_data',
        engagementScoreExplanation: {
          formula: 'views × 0.3 + clicks × 0.4 + time × 0.2 + searches × 0.1',
          description: 'Higher scores indicate more engagement with a league'
        }
      };
    }

    // Get league names for better readability
    const leagueIds = [...new Set(userInteractions.map(row => row.league_id))];
    const { data: leagues } = await supabaseBrowser
      .from('leagues')
      .select('id, name')
      .in('id', leagueIds);

    const leagueMap = leagues?.reduce((acc, league) => {
      acc[league.id] = league.name;
      return acc;
    }, {} as Record<number, string>) || {};

    // Analyze user behavior patterns
    const leagueStats = userInteractions.reduce((acc, row) => {
      if (!acc[row.league_id]) {
        acc[row.league_id] = { views: 0, clicks: 0, time: 0, searches: 0 };
      }
      
      if (row.action === 'league_view') acc[row.league_id].views++;
      if (row.action === 'match_click') acc[row.league_id].clicks++;
      if (row.action === 'time_spent') acc[row.league_id].time += row.value || 0;
      if (row.action === 'league_search') acc[row.league_id].searches++;
      
      return acc;
    }, {} as Record<number, any>);

    // Determine user type based on behavior
    const totalInteractions = userInteractions.length;
    const uniqueLeagues = Object.keys(leagueStats).length;
    const avgTimePerLeague = Object.values(leagueStats).reduce((sum: number, stats: any) => sum + stats.time, 0) / uniqueLeagues;

    let userType = 'casual_user';
    if (totalInteractions > 20 && uniqueLeagues > 5) userType = 'power_user';
    if (totalInteractions > 50 && uniqueLeagues > 10) userType = 'super_user';
    if (totalInteractions < 5) userType = 'new_user';

    // Determine behavior pattern
    let behaviorPattern = 'explorer';
    if (uniqueLeagues === 1) behaviorPattern = 'single_league_fan';
    if (uniqueLeagues <= 3) behaviorPattern = 'focused_user';
    if (avgTimePerLeague > 30) behaviorPattern = 'deep_reader';

    return {
      userType,
      behaviorPattern,
      preferences: Object.entries(leagueStats).map(([leagueId, stats]) => ({
        leagueId: parseInt(leagueId),
        leagueName: leagueMap[parseInt(leagueId)] || `League ${leagueId}`,
        views: stats.views,
        clicks: stats.clicks,
        time: stats.time,
        searches: stats.searches,
        engagementScore: (stats.views * 0.3) + (stats.clicks * 0.4) + (stats.time * 0.2) + (stats.searches * 0.1)
      })).sort((a, b) => b.engagementScore - a.engagementScore),
      engagementScoreExplanation: {
        formula: 'views × 0.3 + clicks × 0.4 + time × 0.2 + searches × 0.1',
        description: 'Higher scores indicate more engagement with a league',
        weights: {
          views: '30% - How many times they viewed the league',
          clicks: '40% - How many matches they clicked (highest weight)',
          time: '20% - Time spent on league pages (in seconds)',
          searches: '10% - How many times they searched for this league'
        }
      }
    };
  } catch (error) {
    console.error('Failed to analyze user behavior:', error);
    return {
      userType: 'unknown',
      preferences: [],
      behaviorPattern: 'error',
      engagementScoreExplanation: {
        formula: 'views × 0.3 + clicks × 0.4 + time × 0.2 + searches × 0.1',
        description: 'Higher scores indicate more engagement with a league'
      }
    };
  }
};

// Get user behavior insights for analytics
export const getUserInsights = async () => {
  try {
    const sessionId = getSessionId();
    const behavior = await analyzeUserBehavior(sessionId);
    
    console.log('User behavior analysis:', behavior);
    return behavior;
  } catch (error) {
    console.error('Failed to get user insights:', error);
    return null;
  }
};

// Update league priorities in database
export const updateLeaguePriorities = async (): Promise<void> => {
  try {
    // This would be called by a cron job or admin function
    // For now, we'll calculate priorities on-the-fly
    console.log('League priorities updated');
  } catch (error) {
    console.error('Failed to update priorities:', error);
  }
};
