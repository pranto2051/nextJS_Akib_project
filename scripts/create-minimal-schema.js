const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createMinimalSchema() {
  console.log('Creating minimal database schema...');
  
  try {
    // Check what tables currently exist
    console.log('\n🔍 Checking existing tables...');
    const { data: existingTables, error: tablesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (tablesError) {
      console.log('Profiles table does not exist or is not accessible');
    } else {
      console.log('✅ Profiles table exists');
    }
    
    // Try to check user_roles table
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(1);
    
    if (rolesError) {
      console.log('❌ user_roles table missing or inaccessible:', rolesError.message);
    } else {
      console.log('✅ user_roles table exists');
    }
    
    // Check site_settings table
    const { data: settingsData, error: settingsError } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1);
    
    if (settingsError) {
      console.log('❌ site_settings table missing or inaccessible:', settingsError.message);
    } else {
      console.log('✅ site_settings table exists');
    }
    
    console.log('\n📋 Schema Status:');
    console.log('The auth schema appears to be missing critical tables.');
    console.log('This is causing the "Database error querying schema" issue.');
    
    console.log('\n🔧 Solution:');
    console.log('You need to execute the full database schema.');
    console.log('Please follow these steps:');
    console.log('1. Go to: https://supabase.com/dashboard/project/jvqykhsahumufhfryjgu/sql');
    console.log('2. Open the SQL Editor');
    console.log('3. Copy the contents of: supabase/full_database.sql');
    console.log('4. Paste it into the SQL Editor');
    console.log('5. Click "Run" to execute');
    
    console.log('\n⚠️ This is required because:');
    console.log('- The auth system needs the profiles and user_roles tables');
    console.log('- Row Level Security policies need to be set up');
    console.log('- Custom functions like has_role() need to be created');
    console.log('- These cannot be created via the REST API');
    
  } catch (error) {
    console.error('Error checking schema:', error.message);
  }
}

createMinimalSchema();