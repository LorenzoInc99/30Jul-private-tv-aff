import { supabaseServer } from '../../lib/supabase';

export default async function TestTeamLookup() {
  const supabase = supabaseServer();
  
  // Test different team name variations
  const testNames = ['randers', 'randers-fc', 'Randers FC', 'Randers'];
  
  const results = [];
  
  for (const testName of testNames) {
    const { data: team, error } = await supabase
      .from('teams_new')
      .select('*')
      .ilike('name', `%${testName}%`)
      .limit(5);
    
    results.push({
      searchTerm: testName,
      found: team?.length || 0,
      teams: team || [],
      error: error?.message
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
            {result.error && <p className="text-red-500">Error: {result.error}</p>}
            {result.teams.length > 0 && (
              <ul className="mt-2">
                {result.teams.map((team: any, teamIndex: number) => (
                  <li key={teamIndex} className="text-sm">
                    ID: {team.id}, Name: "{team.name}"
                  </li>
                ))}
              </ul>
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