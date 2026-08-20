# Hostel Management System

A modern Next.js application for hostel and business management with Supabase backend.

## 🚀 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🔐 Admin Access

### Demo Login Credentials

For testing the admin dashboard, use these credentials:

- **Email**: `admin@hostelmanagement.demo`
- **Password**: `Admin@123456`

### Access Admin Dashboard

1. Navigate to [http://localhost:3000/auth](http://localhost:3000)
2. Enter the demo credentials above
3. You'll be redirected to the admin dashboard at [http://localhost:3000/admin](http://localhost:3000)

### Setup Your Own Admin

To create your own admin user:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/jvqykhsahumufhfryjgu/auth/users
2. Click "Add user" > "Create new user"
3. Enter your email and password
4. Enable "Auto Confirm Email"
5. Add user metadata: `{"name": "Your Name"}`
6. Assign super_admin role in the `user_roles` table

## 🛠️ Tech Stack

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: React Query
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── app/              # Next.js app directory
│   ├── admin/        # Admin dashboard pages
│   ├── auth/         # Authentication pages
│   └── page.tsx      # Landing page
├── components/       # React components
│   ├── admin/        # Admin-specific components
│   ├── shared/       # Shared UI components
│   └── ui/           # UI primitives
├── lib/              # Utility functions
├── integrations/     # External service integrations
└── types/            # TypeScript type definitions
```

## 🔧 Environment Setup

Create a `.env` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📊 Admin Dashboard Features

- **Overview**: Live statistics and metrics
- **Request Funnel**: Track lead conversion pipeline
- **Product Interest**: Monitor popular products and categories
- **Content Management**: Manage services, projects, blog posts
- **Contact Messages**: View and respond to inquiries
- **User Management**: Admin roles and permissions

## 🧪 Database Setup

To set up the database schema:

1. Go to your Supabase Dashboard SQL Editor
2. Copy the contents of `supabase/full_database.sql`
3. Execute the SQL script
4. This will create all required tables, functions, and RLS policies

## 🚀 Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 📚 Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
