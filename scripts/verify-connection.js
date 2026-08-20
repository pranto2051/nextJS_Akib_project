const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function verifyConnection() {
  console.log('Verifying Supabase connection...');
  console.log('Project URL:', SUPABASE_URL);
  
  try {
    // Test basic connection by checking profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Connection test failed:', error.message);
      console.log('The database schema may not be set up yet.');
      return false;
    }
    
    console.log('✅ Database connection successful');
    console.log('✅ Profiles table exists');
    
    // Check for admin users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('email', ['admin@hostelmanagement.demo', 'pranto@gmail.com']);
    
    if (profilesError) {
      console.error('Error checking admin users:', profilesError.message);
    } else {
      console.log(`\n👤 Found ${profiles.length} admin user(s):`);
      profiles.forEach(profile => {
        console.log(`   - ${profile.email} (${profile.name})`);
      });
    }
    
    return true;
    
  } catch (error) {
    console.error('Connection verification failed:', error.message);
    return false;
  }
}

verifyConnection();