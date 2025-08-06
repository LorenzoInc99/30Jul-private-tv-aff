import { supabaseServer } from '../../lib/supabase';

export default async function TestTeamLookup() {
  const supabase = supabaseServer();
  
  // Test different team name variations including FC København
  const testNames = [
    'fckobenhavn', 
    'fckbenhavn', // Typo: missing 'o'
    'fc-kobenhavn', 
    'fc-k-benhavn',
    'randers', 
    'randersfc', 
    'Randers FC', 
    'Randers'
  ];
  
  const results = [];
  
  for (const testName of testNames) {
    // Simulate the same logic as the team page
    // For the new format, we need to try different variations since the slug is compact
    // Example: "fckobenhavn" could be "FC København", "FCK København", etc.
    
    const alternativeSearchTerms = [
      // Try exact match first
      testName,
      // Try with common prefixes
      `FC ${testName}`,
      `FCK ${testName}`,
      // Try with spaces in different positions
      testName.replace(/([a-z])([A-Z])/g, '$1 $2'), // camelCase to spaces
      // Handle specific cases for FC København
      testName.replace(/fc/i, 'FC '),
      testName.replace(/kobenhavn/i, 'København'),
      testName.replace(/fckobenhavn/i, 'FC København'),
      // Handle typos and missing characters
      testName.replace(/fckbenhavn/i, 'FC København'), // Missing 'o'
      testName.replace(/kbenhavn/i, 'København'), // Missing 'o'
      // Try with common team name patterns
      testName.replace(/united/i, ' United'),
      testName.replace(/city/i, ' City'),
      testName.replace(/athletic/i, ' Athletic'),
      testName.replace(/real/i, 'Real '),
      testName.replace(/atletico/i, 'Atlético '),
    ];
    
    let foundTeam = null;
    let searchMethod = '';
    
    // First try exact matches
    for (const searchTerm of alternativeSearchTerms) {
      const { data } = await supabase
        .from('teams_new')
        .select('*')
        .ilike('name', searchTerm)
        .single();
      if (data) {
        foundTeam = data;
        searchMethod = `exact match: "${searchTerm}"`;
        break;
      }
    }
    
    // If no exact match, try partial matches
    if (!foundTeam) {
      for (const searchTerm of alternativeSearchTerms) {
        const { data } = await supabase
          .from('teams_new')
          .select('*')
          .ilike('name', `%${searchTerm}%`)
          .limit(5);
        if (data && data.length > 0) {
          // Find the best match (exact or closest)
          const bestMatch = data.find(t => 
            t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            searchTerm.toLowerCase().includes(t.name.toLowerCase())
          ) || data[0];
          foundTeam = bestMatch;
          searchMethod = `partial match: "${searchTerm}" (found ${data.length} teams)`;
          break;
        }
      }
    }
    
    results.push({
      searchTerm: testName,
      found: foundTeam ? 1 : 0,
      team: foundTeam,
      searchMethod,
      alternativeSearchTerms
    });
  }
  
  // Also get all teams to see what's available
  const { data: allTeams } = await supabase
    .from('teams_new')
    .select('name')
    .limit(20);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Team Lookup Test</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Test Results</h2>
        {results.map((result, index) => (
          <div key={index} className="mb-4 p-4 border rounded">
            <h3 className="font-bold">Search: "{result.searchTerm}"</h3>
            <p>Found: {result.found} teams</p>
            {result.team && (
              <div className="mt-2 p-2 bg-green-50 rounded">
                <p><strong>Found Team:</strong> ID: {result.team.id}, Name: "{result.team.name}"</p>
                <p><strong>Search Method:</strong> {result.searchMethod}</p>
              </div>
            )}
            {!result.team && (
              <div className="mt-2 p-2 bg-red-50 rounded">
                <p className="text-red-600">❌ No team found</p>
                <p><strong>Search Terms Tried:</strong></p>
                <ul className="text-sm">
                  {result.alternativeSearchTerms.map((term, termIndex) => (
                    <li key={termIndex}>• "{term}"</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div>
        <h2 className="text-xl font-bold mb-2">Sample Teams in Database</h2>
        <ul className="space-y-1">
          {allTeams?.map((team: any, index: number) => (
            <li key={index} className="text-sm">
              "{team.name}"
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 