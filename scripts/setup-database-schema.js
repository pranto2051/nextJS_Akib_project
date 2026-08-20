const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

async function executeDatabaseSchema() {
  console.log('Setting up database schema...');
  
  try {
    // Read the full database schema file
    const schemaPath = path.join(__dirname, '../supabase/full_database.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Schema file loaded');
    
    // Create the SQL execution request
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ sql: schemaSQL })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Error executing schema:', error);
      throw new Error(`Schema execution failed: ${error}`);
    }
    
    console.log('✅ Database schema executed successfully');
    
  } catch (error) {
    console.error('Error executing database schema:', error.message);
    console.log('\n📋 Alternative: Please run the schema manually via Supabase Dashboard');
    console.log('1. Go to: https://supabase.com/dashboard/project/jvqykhsahumufhfryjgu/sql');
    console.log('2. Copy the contents of: supabase/full_database.sql');
    console.log('3. Paste and execute in the SQL Editor');
  }
}

executeDatabaseSchema();