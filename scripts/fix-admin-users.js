const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fixAdminUsers() {
  console.log('Fixing admin users...');
  
  try {
    // First, clean up any existing admin users from profiles
    console.log('\n🔍 Cleaning up existing admin profiles...');
    const { data: existingProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('email', ['admin@hostelmanagement.demo', 'pranto@gmail.com']);
    
    if (profilesError) {
      console.error('Error fetching existing profiles:', profilesError.message);
    } else {
      console.log(`Found ${existingProfiles.length} existing admin profiles`);
      
      // Delete existing profiles
      for (const profile of existingProfiles) {
        await supabase.from('profiles').delete().eq('id', profile.id);
        console.log(`Deleted profile for ${profile.email}`);
      }
    }
    
    // Clean up existing roles
    console.log('\n🔍 Cleaning up existing roles...');
    if (existingProfiles && existingProfiles.length > 0) {
      const userIds = existingProfiles.map(p => p.id);
      const { error: roleDeleteError } = await supabase.from('user_roles').delete().in('user_id', userIds);
      if (roleDeleteError) {
        console.log('No existing roles to delete or error deleting roles:', roleDeleteError.message);
      } else {
        console.log('Deleted existing roles');
      }
    }
    
    // Create fresh admin users via auth
    console.log('\n🔧 Creating fresh admin users...');
    
    // Admin 1
    console.log('Creating admin@hostelmanagement.demo...');
    const { data: admin1, error: admin1Error } = await supabase.auth.admin.createUser({
      email: 'admin@hostelmanagement.demo',
      password: 'Admin@123456',
      email_confirm: true,
      user_metadata: {
        name: 'Demo Admin'
      }
    });
    
    if (admin1Error) {
      console.error('❌ Failed to create admin1:', admin1Error.message);
    } else {
      console.log('✅ Created admin1:', admin1.user.id);
      
      // Create profile
      await supabase.from('profiles').insert({
        id: admin1.user.id,
        name: 'Demo Admin',
        email: 'admin@hostelmanagement.demo',
        is_active: true
      });
      
      // Create role
      await supabase.from('user_roles').insert({
        user_id: admin1.user.id,
        role: 'super_admin'
      });
      
      console.log('✅ Admin1 profile and role created');
    }
    
    // Admin 2
    console.log('\nCreating pranto@gmail.com...');
    const { data: admin2, error: admin2Error } = await supabase.auth.admin.createUser({
      email: 'pranto@gmail.com',
      password: 'pranto2024pranto',
      email_confirm: true,
      user_metadata: {
        name: 'MD Pranto Ali'
      }
    });
    
    if (admin2Error) {
      console.error('❌ Failed to create admin2:', admin2Error.message);
    } else {
      console.log('✅ Created admin2:', admin2.user.id);
      
      // Create profile
      await supabase.from('profiles').insert({
        id: admin2.user.id,
        name: 'MD Pranto Ali',
        email: 'pranto@gmail.com',
        is_active: true
      });
      
      // Create role
      await supabase.from('user_roles').insert({
        user_id: admin2.user.id,
        role: 'super_admin'
      });
      
      console.log('✅ Admin2 profile and role created');
    }
    
    // Verify the setup
    console.log('\n🔍 Verifying admin users...');
    const { data: finalProfiles, error: finalError } = await supabase
      .from('profiles')
      .select('*')
      .in('email', ['admin@hostelmanagement.demo', 'pranto@gmail.com']);
    
    if (finalError) {
      console.error('Error verifying:', finalError.message);
    } else {
      // Get roles separately
      const userIds = finalProfiles.map(p => p.id);
      const { data: finalRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .in('user_id', userIds);
      
      console.log('✅ Admin users setup complete:');
      finalProfiles.forEach(profile => {
        const userRole = finalRoles?.find(r => r.user_id === profile.id);
        const role = userRole?.role || 'No role';
        console.log(`   - ${profile.email} (${profile.name}): ${role}`);
      });
    }
    
    console.log('\n🎉 Admin users are now ready for sign-in!');
    
  } catch (error) {
    console.error('Error fixing admin users:', error.message);
  }
}

fixAdminUsers();