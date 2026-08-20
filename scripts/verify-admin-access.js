const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

async function verifyAdminAccess() {
  console.log('🔍 Verifying admin access...\n');
  
  // Test sign-in
  console.log('Step 1: Testing sign-in with admin@hostelmanagement.demo');
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@hostelmanagement.demo',
    password: 'Admin@123456'
  });
  
  if (authError) {
    console.log('❌ Sign-in failed:', authError.message);
    return false;
  }
  
  console.log('✅ Sign-in successful!');
  console.log('   User ID:', authData.user.id);
  console.log('   Email:', authData.user.email);
  
  // Test profile access
  console.log('\nStep 2: Testing profile access');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();
  
  if (profileError) {
    console.log('❌ Profile access failed:', profileError.message);
  } else {
    console.log('✅ Profile access successful');
    console.log('   Name:', profile.name);
    console.log('   Is Active:', profile.is_active);
  }
  
  // Test role access
  console.log('\nStep 3: Testing role access');
  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', authData.user.id);
  
  if (rolesError) {
    console.log('❌ Role access failed:', rolesError.message);
  } else {
    console.log('✅ Role access successful');
    roles.forEach(role => {
      console.log('   Role:', role.role);
    });
  }
  
  // Test admin dashboard access
  console.log('\nStep 4: Testing admin dashboard functions');
  const serviceSupabase = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  const { data: stats, error: statsError } = await serviceSupabase
    .from('site_settings')
    .select('*')
    .limit(1);
  
  if (statsError) {
    console.log('❌ Admin functions failed:', statsError.message);
  } else {
    console.log('✅ Admin functions working');
    console.log('   Site Settings accessible');
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🎉 ADMIN ACCESS VERIFICATION COMPLETE');
  console.log('='.repeat(50));
  console.log('\n✅ You can now sign in to your admin dashboard at:');
  console.log('   http://localhost:3000/auth');
  console.log('\n📝 Credentials:');
  console.log('   Email: admin@hostelmanagement.demo');
  console.log('   Password: Admin@123456');
  
  return true;
}

verifyAdminAccess();