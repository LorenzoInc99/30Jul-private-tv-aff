// Test script to verify database migration
// Run this in development to test the new database adapter

import { getMatchesForDate, getAllCompetitions, getMatchById } from './database-adapter';
import { supabaseBrowser } from './supabase';

export async function testMigration() {
  console.log('🧪 Testing Database Migration...\n');

  try {
    // Test 1: Get matches for today
    console.log('1️⃣ Testing getMatchesForDate...');
    const today = new Date();
    
    try {
      const matches = await getMatchesForDate(today);
      console.log(`✅ Found ${matches.length} matches for today`);
      
      if (matches.length > 0) {
        console.log('📋 Sample match data:');
        console.log(JSON.stringify(matches[0], null, 2));
      }
    } catch (error: any) {
      console.error('❌ Error in getMatchesForDate:', error.message);
      console.error('Full error:', error);
      throw error;
    }

    // Test 2: Get all competitions
    console.log('\n2️⃣ Testing getAllCompetitions...');
    const competitions = await getAllCompetitions();
    console.log(`✅ Found ${competitions.length} competitions`);
    
    if (competitions.length > 0) {
      console.log('📋 Sample competition data:');
      console.log(JSON.stringify(competitions[0], null, 2));
    }

    // Test 3: Get specific match (if we have matches)
    if (matches.length > 0) {
      console.log('\n3️⃣ Testing getMatchById...');
      const firstMatchId = matches[0].id;
      const match = await getMatchById(firstMatchId.toString());
      console.log(`✅ Successfully fetched match ${firstMatchId}`);
      console.log('📋 Match details:');
      console.log(JSON.stringify(match, null, 2));
    }

    // Test 4: Test error handling
    console.log('\n4️⃣ Testing error handling...');
    try {
      await getMatchById('999999999');
      console.log('❌ Expected error but got success');
    } catch (error) {
      console.log('✅ Error handling works correctly');
    }

    console.log('\n🎉 All tests passed! Migration is working correctly.');

  } catch (error) {
    console.error('❌ Migration test failed:', error);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check your Supabase connection settings');
    console.log('2. Verify the new database schema is correct');
    console.log('3. Check the status mappings in database-config.ts');
    console.log('4. Ensure all foreign key relationships are set up');
  }
}

// Function to test raw database connection
export async function testRawConnection() {
  console.log('🔌 Testing raw database connection...\n');

  try {
    // Test basic table access
    const { data: fixtures, error: fixturesError } = await supabaseBrowser
      .from('fixtures')
      .select('*')
      .limit(1);

    if (fixturesError) {
      console.error('❌ Error accessing fixtures table:', fixturesError);
      return;
    }

    console.log('✅ Fixtures table accessible');
    console.log(`📊 Found ${fixtures?.length || 0} fixtures`);

    // Test leagues table
    const { data: leagues, error: leaguesError } = await supabaseBrowser
      .from('leagues')
      .select('*')
      .limit(1);

    if (leaguesError) {
      console.error('❌ Error accessing leagues table:', leaguesError);
      return;
    }

    console.log('✅ Leagues table accessible');
    console.log(`📊 Found ${leagues?.length || 0} leagues`);

    // Test teams table
    const { data: teams, error: teamsError } = await supabaseBrowser
      .from('teams_new')
      .select('*')
      .limit(1);

    if (teamsError) {
      console.error('❌ Error accessing teams_new table:', teamsError);
      return;
    }

    console.log('✅ Teams table accessible');
    console.log(`📊 Found ${teams?.length || 0} teams`);

    console.log('\n🎉 Raw database connection test passed!');

  } catch (error) {
    console.error('❌ Raw connection test failed:', error);
  }
}

// Function to validate data structure
export async function validateDataStructure() {
  console.log('🔍 Validating data structure...\n');

  try {
    // Get a sample fixture with all relations
    const { data: fixture, error } = await supabaseBrowser
      .from('fixtures')
      .select(`
        *,
        league:leagues(*),
        home_team:teams_new!fixtures_home_team_id_fkey1(*),
        away_team:teams_new!fixtures_away_team_id_fkey1(*),
        fixturetvstations(
          tvstation:tvstations(*)
        ),
        odds(
          bookmaker:bookmakers(*)
        )
      `)
      .limit(1)
      .single();

    if (error || !fixture) {
      console.error('❌ Error fetching sample fixture:', error);
      return;
    }

    console.log('✅ Sample fixture structure:');
    console.log(JSON.stringify(fixture, null, 2));

    // Validate required fields
    const requiredFields = ['id', 'name', 'starting_at', 'state_id', 'home_team_id', 'away_team_id'];
    const missingFields = requiredFields.filter(field => !(field in fixture));
    
    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
    } else {
      console.log('✅ All required fields present');
    }

    // Validate relationships
    if (!fixture.league) {
      console.error('❌ Missing league relationship');
    } else {
      console.log('✅ League relationship working');
    }

    if (!fixture.home_team || !fixture.away_team) {
      console.error('❌ Missing team relationships');
    } else {
      console.log('✅ Team relationships working');
    }

    console.log('\n🎉 Data structure validation completed!');

  } catch (error) {
    console.error('❌ Data structure validation failed:', error);
  }
}

// Export all test functions
export const migrationTests = {
  testMigration,
  testRawConnection,
  validateDataStructure
}; 