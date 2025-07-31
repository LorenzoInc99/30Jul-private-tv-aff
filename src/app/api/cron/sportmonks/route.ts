import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

// This will be called by Vercel Cron every 6 hours
export async function GET(request: NextRequest) {
  // Verify it's a legitimate cron request
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Call your data fetching logic here
    const response = await fetch(`${process.env.VERCEL_URL}/api/fetch-sportmonks`, {
      method: 'POST',
    });
    
    const result = await response.json();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    );
  }
} 