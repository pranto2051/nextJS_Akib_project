const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function recreateProfiles() {
  console.log('Recreating admin profiles for existing auth users...');
  
  try {
    // First, let's find existing auth users by listing all users
    console.log('\n🔍 Finding existing auth users...');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError.message);
      return;
    }
    
    console.log(`Found ${users.length} total users in auth system`);
    
    // Find our target users
    const admin1User = users.find(u => u.email === 'admin@hostelmanagement.demo');
    const admin2User = users.find(u => u.email === 'pranto@gmail.com');
    
    console.log('\n🔍 Target users:');
    console.log(`Admin1 (admin@hostelmanagement.demo): ${admin1User ? 'Found' : 'Not found'}`);
    console.log(`Admin2 (pranto@gmail.com): ${admin2User ? 'Found' : 'Not found'}`);
    
    // Recreate profiles for existing auth users
    if (admin1User) {
      console.log('\n🔧 Creating profile for admin@hostelmanagement.demo...');
      const { error: profileError } = await supabase.from('profiles').insert({
        id: admin1User.id,
        name: 'Demo Admin',
        email: admin1User.email,
        is_active: true
      });
      
      if (profileError) {
        console.error('Error creating profile:', profileError.message);
      } else {
        console.log('✅ Profile created for admin1');
        
        // Create role
        const { error: roleError } = await supabase.from('user_roles').insert({
          user_id: admin1User.id,
          role: 'super_admin'
        });
        
        if (roleError) {
          console.error('Error creating role:', roleError.message);
        } else {
          console.log('✅ Role created for admin1');
        }
      }
    }
    
    if (admin2User) {
      console.log('\n🔧 Creating profile for pranto@gmail.com...');
      const { error: profileError } = await supabase.from('profiles').insert({
        id: admin2User.id,
        name: 'MD Pranto Ali',
        email: admin2User.email,
        is_active: true
      });
      
      if (profileError) {
        console.error('Error creating profile:', profileError.message);
      } else {
        console.log('✅ Profile created for admin2');
        
        // Create role
        const { error: roleError } = await supabase.from('user_roles').insert({
          user_id: admin2User.id,
          role: 'super_admin'
        });
        
        if (roleError) {
          console.error('Error creating role:', roleError.message);
        } else {
          console.log('✅ Role created for admin2');
        }
      }
    }
    
    // If admin2 doesn't exist, try to create it fresh
    if (!admin2User) {
      console.log('\n🔧 Creating new auth user for pranto@gmail.com...');
      const { data: newAdmin2, error: createError } = await supabase.auth.admin.createUser({
        email: 'pranto@gmail.com',
        password: 'pranto2024pranto',
        email_confirm: true,
        user_metadata: {
          name: 'MD Pranto Ali'
        }
      });
      
      if (createError) {
        console.error('❌ Failed to create admin2:', createError.message);
      } else {
        console.log('✅ Created new auth user for admin2:', newAdmin2.user.id);
        
        // Create profile
        await supabase.from('profiles').insert({
          id: newAdmin2.user.id,
          name: 'MD Pranto Ali',
          email: 'pranto@gmail.com',
          is_active: true
        });
        
        // Create role
        await supabase.from('user_roles').insert({
          user_id: newAdmin2.user.id,
          role: 'super_admin'
        });
        
        console.log('✅ Profile and role created for new admin2');
      }
    }
    
    // Verify final setup
    console.log('\n🔍 Verifying final setup...');
    const { data: finalProfiles, error: finalError } = await supabase
      .from('profiles')
      .select('*')
      .in('email', ['admin@hostelmanagement.demo', 'pranto@gmail.com']);
    
    if (finalError) {
      console.error('Error verifying:', finalError.message);
    } else {
      // Get roles separately
      const userIds = finalProfiles.map(p => p.id);
      const { data: finalRoles } = await supabase
        .from('user_roles')
        .select('*')
        .in('user_id', userIds);
      
      console.log('✅ Final admin users setup:');
      finalProfiles.forEach(profile => {
        const userRole = finalRoles?.find(r => r.user_id === profile.id);
        const role = userRole?.role || 'No role';
        console.log(`   - ${profile.email} (${profile.name}): ${role}`);
      });
    }
    
    console.log('\n🎉 Admin profiles recreation complete!');
    
  } catch (error) {
    console.error('Error recreating profiles:', error.message);
  }
}

recreateProfiles();