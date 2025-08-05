import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET() {
  try {
    // First, let's check if we have any fixtures at all
    const fixturesCount = await executeQuery(`SELECT COUNT(*) as count FROM fixtures`);
    
    // Then check if we have FC København team
    const teamCheck = await executeQuery(`SELECT id, name FROM teams_new WHERE id = 85`);
    
    // Finally, get FC København fixtures
    const fixtures = await executeQuery(`
      SELECT 
        f.id,
        f.name,
        f.start_time,
        f.home_score,
        f.away_score,
        f.state_id
      FROM fixtures f
      WHERE (f.home_team_id = 85 OR f.away_team_id = 85)
      ORDER BY f.start_time DESC
    `);
    
    // Let's also check what leagues we have fixtures for
    const leaguesWithFixtures = await executeQuery(`
      SELECT DISTINCT 
        l.id as league_id,
        l.name as league_name,
        COUNT(f.id) as fixture_count
      FROM fixtures f
      JOIN seasons s ON f.season_id = s.id
      JOIN leagues l ON s.league_id = l.id
      GROUP BY l.id, l.name
      ORDER BY fixture_count DESC
      LIMIT 10
    `);
    
    // Check specifically for Superliga (271)
    const superligaFixtures = await executeQuery(`
      SELECT COUNT(f.id) as count
      FROM fixtures f
      JOIN seasons s ON f.season_id = s.id
      WHERE s.league_id = 271
    `);
    
    // Check if we have any seasons for Superliga
    const superligaSeasons = await executeQuery(`
      SELECT id, name, league_id, is_current
      FROM seasons
      WHERE league_id = 271
    `);
    
    // Check what teams we have in Superliga season 25536
    const superligaTeams = await executeQuery(`
      SELECT DISTINCT 
        t.id,
        t.name,
        t.short_code
      FROM fixtures f
      JOIN teams_new t ON (f.home_team_id = t.id OR f.away_team_id = t.id)
      WHERE f.season_id = 25536
      ORDER BY t.name
    `);
    
    // Let's see some actual Superliga fixtures to understand the data
    const sampleSuperligaFixtures = await executeQuery(`
      SELECT 
        f.id,
        f.name,
        f.start_time,
        f.home_score,
        f.away_score,
        f.state_id,
        ht.name as home_team,
        at.name as away_team
      FROM fixtures f
      JOIN teams_new ht ON f.home_team_id = ht.id
      JOIN teams_new at ON f.away_team_id = at.id
      WHERE f.season_id = 25536
      ORDER BY f.start_time DESC
      LIMIT 10
    `);
    
    // Let's check what fixtures we actually have without joins first
    const rawFixtures = await executeQuery(`
      SELECT 
        id,
        name,
        start_time,
        home_team_id,
        away_team_id,
        season_id,
        state_id
      FROM fixtures
      WHERE season_id = 25536
      ORDER BY start_time DESC
      LIMIT 5
    `);
    
    // Let's check what season IDs are actually in the fixtures table
    const seasonIdsInFixtures = await executeQuery(`
      SELECT DISTINCT 
        season_id,
        COUNT(*) as fixture_count
      FROM fixtures
      GROUP BY season_id
      ORDER BY fixture_count DESC
      LIMIT 10
    `);
    
    // Check if FC København appears in any fixtures at all
    const fcKobenhavnAllFixtures = await executeQuery(`
      SELECT 
        f.id,
        f.name,
        f.start_time,
        f.home_score,
        f.away_score,
        f.state_id,
        s.name as season_name,
        l.name as league_name
      FROM fixtures f
      JOIN seasons s ON f.season_id = s.id
      JOIN leagues l ON s.league_id = l.id
      WHERE (f.home_team_id = 85 OR f.away_team_id = 85)
      ORDER BY f.start_time DESC
    `);
    
    // Check what's in the standings table for FC København
    const fcKobenhavnStandings = await executeQuery(`
      SELECT 
        s.*,
        t.name as team_name,
        se.name as season_name
      FROM standings s
      JOIN teams_new t ON s.team_id = t.id
      JOIN seasons se ON s.season_id = se.id
      WHERE s.team_id = 85
      ORDER BY s.season_id DESC
    `);

    return NextResponse.json({
      success: true,
      totalFixtures: fixturesCount.data?.[0]?.count || 0,
      teamInfo: teamCheck.data?.[0] || null,
      fcKobenhavnFixtures: fixtures.data || [],
      fcKobenhavnCount: fixtures.data?.length || 0,
      topLeagues: leaguesWithFixtures.data || [],
      superligaFixtures: superligaFixtures.data?.[0]?.count || 0,
      superligaSeasons: superligaSeasons.data || [],
      superligaTeams: superligaTeams.data || [],
      fcKobenhavnAllFixtures: fcKobenhavnAllFixtures.data || [],
      fcKobenhavnStandings: fcKobenhavnStandings.data || [],
      sampleSuperligaFixtures: sampleSuperligaFixtures.data || [],
      rawFixtures: rawFixtures.data || [],
      seasonIdsInFixtures: seasonIdsInFixtures.data || []
    });

  } catch (error: any) {
    console.error('Debug FC København error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 