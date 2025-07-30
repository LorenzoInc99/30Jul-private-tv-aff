import { supabaseBrowser } from './supabase';

export async function debugOddsStructure() {
  console.log('🔍 Debugging odds structure...\n');

  try {
    // Get a sample fixture with odds
    const { data: fixture, error } = await supabaseBrowser
      .from('fixtures')
      .select(`
        id,
        name,
        odds(
          id,
          fixture_id,
          bookmaker_id,
          market_id,
          label,
          value,
          probability,
          latest_bookmaker_update,
          bookmaker:bookmakers(*)
        )
      `)
      .limit(1)
      .single();

    if (error || !fixture) {
      console.error('❌ Error fetching fixture with odds:', error);
      return;
    }

    console.log('📋 Fixture with odds:');
    console.log(JSON.stringify(fixture, null, 2));

    // Check if odds have the expected fields
    if (fixture.odds && fixture.odds.length > 0) {
      console.log('\n🔍 Analyzing odds structure:');
      const firstOdd = fixture.odds[0];
      console.log('First odd fields:', Object.keys(firstOdd));
      console.log('First odd values:', firstOdd);
      
      // Check for missing fields
      const expectedFields = ['id', 'fixture_id', 'bookmaker_id', 'market_id', 'label', 'value'];
      const missingFields = expectedFields.filter(field => !(field in firstOdd));
      
      if (missingFields.length > 0) {
        console.log('❌ Missing fields in odds:', missingFields);
      } else {
        console.log('✅ All expected fields present');
      }
    } else {
      console.log('⚠️ No odds found for this fixture');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

export async function debugOddsByMarket() {
  console.log('🔍 Debugging odds by market...\n');

  try {
    // Get odds grouped by market_id
    const { data: odds, error } = await supabaseBrowser
      .from('odds')
      .select(`
        id,
        fixture_id,
        bookmaker_id,
        market_id,
        label,
        value,
        probability,
        bookmaker:bookmakers(name)
      `)
      .limit(10);

    if (error) {
      console.error('❌ Error fetching odds:', error);
      return;
    }

    console.log('📋 Sample odds data:');
    console.log(JSON.stringify(odds, null, 2));

    // Group by market_id
    const oddsByMarket: { [key: number]: any[] } = {};
    odds?.forEach((odd: any) => {
      if (!oddsByMarket[odd.market_id]) {
        oddsByMarket[odd.market_id] = [];
      }
      oddsByMarket[odd.market_id].push(odd);
    });

    console.log('\n📊 Odds grouped by market_id:');
    Object.entries(oddsByMarket).forEach(([marketId, marketOdds]) => {
      console.log(`Market ${marketId}:`);
      marketOdds.forEach(odd => {
        console.log(`  - ${odd.label}: ${odd.value} (${odd.bookmaker?.name})`);
      });
    });

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
} 