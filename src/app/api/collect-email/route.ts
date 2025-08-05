import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { email, source = 'odds_unlock', userAgent, referrer } = await request.json();
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid email address' 
      }, { status: 400 });
    }

    // Insert email with analytics data
    const insertQuery = `
      INSERT INTO email_subscribers (email, source, user_agent, referrer)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) 
      DO UPDATE SET 
        source = EXCLUDED.source,
        user_agent = EXCLUDED.user_agent,
        referrer = EXCLUDED.referrer,
        updated_at = NOW()
      RETURNING id;
    `;

    const result = await executeQuery(insertQuery, [
      email, 
      source, 
      userAgent || request.headers.get('user-agent'),
      referrer || request.headers.get('referer')
    ]);

    if (!result.success) {
      throw new Error(result.error);
    }

    // Track analytics
    const analyticsQuery = `
      INSERT INTO email_collection_analytics (
        email_id, action, source, user_agent, referrer
      ) VALUES ($1, $2, $3, $4, $5)
    `;

    await executeQuery(analyticsQuery, [
      result.data[0].id,
      'email_submitted',
      source,
      userAgent || request.headers.get('user-agent'),
      referrer || request.headers.get('referer')
    ]);

    console.log(`✅ Email collected: ${email} from ${source}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Email collected successfully',
      emailId: result.data[0].id
    });

  } catch (error) {
    console.error('❌ Error collecting email:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
