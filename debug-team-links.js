const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read .env.local file
const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Slugify function (same as in utils.ts)
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')      // Remove all non-word chars
    .replace(/\-\-+/g, '-')        // Replace multiple - with single -
    .replace(/^-+/, '')            // Trim - from start of text
    .replace(/-+$/, '');           // Trim - from end of text
}

async function debugTeamLinks() {
  console.log('🔍 Debugging team links...');
  
  try {
    // Get all teams
    const { data: teams, error: teamsError } = await supabase
      .from('teams_new')
      .select('id, name')
      .order('name');
    
    if (teamsError) {
      throw new Error(`Database error: ${teamsError.message}`);
    }
    
    if (!teams || teams.length === 0) {
      console.log('❌ No teams found in database');
      return;
    }
    
    console.log(`📊 Found ${teams.length} teams in database`);
    
    // Look for Tottenham specifically
    const tottenhamTeams = teams.filter(team => 
      team.name.toLowerCase().includes('tottenham') || 
      team.name.toLowerCase().includes('spurs')
    );
    
    console.log(`📊 Tottenham-related teams: ${tottenhamTeams.length}`);
    tottenhamTeams.forEach(team => {
      const slug = slugify(team.name);
      console.log(`  - "${team.name}" → /team/${slug}`);
    });
    
    // Test the specific URL from the screenshot
    const targetSlug = 'tottenhamhotspur';
    console.log(`\n🎯 Testing target slug: "${targetSlug}"`);
    
    // Find teams that would generate this slug
    const matchingTeams = teams.filter(team => {
      const teamSlug = slugify(team.name);
      return teamSlug === targetSlug;
    });
    
    console.log(`📊 Teams matching "${targetSlug}": ${matchingTeams.length}`);
    matchingTeams.forEach(team => {
      console.log(`  - Found: "${team.name}" (ID: ${team.id})`);
    });
    
    // Show sample teams and their slugs
    console.log('\n📊 Sample teams and their slugs:');
    teams.slice(0, 10).forEach(team => {
      const slug = slugify(team.name);
      console.log(`  - "${team.name}" → /team/${slug}`);
    });
    
    // Check if there are any teams with "Tottenham" in the name
    const tottenhamVariations = teams.filter(team => 
      team.name.toLowerCase().includes('tottenham') ||
      team.name.toLowerCase().includes('spurs') ||
      team.name.toLowerCase().includes('hotspur')
    );
    
    console.log(`\n📊 All Tottenham variations: ${tottenhamVariations.length}`);
    tottenhamVariations.forEach(team => {
      const slug = slugify(team.name);
      console.log(`  - "${team.name}" → /team/${slug}`);
    });
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    process.exit(1);
  }
}

debugTeamLinks();














