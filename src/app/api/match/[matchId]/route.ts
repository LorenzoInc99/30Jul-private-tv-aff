import { NextRequest } from 'next/server';
import { getMatchById } from '@/lib/database-adapter';

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
  
  try {
    const match = await getMatchById(actualMatchId);
    return new Response(JSON.stringify({ match }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Match not found' }), { status: 404 });
  }
} 