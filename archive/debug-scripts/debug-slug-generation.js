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

// Slugify function (updated to match frontend utils.ts)
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

async function debugSlugGeneration() {
  console.log('🔍 Debugging slug generation...');
  
  try {
    // Get Bradford City and Tottenham teams
    const { data: teams, error: teamsError } = await supabase
      .from('teams_new')
      .select('*')
      .or('name.ilike.%bradford%,name.ilike.%tottenham%');
    
    if (teamsError) {
      console.log(`❌ Error fetching teams: ${teamsError.message}`);
      return;
    }
    
    if (!teams || teams.length === 0) {
      console.log('❌ No teams found');
      return;
    }
    
    console.log(`📊 Found ${teams.length} teams:`);
    
    teams.forEach(team => {
      const slug = slugify(team.name);
      console.log(`  - "${team.name}" → "${slug}"`);
    });
    
    // Test the specific URLs from the screenshots
    console.log('\n🎯 Testing specific URLs:');
    console.log('  - Frontend now generates: /team/bradford-city');
    console.log('  - Frontend now generates: /team/tottenham-hotspur');
    
    // Check what the backend expects
    const bradfordTeam = teams.find(team => team.name.toLowerCase().includes('bradford'));
    const tottenhamTeam = teams.find(team => team.name.toLowerCase().includes('tottenham'));
    
    if (bradfordTeam) {
      const bradfordSlug = slugify(bradfordTeam.name);
      console.log(`  - Backend expects Bradford: /team/${bradfordSlug}`);
      console.log(`  - Match: ${bradfordSlug === 'bradfordcity' ? '✅' : '❌'}`);
    }
    
    if (tottenhamTeam) {
      const tottenhamSlug = slugify(tottenhamTeam.name);
      console.log(`  - Backend expects Tottenham: /team/${tottenhamSlug}`);
      console.log(`  - Match: ${tottenhamSlug === 'tottenhamhotspur' ? '✅' : '❌'}`);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    process.exit(1);
  }
}

debugSlugGeneration();
