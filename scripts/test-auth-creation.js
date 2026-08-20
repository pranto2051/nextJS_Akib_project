const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testAuthCreation() {
  console.log('Testing auth user creation...');
  
  try {
    // First, let's try to create a simple test user
    console.log('\n🔍 Attempting to create a test user...');
    const { data: testUser, error: createError } = await supabase.auth.admin.createUser({
      email: 'test-auth@demo.com',
      password: 'Test123456',
      email_confirm: true,
      user_metadata: {
        name: 'Auth Test User'
      }
    });
    
    if (createError) {
      console.error('❌ Auth user creation failed:', createError.message);
      console.error('Error details:', createError);
      
      if (createError.message.includes('Database error')) {
        console.log('\n🔧 This indicates the auth schema has issues.');
        console.log('The auth service cannot query its own database tables.');
        console.log('\nSolutions:');
        console.log('1. Restart your Supabase project (in Dashboard > Settings > General)');
        console.log('2. Check if the auth service is running properly');
        console.log('3. Contact Supabase support if the issue persists');
      }
      return false;
    }
    
    console.log('✅ Test user created successfully:', testUser.user.id);
    
    // Clean up the test user
    await supabase.auth.admin.deleteUser(testUser.user.id);
    console.log('✅ Test user cleaned up');
    
    console.log('\n✅ Auth system is working correctly!');
    console.log('The issue might be with specific user accounts or email configuration.');
    
    return true;
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
    return false;
  }
}

testAuthCreation();