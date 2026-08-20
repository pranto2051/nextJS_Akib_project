const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function diagnoseAuth() {
  console.log('Diagnosing auth issues...');
  
  try {
    // Check if we can access auth.users directly (this should work with service role)
    console.log('\n🔍 Checking auth.users table...');
    const { data: authUsers, error: authError } = await supabase
      .from('profiles')
      .select('*')
      .in('email', ['pranto@gmail.com', 'admin@hostelmanagement.demo']);
    
    if (authError) {
      console.error('Error accessing profiles:', authError.message);
    } else {
      console.log('✅ Profiles accessible');
      authUsers.forEach(user => {
        console.log(`   - ${user.email} (ID: ${user.id})`);
      });
    }
    
    // Try to create a new user via auth admin
    console.log('\n🔍 Testing auth admin API...');
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'test123456',
      email_confirm: true,
      user_metadata: {
        name: 'Test User'
      }
    });
    
    if (createError) {
      console.error('❌ Auth admin API failed:', createError.message);
      console.log('This suggests the auth schema may not be properly set up');
    } else {
      console.log('✅ Auth admin API working');
      console.log('Created test user:', newUser.user.id);
      
      // Clean up the test user
      await supabase.auth.admin.deleteUser(newUser.user.id);
      console.log('✅ Cleaned up test user');
    }
    
    // Check if the required auth tables exist
    console.log('\n🔍 Checking database schema...');
    const { data: tables, error: tablesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (tablesError) {
      console.error('Error checking schema:', tablesError.message);
    } else {
      console.log('✅ Basic schema structure exists');
    }
    
  } catch (error) {
    console.error('Diagnosis failed:', error.message);
  }
}

diagnoseAuth();