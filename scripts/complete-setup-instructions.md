# Supabase Setup Instructions

## Current Status
✅ Connected to Supabase project: `jvqykhsahumufhfryjgu`
✅ Environment variables configured
✅ Database connection working
✅ Admin users created in profiles table
❌ Auth schema not properly configured (sign-in failing)

## Required Actions

### 1. Execute Database Schema via Supabase Dashboard

Since we cannot execute raw SQL directly through the API, you need to run the schema setup manually:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/jvqykhsahumufhfryjgu/sql
2. Open the SQL Editor
3. Copy the contents of `supabase/full_database.sql` 
4. Paste it into the SQL Editor
5. Click "Run" to execute the schema

This will create all the required tables, types, functions, and Row Level Security policies.

### 2. Create Admin Users via Supabase Dashboard

After the schema is set up, create the admin users:

1. Go to Authentication > Users in your Supabase Dashboard
2. Click "Add user" > "Create new user"
3. Create the first admin:
   - Email: `admin@hostelmanagement.demo`
   - Password: `Admin@123456`
   - Auto Confirm Email: ✅
   - User Metadata: `{"name": "Demo Admin"}`
4. Create the second admin:
   - Email: `pranto@gmail.com`
   - Password: `pranto2024pranto`
   - Auto Confirm Email: ✅
   - User Metadata: `{"name": "MD Pranto Ali"}`

### 3. Assign Super Admin Roles

1. Go to Table Editor in Supabase Dashboard
2. Open the `user_roles` table
3. Add roles for both users:
   - For `admin@hostelmanagement.demo`: Insert row with user_id (from auth.users) and role = 'super_admin'
   - For `pranto@gmail.com`: Insert row with user_id (from auth.users) and role = 'super_admin'

### 4. Test the Setup

After completing the above steps:

1. Test sign-in at: http://localhost:3000/auth
2. Use email: `pranto@gmail.com` and password: `pranto2024pranto`
3. You should be redirected to the admin dashboard

## Alternative: Run Admin User Setup Script

If you prefer to use the script after setting up the schema:

```bash
node scripts/setup-admin-users.js
```

This will:
- Create the admin users via Auth API
- Set up their profiles
- Assign super_admin roles

## Troubleshooting

If you still see "Database error querying schema":

1. Ensure the full database schema has been executed
2. Check that the auth schema is properly initialized
3. Verify that Row Level Security policies are set up correctly
4. Check the Supabase logs for any errors

## Current Credentials

- **Admin 1**: admin@hostelmanagement.demo / Admin@123456
- **Admin 2**: pranto@gmail.com / pranto2024pranto
- **Project URL**: https://jvqykhsahumufhfryjgu.supabase.co
- **Project ID**: jvqykhsahumufhfryjgu