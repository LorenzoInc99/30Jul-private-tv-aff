import { NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET(req: NextRequest, { params }: { params: { matchId: string } }) {
  const { matchId } = params;
  // Extract numeric or UUID from slug
  const uuidMatch = matchId.match(/^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
  let actualMatchId = matchId;
  if (uuidMatch) actualMatchId = uuidMatch[1];
  else {
    const numericMatch = matchId.match(/^(\d+)/);
    if (numericMatch) actualMatchId = numericMatch[1];
  }
  const { data: match, error } = await supabaseServer()
    .from('Events')
    .select(`*, status, Competitions(*), home_team: Teams!Events_home_team_id_fkey(*), away_team: Teams!Events_home_team_id_fkey(*), Event_Broadcasters(Broadcasters(*)), Odds(*, Operators(*))`)
    .eq('id', actualMatchId)
    .single();
  if (error || !match) {
    return new Response(JSON.stringify({ error: 'Match not found' }), { status: 404 });
  }
  return new Response(JSON.stringify({ match }), { status: 200 });
} 