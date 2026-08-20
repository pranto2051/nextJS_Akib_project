const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAdminSignIn() {
  console.log('Testing admin sign-in...');
  
  // Test with the new admin
  console.log('\n🔐 Testing sign-in with pranto@gmail.com');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'pranto@gmail.com',
    password: 'pranto2024pranto',
  });
  
  if (error) {
    console.error('❌ Sign-in failed:', error.message);
    return false;
  }
  
  console.log('✅ Sign-in successful!');
  console.log('User ID:', data.user.id);
  console.log('Email:', data.user.email);
  console.log('Email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No');
  
  // Test with the old admin
  console.log('\n🔐 Testing sign-in with admin@hostelmanagement.demo');
  const { data: oldAdminData, error: oldAdminError } = await supabase.auth.signInWithPassword({
    email: 'admin@hostelmanagement.demo',
    password: 'Admin@123456',
  });
  
  if (oldAdminError) {
    console.error('❌ Old admin sign-in failed:', oldAdminError.message);
  } else {
    console.log('✅ Old admin sign-in successful!');
    console.log('User ID:', oldAdminData.user.id);
    console.log('Email:', oldAdminData.user.email);
  }
  
  return true;
}

testAdminSignIn();