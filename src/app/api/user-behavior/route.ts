import { NextRequest, NextResponse } from 'next/server';
import { analyzeUserBehavior } from '@/lib/league-tracking';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'Session ID is required'
      }, { status: 400 });
    }
    
    const behavior = await analyzeUserBehavior(sessionId);
    
    return NextResponse.json({
      success: true,
      data: behavior
    });
    
  } catch (error) {
    console.error('User behavior analysis failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
