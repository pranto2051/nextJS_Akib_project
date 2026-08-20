const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function diagnoseAuthSystem() {
  console.log('🔍 Diagnosing Supabase Auth System...\n');
  
  console.log('Project URL:', SUPABASE_URL);
  console.log('Project ID: jvqykhsahumufhfryjgu\n');
  
  let issues = [];
  
  // Test 1: Basic database connection
  console.log('Test 1: Basic database connection');
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      console.log('❌ Database connection failed:', error.message);
      issues.push('Database connection failed');
    } else {
      console.log('✅ Database connection working');
    }
  } catch (e) {
    console.log('❌ Database connection error:', e.message);
    issues.push('Database connection error');
  }
  
  // Test 2: Auth admin API
  console.log('\nTest 2: Auth admin API');
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: `test-${Date.now()}@demo.com`,
      password: 'Test123456',
      email_confirm: true
    });
    if (error) {
      console.log('❌ Auth admin API failed:', error.message);
      issues.push('Auth admin API failed');
    } else {
      console.log('✅ Auth admin API working');
      // Clean up
      await supabase.auth.admin.deleteUser(data.user.id);
    }
  } catch (e) {
    console.log('❌ Auth admin API error:', e.message);
    issues.push('Auth admin API error');
  }
  
  // Test 3: List users
  console.log('\nTest 3: List users');
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.log('❌ List users failed:', error.message);
      issues.push('List users failed - Database error finding users');
    } else {
      console.log('✅ List users working');
      console.log(`   Total users: ${data.users.length}`);
    }
  } catch (e) {
    console.log('❌ List users error:', e.message);
    issues.push('List users error');
  }
  
  // Test 4: Sign in with client
  console.log('\nTest 4: Client sign-in');
  try {
    const clientSupabase = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { data, error } = await clientSupabase.auth.signInWithPassword({
      email: 'admin@hostelmanagement.demo',
      password: 'Admin@123456'
    });
    if (error) {
      console.log('❌ Client sign-in failed:', error.message);
      issues.push('Client sign-in failed - Database error querying schema');
    } else {
      console.log('✅ Client sign-in working');
    }
  } catch (e) {
    console.log('❌ Client sign-in error:', e.message);
    issues.push('Client sign-in error');
  }
  
  // Diagnosis
  console.log('\n' + '='.repeat(50));
  console.log('DIAGNOSIS RESULTS');
  console.log('='.repeat(50));
  
  if (issues.length === 0) {
    console.log('✅ All tests passed. The auth system is working correctly.');
    console.log('The issue might be with specific user accounts.');
  } else {
    console.log('❌ Found issues:');
    issues.forEach(issue => console.log(`   - ${issue}`));
    
    console.log('\n🔧 RECOMMENDED SOLUTIONS:');
    console.log('1. Restart your Supabase project:');
    console.log('   - Go to: https://supabase.com/dashboard/project/jvqykhsahumufhfryjgu/settings/general');
    console.log('   - Click "Restart project"');
    console.log('   - Wait 2-3 minutes for the project to restart');
    
    console.log('\n2. Check Supabase status:');
    console.log('   - Visit: https://status.supabase.com/');
    console.log('   - Check if there are any ongoing issues');
    
    console.log('\n3. If issues persist after restart:');
    console.log('   - Contact Supabase support');
    console.log('   - Mention "Database error querying schema" and "Database error finding users"');
    console.log('   - Project ID: jvqykhsahumufhfryjgu');
  }
}

diagnoseAuthSystem();