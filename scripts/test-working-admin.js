const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testWorkingAdmin() {
  console.log('Testing sign-in with admin@hostelmanagement.demo...');
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@hostelmanagement.demo',
    password: 'Admin@123456'
  });
  
  if (error) {
    console.log('❌ Sign-in failed:', error.message);
  } else {
    console.log('✅ Sign-in successful!');
    console.log('User ID:', data.user.id);
    console.log('Email:', data.user.email);
    console.log('Email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No');
  }
}

testWorkingAdmin();