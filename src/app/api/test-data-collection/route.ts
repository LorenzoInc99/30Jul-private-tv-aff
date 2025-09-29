import { NextResponse } from 'next/server';
import { trackLeagueInteraction, getSessionId } from '@/lib/league-tracking';

export async function GET() {
  try {
    const sessionId = getSessionId();
    
    // Test tracking some interactions
    await trackLeagueInteraction(8, 'league_view', 0, sessionId); // Premier League
    await trackLeagueInteraction(8, 'match_click', 0, sessionId);
    await trackLeagueInteraction(564, 'league_view', 0, sessionId); // La Liga
    await trackLeagueInteraction(384, 'league_view', 0, sessionId); // Serie A
    await trackLeagueInteraction(8, 'time_spent', 60, sessionId); // 60 seconds on PL

    return NextResponse.json({
      success: true,
      message: 'Data collection test successful!',
      sessionId,
      interactions: [
        { league: 'Premier League (8)', action: 'league_view' },
        { league: 'Premier League (8)', action: 'match_click' },
        { league: 'La Liga (564)', action: 'league_view' },
        { league: 'Serie A (384)', action: 'league_view' },
        { league: 'Premier League (8)', action: 'time_spent', value: 60 }
      ]
    });
  } catch (error: any) {
    console.error('Test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      note: 'This might be due to database permissions. Check your Supabase setup.'
    }, { status: 500 });
  }
}


