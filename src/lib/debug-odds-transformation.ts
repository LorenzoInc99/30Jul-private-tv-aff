import { transformOdds } from './database-adapter';

export function debugOddsTransformation() {
  console.log('🔍 Debugging odds transformation...\n');

  // Sample odds data from the debug output
  const sampleOdds = [
    {
      id: 181771341935,
      label: "Away",
      value: 3.95,
      market_id: 1,
      bookmaker: { name: "10Bet", url: null }
    },
    {
      id: 181771341933,
      label: "Draw", 
      value: 3.55,
      market_id: 1,
      bookmaker: { name: "10Bet", url: null }
    },
    {
      id: 181771341931,
      label: "Home",
      value: 1.7,
      market_id: 1,
      bookmaker: { name: "10Bet", url: null }
    }
  ];

  console.log('📋 Input odds:');
  console.log(JSON.stringify(sampleOdds, null, 2));

  const transformed = transformOdds(sampleOdds);
  
  console.log('\n📋 Transformed odds:');
  console.log(JSON.stringify(transformed, null, 2));

  console.log('\n✅ Transformation test completed!');
} 