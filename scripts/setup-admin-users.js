const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function setupAdminUsers() {
  console.log('Setting up admin users...');

  try {
    // 1. Setup old admin using auth admin API
    console.log('Creating old admin: admin@hostelmanagement.demo');
    const { data: existingOldAdmin } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'admin@hostelmanagement.demo')
      .single();

    let oldAdminId;
    if (!existingOldAdmin) {
      // Create auth user using auth admin API
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'admin@hostelmanagement.demo',
        password: 'Admin@123456',
        email_confirm: true,
        user_metadata: {
          name: 'Demo Admin'
        }
      });

      if (authError) {
        console.error('Error creating auth user:', authError);
        return;
      }

      oldAdminId = authData.user.id;
      console.log('Created old auth user with ID:', oldAdminId);
    } else {
      oldAdminId = existingOldAdmin.id;
      console.log('Old admin already exists with ID:', oldAdminId);
      
      // Try to delete and recreate the user to ensure proper auth setup
      try {
        await supabase.auth.admin.deleteUser(oldAdminId);
        console.log('Deleted old user to recreate with proper auth');
        
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: 'admin@hostelmanagement.demo',
          password: 'Admin@123456',
          email_confirm: true,
          user_metadata: {
            name: 'Demo Admin'
          }
        });

        if (authError) {
          console.error('Error recreating auth user:', authError);
        } else {
          oldAdminId = authData.user.id;
          console.log('Recreated old auth user with ID:', oldAdminId);
        }
      } catch (deleteError) {
        console.log('Could not delete user, will try to update instead');
      }
    }

    // Ensure profile exists
    if (oldAdminId) {
      await supabase.from('profiles').upsert({
        id: oldAdminId,
        name: 'Demo Admin',
        email: 'admin@hostelmanagement.demo',
        is_active: true
      }, { onConflict: 'id' });

      // Ensure role exists
      await supabase.from('user_roles').upsert({
        user_id: oldAdminId,
        role: 'super_admin'
      }, { onConflict: 'user_id,role' });
    }

    // 2. Setup new admin using auth admin API
    console.log('Creating new admin: pranto@gmail.com');
    const { data: existingNewAdmin } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'pranto@gmail.com')
      .single();

    let newAdminId;
    if (!existingNewAdmin) {
      // Create auth user using auth admin API
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'pranto@gmail.com',
        password: 'pranto2024pranto',
        email_confirm: true,
        user_metadata: {
          name: 'MD Pranto Ali'
        }
      });

      if (authError) {
        console.error('Error creating auth user:', authError);
        return;
      }

      newAdminId = authData.user.id;
      console.log('Created new auth user with ID:', newAdminId);
    } else {
      newAdminId = existingNewAdmin.id;
      console.log('New admin already exists with ID:', newAdminId);
      
      // Try to delete and recreate the user to ensure proper auth setup
      try {
        await supabase.auth.admin.deleteUser(newAdminId);
        console.log('Deleted new user to recreate with proper auth');
        
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: 'pranto@gmail.com',
          password: 'pranto2024pranto',
          email_confirm: true,
          user_metadata: {
            name: 'MD Pranto Ali'
          }
        });

        if (authError) {
          console.error('Error recreating auth user:', authError);
        } else {
          newAdminId = authData.user.id;
          console.log('Recreated new auth user with ID:', newAdminId);
        }
      } catch (deleteError) {
        console.log('Could not delete user, will try to update instead');
      }
    }

    // Ensure profile exists
    if (newAdminId) {
      await supabase.from('profiles').upsert({
        id: newAdminId,
        name: 'MD Pranto Ali',
        email: 'pranto@gmail.com',
        is_active: true
      }, { onConflict: 'id' });

      // Ensure role exists
      await supabase.from('user_roles').upsert({
        user_id: newAdminId,
        role: 'super_admin'
      }, { onConflict: 'user_id,role' });
    }

    // 3. Verify admin users
    console.log('\nVerifying admin users...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('email', ['admin@hostelmanagement.demo', 'pranto@gmail.com']);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    } else {
      console.log('Profiles found:', profiles.length);
      
      // Get roles separately
      const userIds = profiles.map(p => p.id);
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .in('user_id', userIds);

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
      } else {
        console.log('Admin users setup complete:');
        profiles.forEach(profile => {
          const userRole = roles.find(r => r.user_id === profile.id);
          console.log(`- ${profile.email} (${profile.name}): ${userRole?.role || 'No role'}`);
        });
      }
    }

  } catch (error) {
    console.error('Error setting up admin users:', error);
  }
}

setupAdminUsers();