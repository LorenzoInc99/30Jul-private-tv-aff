const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Import the slugify function from utils
function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD') // Normalize unicode characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (accents, umlauts, etc.)
    .replace(/ø/g, 'o') // Replace ø with o
    .replace(/ö/g, 'o') // Replace ö with o
    .replace(/ü/g, 'u') // Replace ü with u
    .replace(/ä/g, 'a') // Replace ä with a
    .replace(/ß/g, 'ss') // Replace ß with ss
    .replace(/æ/g, 'ae') // Replace æ with ae
    .replace(/å/g, 'aa') // Replace å with aa
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .trim();
}

async function testTeamLookup() {
  console.log('🔍 Testing team lookup for Tottenham...');
  
  // Test the exact logic from findTeamByName
  const { data: allTeams } = await supabase
    .from('teams_new')
    .select('*');
  
  console.log('Total teams in database:', allTeams?.length || 0);
  
  if (allTeams) {
    // Find Tottenham specifically
    const tottenhamTeams = allTeams.filter(team => 
      team.name.toLowerCase().includes('tottenham') || team.name.toLowerCase().includes('hotspur')
    );
    
    console.log('Tottenham teams found:', tottenhamTeams.length);
    tottenhamTeams.forEach(team => {
      console.log('  -', team.name, '-> slug:', slugify(team.name));
    });
    
    // Test the exact matching logic
    const teamNameSlug = 'tottenham-hotspur';
    console.log('\n🔍 Testing matching logic for:', teamNameSlug);
    
    const matchingTeam = allTeams.find((team) => {
      const teamSlug = slugify(team.name);
      // Handle both formats: with hyphens (tottenham-hotspur) and without (tottenhamhotspur)
      const teamSlugNoHyphens = teamSlug.replace(/-/g, '');
      const targetSlugNoHyphens = teamNameSlug.replace(/-/g, '');
      
      return teamSlug === teamNameSlug || 
             teamSlugNoHyphens === targetSlugNoHyphens;
    });
    
    if (matchingTeam) {
      console.log('✅ Found matching team:', matchingTeam.name);
    } else {
      console.log('❌ No matching team found');
    }
  }
}

testTeamLookup().catch(console.error);





