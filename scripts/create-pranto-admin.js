const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createPrantoAdmin() {
  console.log('Creating pranto@gmail.com admin user...');
  
  try {
    // Create the auth user
    console.log('\n🔧 Creating auth user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'pranto@gmail.com',
      password: 'pranto2024pranto',
      email_confirm: true,
      user_metadata: {
        name: 'MD Pranto Ali'
      }
    });
    
    if (authError) {
      console.error('❌ Failed to create auth user:', authError.message);
      
      // If user already exists, try to get the existing user
      if (authError.message.includes('already been registered')) {
        console.log('User already exists, trying to find existing user...');
        
        // Since listUsers is failing, we'll need to use a different approach
        console.log('⚠️ Cannot list users due to auth system issue');
        console.log('🔧 Alternative solution: Use admin@hostelmanagement.demo for now');
        console.log('   Email: admin@hostelmanagement.demo');
        console.log('   Password: Admin@123456');
        return;
      }
      return;
    }
    
    console.log('✅ Auth user created:', authData.user.id);
    
    // Create profile
    console.log('\n🔧 Creating profile...');
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      name: 'MD Pranto Ali',
      email: 'pranto@gmail.com',
      is_active: true
    });
    
    if (profileError) {
      console.error('❌ Failed to create profile:', profileError.message);
    } else {
      console.log('✅ Profile created');
    }
    
    // Create role
    console.log('\n🔧 Creating role...');
    const { error: roleError } = await supabase.from('user_roles').insert({
      user_id: authData.user.id,
      role: 'super_admin'
    });
    
    if (roleError) {
      console.error('❌ Failed to create role:', roleError.message);
    } else {
      console.log('✅ Role created');
    }
    
    console.log('\n🎉 pranto@gmail.com admin user created successfully!');
    console.log('You can now sign in with:');
    console.log('   Email: pranto@gmail.com');
    console.log('   Password: pranto2024pranto');
    
  } catch (error) {
    console.error('Error creating pranto admin:', error.message);
  }
}

createPrantoAdmin();