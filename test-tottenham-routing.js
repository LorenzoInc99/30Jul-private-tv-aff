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

async function testTottenhamRouting() {
  console.log('🔍 Testing Tottenham routing...');
  
  try {
    // Get the real Tottenham team (ID: 6)
    const { data: tottenham, error: tottenhamError } = await supabase
      .from('teams_new')
      .select('*')
      .eq('id', 6)
      .single();
    
    if (tottenhamError) {
      console.log(`❌ Error fetching Tottenham: ${tottenhamError.message}`);
      return;
    }
    
    if (!tottenham) {
      console.log('❌ Tottenham not found');
      return;
    }
    
    console.log(`✅ Found Tottenham: "${tottenham.name}" (ID: ${tottenham.id})`);
    
    // Test the slug generation
    const tottenhamSlug = slugify(tottenham.name);
    console.log(`📊 Generated slug: "${tottenhamSlug}"`);
    console.log(`📊 Expected URL: /team/${tottenhamSlug}`);
    
    // Test the URL from the screenshot
    const screenshotSlug = 'tottenhamhotspur';
    console.log(`📊 Screenshot URL: /team/${screenshotSlug}`);
    
    // Check if they match
    if (tottenhamSlug === screenshotSlug) {
      console.log('✅ Slugs match! The routing should work.');
    } else {
      console.log('❌ Slugs don\'t match!');
      console.log(`  - Generated: "${tottenhamSlug}"`);
      console.log(`  - Screenshot: "${screenshotSlug}"`);
    }
    
    // Test the findTeamByName function logic
    console.log('\n🔍 Testing findTeamByName logic...');
    
    // Strategy 1: Get all teams and find the one that slugifies to our target
    const { data: allTeams } = await supabase
      .from('teams_new')
      .select('*')
      .limit(1000);
    
    if (allTeams) {
      // Find the team whose slugified name matches our target
      const matchingTeam = allTeams.find((team) => {
        const teamSlug = slugify(team.name);
        return teamSlug === screenshotSlug;
      });
      
      if (matchingTeam) {
        console.log(`✅ Found matching team: "${matchingTeam.name}" (ID: ${matchingTeam.id})`);
      } else {
        console.log(`❌ No team found with slug "${screenshotSlug}"`);
        
        // Show what slugs we actually have
        console.log('📊 Available Tottenham-related slugs:');
        const tottenhamTeams = allTeams.filter(team => 
          team.name.toLowerCase().includes('tottenham') || 
          team.name.toLowerCase().includes('spurs')
        );
        
        tottenhamTeams.forEach(team => {
          const slug = slugify(team.name);
          console.log(`  - "${team.name}" → "${slug}"`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testTottenhamRouting();














