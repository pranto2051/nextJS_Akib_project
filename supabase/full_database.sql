drop table if exists public.product_requests cascade;
drop table if exists public.products cascade;
drop table if exists public.product_categories cascade;
drop table if exists public.faqs cascade;
drop table if exists public.media_files cascade;
drop table if exists public.newsletter_subscribers cascade;
drop table if exists public.contact_messages cascade;
drop table if exists public.applications cascade;
drop table if exists public.careers cascade;
drop table if exists public.testimonials cascade;
drop table if exists public.team_members cascade;
drop table if exists public.blog_posts cascade;
drop table if exists public.categories cascade;
drop table if exists public.projects cascade;
drop table if exists public.services cascade;
drop table if exists public.site_settings cascade;
drop table if exists public.admin_activity_log cascade;
drop table if exists public.user_roles cascade;
drop table if exists public.profiles cascade;

drop type if exists public.request_status cascade;
drop type if exists public.product_kind cascade;
drop type if exists public.message_status cascade;
drop type if exists public.application_status cascade;
drop type if exists public.employment_type cascade;
drop type if exists public.app_role cascade;

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create type public.app_role as enum (
  'super_admin',
  'admin',
  'manager',
  'staff'
);

create type public.employment_type as enum (
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'INTERNSHIP',
  'REMOTE'
);

create type public.application_status as enum (
  'PENDING',
  'REVIEWING',
  'SHORTLISTED',
  'REJECTED',
  'HIRED'
);

create type public.message_status as enum (
  'UNREAD',
  'READ',
  'REPLIED',
  'ARCHIVED'
);

create type public.product_kind as enum (
  'SOFTWARE',
  'HARDWARE',
  'MOBILE_APP',
  'WEB_APP'
);

create type public.request_status as enum (
  'NEW',
  'CONTACTED',
  'INTERESTED',
  'CONVERTED',
  'LOST'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  avatar_url text,
  phone text,
  bio text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create or replace function public.has_role(
  _user_id uuid,
  _role public.app_role
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
    and role = _role
  );
$$;

create or replace function public.has_min_role(
  _user_id uuid,
  _role public.app_role
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles r
    where r.user_id = _user_id
    and case r.role
      when 'super_admin' then 4
      when 'admin' then 3
      when 'manager' then 2
      else 1
    end
    >=
    case _role
      when 'super_admin' then 4
      when 'admin' then 3
      when 'manager' then 2
      else 1
    end
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    name,
    email
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    new.email
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

create policy "read own or admin profiles"
on public.profiles
for select
to authenticated
using (
  auth.uid() = id
  or public.has_min_role(auth.uid(), 'admin')
);

create policy "update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "admins update profiles"
on public.profiles
for update
to authenticated
using (public.has_min_role(auth.uid(), 'admin'))
with check (public.has_min_role(auth.uid(), 'admin'));

create policy "read roles"
on public.user_roles
for select
to authenticated
using (
  auth.uid() = user_id
  or public.has_min_role(auth.uid(), 'admin')
);

create trigger trg_profiles_updated
before update on public.profiles
for each row
execute function public.set_updated_at();

create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  site_name text not null default 'Hostel Management',
  tagline text not null default 'Smart Technology Solutions for Modern Businesses',
  logo_url text,
  logo_text text not null default 'Hostel Management',
  favicon_url text,
  address text not null default 'Level 8, Tech Tower, Banani 11',
  city text not null default 'Dhaka 1213',
  country text not null default 'Bangladesh',
  postal_code text not null default '1213',
  phone text not null default '+880 1700 000000',
  whatsapp text not null default '+880 1700 000000',
  email text not null default 'info@hostelmanagement.com',
  email_support text not null default 'support@hostelmanagement.com',
  email_sales text not null default 'sales@hostelmanagement.com',
  business_hours text not null default 'Sunday – Thursday, 9:00 AM – 6:00 PM (BST)',
  founded_year text not null default '2019',
  facebook text,
  twitter text,
  instagram text,
  linkedin text,
  youtube text,
  github text,
  meta_title text not null default 'Hostel Management — Smart Technology Solutions',
  meta_description text not null default 'Enterprise software, hostel management systems and custom business solutions built in Dhaka for the world.',
  meta_keywords text not null default 'hostel management, software development, enterprise software, Dhaka',
  og_image_url text,
  google_analytics_id text,
  google_maps_embed_url text,
  latitude text,
  longitude text,
  primary_color text not null default '#6366F1',
  accent_color text not null default '#06B6D4',
  background_color text not null default '#0A0A0F',
  surface_color text not null default '#111118',
  text_color text not null default '#F1F5F9',
  text_muted_color text not null default '#94A3B8',
  border_color text not null default '#2A2A38',
  gradient_start text not null default '#6366F1',
  gradient_end text not null default '#06B6D4',
  display_font text not null default 'Plus Jakarta Sans',
  body_font text not null default 'Inter',
  custom_css text,
  hero_eyebrow text not null default 'Trusted by 120+ teams across Asia',
  hero_headline text not null default 'Smart technology solutions for modern businesses',
  hero_subheadline text not null default 'We design and engineer hostel management platforms, enterprise software and custom business systems that scale with you.',
  hero_cta_primary_text text not null default 'Get Started',
  hero_cta_primary_url text not null default '/contact',
  hero_cta_secondary_text text not null default 'View Projects',
  hero_cta_secondary_url text not null default '/projects',
  hero_image_url text,
  stats jsonb not null default '[]'::jsonb,
  trusted_by_logos jsonb not null default '[]'::jsonb,
  maintenance_mode boolean not null default false,
  maintenance_message text not null default 'We are updating our systems. Back soon!',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

grant select on public.site_settings to anon;
grant select, update on public.site_settings to authenticated;
grant all on public.site_settings to service_role;

create policy "public read settings"
on public.site_settings
for select
using (true);

create policy "admins update settings"
on public.site_settings
for update
to authenticated
using (public.has_min_role(auth.uid(), 'admin'))
with check (public.has_min_role(auth.uid(), 'admin'));

create trigger trg_settings_updated
before update on public.site_settings
for each row
execute function public.set_updated_at();

create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_desc text not null,
  long_desc text not null default '',
  icon_name text not null default 'Sparkles',
  image_url text,
  features jsonb not null default '[]'::jsonb,
  benefits jsonb not null default '[]'::jsonb,
  tech_stack jsonb not null default '[]'::jsonb,
  pricing_overview text,
  faqs jsonb not null default '[]'::jsonb,
  meta_title text,
  meta_desc text,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_desc text not null,
  long_desc text not null default '',
  category text not null default 'Software',
  client_name text,
  project_url text,
  github_url text,
  cover_image_url text,
  images jsonb not null default '[]'::jsonb,
  tech_stack jsonb not null default '[]'::jsonb,
  features jsonb not null default '[]'::jsonb,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  completed_at timestamptz,
  meta_title text,
  meta_desc text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content text not null default '',
  cover_image_url text,
  category_id uuid references public.categories(id) on delete set null,
  tags jsonb not null default '[]'::jsonb,
  author_name text not null default 'Hostel Management Team',
  is_featured boolean not null default false,
  is_published boolean not null default false,
  published_at timestamptz,
  views integer not null default 0,
  reading_time integer,
  meta_title text,
  meta_desc text,
  meta_keywords text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  designation text not null,
  department text,
  bio text,
  image_url text,
  email text,
  linkedin text,
  twitter text,
  github text,
  is_leadership boolean not null default false,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  designation text not null,
  company text not null,
  avatar_url text,
  review text not null,
  rating integer not null default 5 check (rating between 1 and 5),
  is_featured boolean not null default false,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.careers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  department text not null,
  location text not null,
  type public.employment_type not null default 'FULL_TIME',
  experience text not null default '2+ years',
  salary text,
  description text not null default '',
  requirements jsonb not null default '[]'::jsonb,
  benefits jsonb not null default '[]'::jsonb,
  is_published boolean not null default true,
  deadline timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  career_id uuid not null references public.careers(id) on delete cascade,
  name text not null,
  email text not null,
  phone text not null,
  cover_letter text not null,
  resume_url text,
  status public.application_status not null default 'PENDING',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  company text,
  service text,
  budget text,
  message text not null,
  status public.message_status not null default 'UNREAD',
  notes text,
  replied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.media_files (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  storage_path text not null,
  format text not null default 'image',
  size integer not null default 0,
  width integer,
  height integer,
  folder text,
  alt_text text,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  icon_name text,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  display_name text not null,
  slug text not null unique,
  kind public.product_kind not null default 'SOFTWARE',
  tagline text not null default '',
  description text not null default '',
  icon_name text not null default 'Package',
  image_url text,
  features jsonb not null default '[]'::jsonb,
  product_url text,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  category_id uuid references public.product_categories(id) on delete set null,
  gallery_images jsonb not null default '[]'::jsonb,
  benefits jsonb not null default '[]'::jsonb,
  hardware_specs jsonb not null default '[]'::jsonb,
  price_note text,
  show_request_button boolean not null default true,
  meta_title text,
  meta_desc text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  product_id uuid references public.products(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_requests (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  phone text not null,
  message text,
  status public.request_status not null default 'NEW',
  assigned_to uuid references public.profiles(id) on delete set null,
  notes text,
  source text not null default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admin_activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  actor_name text,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  detail jsonb,
  created_at timestamptz not null default now()
);

alter table public.services enable row level security;
alter table public.projects enable row level security;
alter table public.categories enable row level security;
alter table public.blog_posts enable row level security;
alter table public.team_members enable row level security;
alter table public.testimonials enable row level security;
alter table public.faqs enable row level security;
alter table public.careers enable row level security;
alter table public.applications enable row level security;
alter table public.contact_messages enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.media_files enable row level security;
alter table public.products enable row level security;
alter table public.product_categories enable row level security;
alter table public.product_requests enable row level security;
alter table public.admin_activity_log enable row level security;

grant select, insert, update, delete on public.services to authenticated;
grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.categories to authenticated;
grant select, insert, update, delete on public.blog_posts to authenticated;
grant select, insert, update, delete on public.team_members to authenticated;
grant select, insert, update, delete on public.testimonials to authenticated;
grant select, insert, update, delete on public.faqs to authenticated;
grant select, insert, update, delete on public.careers to authenticated;
grant select, insert, update, delete on public.applications to authenticated;
grant select, insert, update, delete on public.contact_messages to authenticated;
grant select, insert, update, delete on public.newsletter_subscribers to authenticated;
grant select, insert, update, delete on public.media_files to authenticated;
grant select, insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.product_categories to authenticated;
grant select, insert, update, delete on public.product_requests to authenticated;
grant select, insert on public.admin_activity_log to authenticated;

grant all on public.services to service_role;
grant all on public.projects to service_role;
grant all on public.categories to service_role;
grant all on public.blog_posts to service_role;
grant all on public.team_members to service_role;
grant all on public.testimonials to service_role;
grant all on public.faqs to service_role;
grant all on public.careers to service_role;
grant all on public.applications to service_role;
grant all on public.contact_messages to service_role;
grant all on public.newsletter_subscribers to service_role;
grant all on public.media_files to service_role;
grant all on public.products to service_role;
grant all on public.product_categories to service_role;
grant all on public.product_requests to service_role;
grant all on public.admin_activity_log to service_role;

grant select on public.services to anon;
grant select on public.projects to anon;
grant select on public.categories to anon;
grant select on public.blog_posts to anon;
grant select on public.team_members to anon;
grant select on public.testimonials to anon;
grant select on public.faqs to anon;
grant select on public.careers to anon;
grant select on public.products to anon;
grant select on public.product_categories to anon;

grant insert on public.applications to anon;
grant insert on public.contact_messages to anon;
grant insert on public.newsletter_subscribers to anon;
grant insert on public.product_requests to anon;

create policy "public read services"
on public.services
for select
using (
  is_published
  or public.has_min_role(auth.uid(), 'manager')
);

create policy "managers write services"
on public.services
for all
to authenticated
using (public.has_min_role(auth.uid(), 'manager'))
with check (public.has_min_role(auth.uid(), 'manager'));

create policy "public read projects"
on public.projects
for select
using (
  is_published
  or public.has_min_role(auth.uid(), 'manager')
);

create policy "managers write projects"
on public.projects
for all
to authenticated
using (public.has_min_role(auth.uid(), 'manager'))
with check (public.has_min_role(auth.uid(), 'manager'));

create policy "public read categories"
on public.categories
for select
using (true);

create policy "managers write categories"
on public.categories
for all
to authenticated
using (public.has_min_role(auth.uid(), 'manager'))
with check (public.has_min_role(auth.uid(), 'manager'));

create policy "public read posts"
on public.blog_posts
for select
using (
  is_published
  or public.has_min_role(auth.uid(), 'manager')
);

create policy "managers write posts"
on public.blog_posts
for all
to authenticated
using (public.has_min_role(auth.uid(), 'manager'))
with check (public.has_min_role(auth.uid(), 'manager'));

create policy "public read team"
on public.team_members
for select
using (
  is_published
  or public.has_min_role(auth.uid(), 'admin')
);

create policy "admins write team"
on public.team_members
for all
to authenticated
using (public.has_min_role(auth.uid(), 'admin'))
with check (public.has_min_role(auth.uid(), 'admin'));

create policy "public read testimonials"
on public.testimonials
for select
using (
  is_published
  or public.has_min_role(auth.uid(), 'manager')
);

create policy "managers write testimonials"
on public.testimonials
for all
to authenticated
using (public.has_min_role(auth.uid(), 'manager'))
with check (public.has_min_role(auth.uid(), 'manager'));

create policy "public read faqs"
on public.faqs
for select
using (
  is_published
  or public.has_min_role(auth.uid(), 'manager')
);

create policy "managers write faqs"
on public.faqs
for all
to authenticated
using (public.has_min_role(auth.uid(), 'manager'))
with check (public.has_min_role(auth.uid(), 'manager'));

create policy "public read careers"
on public.careers
for select
using (
  is_published
  or public.has_min_role(auth.uid(), 'manager')
);

create policy "managers write careers"
on public.careers
for all
to authenticated
using (public.has_min_role(auth.uid(), 'manager'))
with check (public.has_min_role(auth.uid(), 'manager'));

create policy "anyone applies"
on public.applications
for insert
with check (true);

create policy "staff read applications"
on public.applications
for select
to authenticated
using (public.has_min_role(auth.uid(), 'staff'));

create policy "staff update applications"
on public.applications
for update
to authenticated
using (public.has_min_role(auth.uid(), 'staff'))
with check (public.has_min_role(auth.uid(), 'staff'));

create policy "anyone submits message"
on public.contact_messages
for insert
with check (true);

create policy "staff read messages"
on public.contact_messages
for select
to authenticated
using (public.has_min_role(auth.uid(), 'staff'));

create policy "staff update messages"
on public.contact_messages
for update
to authenticated
using (public.has_min_role(auth.uid(), 'staff'))
with check (public.has_min_role(auth.uid(), 'staff'));

create policy "anyone subscribes"
on public.newsletter_subscribers
for insert
with check (true);

create policy "staff read subscribers"
on public.newsletter_subscribers
for select
to authenticated
using (public.has_min_role(auth.uid(), 'staff'));

create policy "team manage media"
on public.media_files
for all
to authenticated
using (public.has_min_role(auth.uid(), 'staff'))
with check (public.has_min_role(auth.uid(), 'staff'));

create policy "public read product categories"
on public.product_categories
for select
to anon, authenticated
using (true);

create policy "managers write product categories"
on public.product_categories
for all
to authenticated
using (public.has_min_role(auth.uid(), 'manager'))
with check (public.has_min_role(auth.uid(), 'manager'));

create policy "products public read"
on public.products
for select
to anon, authenticated
using (
  is_published = true
  or public.has_min_role(auth.uid(), 'staff')
);

create policy "products staff manage"
on public.products
for all
to authenticated
using (public.has_min_role(auth.uid(), 'staff'))
with check (public.has_min_role(auth.uid(), 'staff'));

create policy "anyone can submit product request"
on public.product_requests
for insert
to anon, authenticated
with check (true);

create policy "staff read product requests"
on public.product_requests
for select
to authenticated
using (public.has_min_role(auth.uid(), 'staff'));

create policy "staff update product requests"
on public.product_requests
for update
to authenticated
using (public.has_min_role(auth.uid(), 'staff'))
with check (public.has_min_role(auth.uid(), 'staff'));

create policy "admins read activity log"
on public.admin_activity_log
for select
to authenticated
using (public.has_min_role(auth.uid(), 'admin'));

create policy "staff write activity log"
on public.admin_activity_log
for insert
to authenticated
with check (public.has_min_role(auth.uid(), 'staff'));

create trigger trg_services_updated
before update on public.services
for each row
execute function public.set_updated_at();

create trigger trg_projects_updated
before update on public.projects
for each row
execute function public.set_updated_at();

create trigger trg_categories_updated
before update on public.categories
for each row
execute function public.set_updated_at();

create trigger trg_blog_posts_updated
before update on public.blog_posts
for each row
execute function public.set_updated_at();

create trigger trg_team_members_updated
before update on public.team_members
for each row
execute function public.set_updated_at();

create trigger trg_testimonials_updated
before update on public.testimonials
for each row
execute function public.set_updated_at();

create trigger trg_faqs_updated
before update on public.faqs
for each row
execute function public.set_updated_at();

create trigger trg_careers_updated
before update on public.careers
for each row
execute function public.set_updated_at();

create trigger trg_applications_updated
before update on public.applications
for each row
execute function public.set_updated_at();

create trigger trg_contact_messages_updated
before update on public.contact_messages
for each row
execute function public.set_updated_at();

create trigger trg_newsletter_updated
before update on public.newsletter_subscribers
for each row
execute function public.set_updated_at();

create trigger trg_media_updated
before update on public.media_files
for each row
execute function public.set_updated_at();

create trigger trg_products_updated
before update on public.products
for each row
execute function public.set_updated_at();

create trigger trg_product_categories_updated
before update on public.product_categories
for each row
execute function public.set_updated_at();

create trigger trg_product_requests_updated
before update on public.product_requests
for each row
execute function public.set_updated_at();

create index idx_product_requests_product
on public.product_requests(product_id);

create index idx_product_requests_status
on public.product_requests(status);

create index idx_activity_created
on public.admin_activity_log(created_at desc);

create index idx_products_category
on public.products(category_id);

create index idx_products_published
on public.products(is_published);

create index idx_blog_posts_category
on public.blog_posts(category_id);

insert into public.site_settings (
  linkedin,
  facebook,
  twitter,
  github,
  google_maps_embed_url,
  stats,
  trusted_by_logos
)
values (
  'https://linkedin.com/company/hostelmanagement',
  'https://facebook.com/hostelmanagement',
  'https://x.com/hostelmgmt',
  'https://github.com/hostelmanagement',
  'https://www.google.com/maps?q=Banani%20Dhaka&output=embed',
  '[{"label":"Projects delivered","value":180,"suffix":"+"},{"label":"Enterprise clients","value":64,"suffix":"+"},{"label":"Team members","value":42,"suffix":""},{"label":"Client retention","value":97,"suffix":"%"}]'::jsonb,
  '[{"name":"Northwind"},{"name":"Bengal Bank"},{"name":"Aurora Labs"},{"name":"Sundarban Group"},{"name":"Meghna Tech"},{"name":"Riverstone"}]'::jsonb
);

insert into public.services (
  title,
  slug,
  short_desc,
  long_desc,
  icon_name,
  features,
  benefits,
  tech_stack,
  pricing_overview,
  sort_order
)
values
(
  'Hostel Management Systems',
  'hostel-management-systems',
  'End-to-end platforms for room allocation, billing, attendance and resident care.',
  '<p>Our flagship product line. We build hostel and dormitory platforms that handle admissions, room and bed allocation, meal plans, fee collection, visitor logs and warden reporting in one place.</p>',
  'Building',
  '["Room & bed allocation","Automated fee invoicing","Attendance & gate logs","Meal plan management","Warden and parent portals"]'::jsonb,
  '["Cut manual admin by 70%","Zero double-booked beds","Real-time occupancy insight"]'::jsonb,
  '["React","TypeScript","Postgres","Node"]'::jsonb,
  'From $6,000 per deployment',
  1
),
(
  'Custom Software Development',
  'custom-software-development',
  'Bespoke systems engineered around the way your business actually works.',
  '<p>When off-the-shelf software forces you to change your process, we build the process into the software instead. Discovery, architecture, delivery and long-term support.</p>',
  'Code2',
  '["Discovery & architecture","Agile delivery sprints","Automated testing","Long-term support"]'::jsonb,
  '["Own your roadmap","No per-seat licence creep"]'::jsonb,
  '["React","Node","Postgres","Docker"]'::jsonb,
  'Team-based, from $9,000/month',
  2
),
(
  'Web Application Development',
  'web-application-development',
  'Fast, accessible, SEO-ready web applications built on a modern stack.',
  '<p>Progressive web applications with server rendering, edge caching and design systems that stay consistent as your product grows.</p>',
  'Globe',
  '["Server-side rendering","Design system","Accessibility audit","Edge deployment"]'::jsonb,
  '["Sub-second page loads","Search-engine visible"]'::jsonb,
  '["React","Vite","Tailwind","Cloudflare"]'::jsonb,
  'From $4,500',
  3
),
(
  'Mobile App Development',
  'mobile-app-development',
  'Cross-platform iOS and Android apps sharing one codebase.',
  '<p>Native-feeling mobile applications with offline support, push notifications and store submission handled for you.</p>',
  'Smartphone',
  '["iOS & Android","Offline-first sync","Push notifications","Store submission"]'::jsonb,
  '["One codebase, two stores","Faster release cycles"]'::jsonb,
  '["React Native","Expo","Supabase"]'::jsonb,
  'From $7,500',
  4
),
(
  'Enterprise ERP & CRM',
  'enterprise-erp-crm',
  'Inventory, finance, HR and customer pipelines in one connected system.',
  '<p>Modular ERP and CRM implementations with role-based access, audit trails and reporting your finance team will actually trust.</p>',
  'Boxes',
  '["Inventory & procurement","Finance & payroll","Sales pipeline","Audit trails"]'::jsonb,
  '["Single source of truth","Board-ready reporting"]'::jsonb,
  '["Postgres","React","Node"]'::jsonb,
  'From $15,000',
  5
),
(
  'Cloud & DevOps',
  'cloud-devops',
  'Reliable infrastructure, CI/CD pipelines and cost-aware cloud architecture.',
  '<p>We containerise, automate and monitor your stack so releases are boring and outages are rare.</p>',
  'Cloud',
  '["CI/CD pipelines","Container orchestration","Monitoring & alerting","Cost optimisation"]'::jsonb,
  '["Deploy many times a day","Lower cloud spend"]'::jsonb,
  '["Docker","Terraform","Cloudflare","Grafana"]'::jsonb,
  'From $2,500/month',
  6
),
(
  'IoT & Device Integration',
  'iot-device-integration',
  'Connect gates, sensors and biometric devices to your software.',
  '<p>Biometric attendance, smart locks, energy meters and RFID gates streamed into a single dashboard.</p>',
  'Cpu',
  '["Biometric attendance","RFID & smart locks","Sensor telemetry","Realtime dashboards"]'::jsonb,
  '["Physical world, digital record","Instant anomaly alerts"]'::jsonb,
  '["MQTT","Node","Postgres"]'::jsonb,
  'Scoped per site',
  7
),
(
  'AI Integration',
  'ai-integration',
  'Practical AI features: assistants, document extraction and forecasting.',
  '<p>We add AI where it pays for itself — extracting data from documents, answering resident questions and forecasting occupancy.</p>',
  'Sparkles',
  '["Document extraction","Support assistants","Occupancy forecasting","Human-in-the-loop review"]'::jsonb,
  '["Hours back every week","Fewer manual errors"]'::jsonb,
  '["OpenAI","Gemini","Postgres"]'::jsonb,
  'From $3,500',
  8
);

insert into public.projects (
  title,
  slug,
  short_desc,
  long_desc,
  category,
  client_name,
  tech_stack,
  features,
  is_featured,
  completed_at
)
values
(
  'Sundarban Hostel Suite',
  'sundarban-hostel-suite',
  'A 2,400-bed hostel platform covering admissions, billing and warden reporting.',
  '<p>Replaced eleven spreadsheets and a paper ledger with a single platform used daily by 40 staff across six buildings.</p>',
  'Hostel Management',
  'Sundarban Group',
  '["React","Postgres","Node"]'::jsonb,
  '["Bed allocation","Fee automation","Gate logs"]'::jsonb,
  true,
  '2024-11-02'
),
(
  'Bengal Bank Operations Portal',
  'bengal-bank-operations-portal',
  'Internal operations portal serving 1,200 branch staff.',
  '<p>Consolidated seven internal tools into one role-aware portal with a full audit trail.</p>',
  'Enterprise Software',
  'Bengal Bank',
  '["React","TypeScript","Postgres"]'::jsonb,
  '["Role-based access","Audit trail","Reporting"]'::jsonb,
  true,
  '2024-06-18'
),
(
  'Meghna Fleet Tracker',
  'meghna-fleet-tracker',
  'Realtime GPS and maintenance tracking for a 300-vehicle fleet.',
  '<p>Live telemetry, service scheduling and driver scorecards in one dashboard.</p>',
  'IoT',
  'Meghna Tech',
  '["MQTT","Node","React"]'::jsonb,
  '["Live tracking","Service scheduling","Driver scores"]'::jsonb,
  true,
  '2025-02-10'
),
(
  'Aurora Learning App',
  'aurora-learning-app',
  'Cross-platform learning app with offline lessons.',
  '<p>Offline-first mobile learning for students on unreliable connections.</p>',
  'Mobile',
  'Aurora Labs',
  '["React Native","Expo"]'::jsonb,
  '["Offline lessons","Progress sync"]'::jsonb,
  false,
  '2024-09-05'
),
(
  'Riverstone Commerce',
  'riverstone-commerce',
  'Headless storefront with same-day delivery slots.',
  '<p>A headless commerce build that cut checkout abandonment by a third.</p>',
  'Web Application',
  'Riverstone',
  '["React","Vite","Postgres"]'::jsonb,
  '["Delivery slots","Headless CMS"]'::jsonb,
  false,
  '2025-04-22'
),
(
  'Northwind Analytics Cloud',
  'northwind-analytics-cloud',
  'Data warehouse and dashboards for a distribution group.',
  '<p>Nightly pipelines feeding executive dashboards used in every board meeting.</p>',
  'Cloud',
  'Northwind',
  '["Postgres","Docker","Grafana"]'::jsonb,
  '["ETL pipelines","Executive dashboards"]'::jsonb,
  false,
  '2025-01-15'
);

insert into public.categories (
  name,
  slug,
  description,
  color
)
values
(
  'Engineering',
  'engineering',
  'Deep dives from our engineering team',
  '#6366F1'
),
(
  'Product',
  'product',
  'Product thinking and design',
  '#06B6D4'
),
(
  'Company',
  'company',
  'News from Hostel Management',
  '#8B5CF6'
);

insert into public.blog_posts (
  title,
  slug,
  excerpt,
  content,
  category_id,
  tags,
  is_published,
  is_featured,
  published_at,
  reading_time
)
values
(
  'Designing a hostel platform for 2,400 beds',
  'designing-hostel-platform-2400-beds',
  'What we learned modelling rooms, beds and residents as three separate things.',
  '<p>Most hostel software treats a bed as a field on a room. That breaks the moment a building is renovated mid-term.</p><h2>Model the physical world</h2><p>We model buildings, floors, rooms and beds as first-class records with their own lifecycle, then attach allocations to beds rather than rooms.</p><h2>Billing follows allocation</h2><p>Invoices are generated from allocation history, which makes mid-month moves trivial to prorate.</p>',
  (select id from public.categories where slug = 'engineering'),
  '["architecture","postgres"]'::jsonb,
  true,
  true,
  now() - interval '6 days',
  7
),
(
  'Why we choose boring infrastructure',
  'why-we-choose-boring-infrastructure',
  'Postgres, containers and one deployment target beats a diagram full of logos.',
  '<p>Every service you add is a service you must monitor, patch and explain to the next engineer.</p><h2>One database</h2><p>Postgres handles relational data, JSON, full-text search and queues well enough for the vast majority of products we ship.</p>',
  (select id from public.categories where slug = 'engineering'),
  '["devops","postgres"]'::jsonb,
  true,
  false,
  now() - interval '14 days',
  5
),
(
  'Shipping AI features people actually use',
  'shipping-ai-features-people-actually-use',
  'Start with the document nobody wants to retype.',
  '<p>The best first AI feature in an enterprise system is almost never a chatbot. It is extraction.</p><h2>Human in the loop</h2><p>Every extracted field is reviewable, and confidence is visible to the reviewer.</p>',
  (select id from public.categories where slug = 'product'),
  '["ai","product"]'::jsonb,
  true,
  false,
  now() - interval '21 days',
  6
),
(
  'Hostel Management turns six',
  'hostel-management-turns-six',
  'Six years, 180 projects and a team of 42.',
  '<p>We started in 2019 with three people and one hostel client in Banani. Here is what changed.</p>',
  (select id from public.categories where slug = 'company'),
  '["company"]'::jsonb,
  true,
  false,
  now() - interval '40 days',
  3
);

insert into public.team_members (
  name,
  designation,
  department,
  bio,
  is_leadership,
  sort_order
)
values
(
  'Ayesha Rahman',
  'Chief Executive Officer',
  'Leadership',
  'Founded the company in 2019 after a decade building banking software.',
  true,
  1
),
(
  'Tanvir Hossain',
  'Chief Technology Officer',
  'Leadership',
  'Leads architecture across every platform we ship.',
  true,
  2
),
(
  'Nusrat Jahan',
  'Head of Design',
  'Design',
  'Owns the design system behind all client products.',
  false,
  3
),
(
  'Rafiq Islam',
  'Engineering Manager',
  'Engineering',
  'Runs delivery for the hostel platform team.',
  false,
  4
),
(
  'Sadia Karim',
  'Lead Product Manager',
  'Product',
  'Translates messy operations into shippable scope.',
  false,
  5
),
(
  'Imran Chowdhury',
  'Head of Cloud',
  'Infrastructure',
  'Keeps deployments boring and uptime high.',
  false,
  6
);

insert into public.testimonials (
  name,
  designation,
  company,
  review,
  rating,
  is_featured,
  sort_order
)
values
(
  'Mahmudul Hasan',
  'Operations Director',
  'Sundarban Group',
  'They replaced eleven spreadsheets with one platform our wardens actually enjoy using.',
  5,
  true,
  1
),
(
  'Farhana Akter',
  'CIO',
  'Bengal Bank',
  'The only vendor we have worked with that delivered ahead of the audit deadline.',
  5,
  true,
  2
),
(
  'Shafiq Ahmed',
  'Managing Director',
  'Meghna Tech',
  'Live fleet visibility paid for the project in under five months.',
  5,
  true,
  3
),
(
  'Priya Sen',
  'Head of Product',
  'Aurora Labs',
  'Offline-first was hard. Their team made it look routine.',
  5,
  false,
  4
),
(
  'Kamal Uddin',
  'Founder',
  'Riverstone',
  'Checkout abandonment dropped by a third after launch.',
  4,
  false,
  5
),
(
  'Rebecca Lin',
  'VP Engineering',
  'Northwind',
  'Clear communication, no surprises, excellent documentation.',
  5,
  false,
  6
);

insert into public.faqs (
  question,
  answer,
  category,
  sort_order
)
values
(
  'How long does a typical project take?',
  'Most platforms go live in 10 to 16 weeks, with a usable first release in week four.',
  'Process',
  1
),
(
  'Do you work with fixed budgets?',
  'Yes. After a paid discovery week we can commit to a fixed scope and price.',
  'Pricing',
  2
),
(
  'Who owns the code?',
  'You do. Every repository is transferred to your organisation at handover.',
  'Legal',
  3
),
(
  'Do you provide support after launch?',
  'Yes, through monthly support and improvement retainers.',
  'Support',
  4
),
(
  'Can you take over an existing codebase?',
  'Often. We start with a two-week audit before committing.',
  'Process',
  5
),
(
  'Where is your team based?',
  'Our whole team works from our Banani, Dhaka office with hybrid days.',
  'Company',
  6
),
(
  'Do you sign NDAs?',
  'Always, before any technical discussion.',
  'Legal',
  7
),
(
  'How do you handle data security?',
  'Row-level access control, encrypted transport and audited admin actions on every project.',
  'Security',
  8
);

insert into public.careers (
  title,
  slug,
  department,
  location,
  type,
  experience,
  salary,
  description,
  requirements,
  benefits
)
values
(
  'Senior React Engineer',
  'senior-react-engineer',
  'Engineering',
  'Dhaka (Hybrid)',
  'FULL_TIME',
  '4+ years',
  'BDT 180,000 – 260,000/month',
  '<p>Own front-end architecture on our hostel platform and mentor two engineers.</p>',
  '["4+ years with React and TypeScript","Strong CSS and accessibility fundamentals","Experience with Postgres-backed apps"]'::jsonb,
  '["Hybrid schedule","Annual learning budget","Health coverage for family"]'::jsonb
),
(
  'Product Designer',
  'product-designer',
  'Design',
  'Dhaka (Hybrid)',
  'FULL_TIME',
  '3+ years',
  'BDT 120,000 – 180,000/month',
  '<p>Design operational software that people use for eight hours a day.</p>',
  '["Portfolio of complex product work","Comfortable in Figma design systems"]'::jsonb,
  '["Hybrid schedule","Top-tier hardware","Health coverage"]'::jsonb
),
(
  'DevOps Engineer',
  'devops-engineer',
  'Infrastructure',
  'Remote',
  'REMOTE',
  '3+ years',
  'Negotiable',
  '<p>Automate delivery pipelines and keep production quiet.</p>',
  '["Docker and IaC experience","On-call maturity"]'::jsonb,
  '["Fully remote","Home office budget"]'::jsonb
);

insert into public.product_categories (
  name,
  slug,
  icon_name,
  description,
  sort_order
)
values
(
  'Attendance & Access Hardware',
  'attendance-access-hardware',
  'Fingerprint',
  'Biometric devices, auto check-in/out terminals and access control units built in-house.',
  1
),
(
  'Business Software',
  'business-software',
  'LayoutDashboard',
  'Hostel, attendance and operations platforms that run day-to-day work.',
  2
),
(
  'Web Development',
  'web-development',
  'Globe',
  'Corporate sites, portals and dashboards engineered for speed and SEO.',
  3
),
(
  'App Development',
  'app-development',
  'Smartphone',
  'Native and cross-platform mobile apps for staff, students and customers.',
  4
),
(
  'Custom Solutions',
  'custom-solutions',
  'Wrench',
  'Bespoke systems scoped around a workflow that off-the-shelf tools cannot cover.',
  5
);

insert into public.products (
  name,
  display_name,
  slug,
  kind,
  tagline,
  description,
  icon_name,
  features,
  is_featured,
  sort_order,
  category_id
)
values
(
  'Hostel Management System',
  'Hostel Management System',
  'hostel-management-system',
  'SOFTWARE',
  'Complete residence, billing and gate operations platform',
  'End-to-end hostel operations: room allocation, resident records, invoicing, mess management, visitor and gate logs, and analytics for wardens and owners.',
  'Building2',
  '["Room and bed allocation","Automated invoicing and dues","Mess and meal planning","Visitor and gate logs","Warden dashboards and reports"]'::jsonb,
  true,
  1,
  (select id from public.product_categories where slug = 'business-software')
),
(
  'Fingerprint Attendance System',
  'Fingerprint Attendance System',
  'fingerprint-attendance-system',
  'HARDWARE',
  'Biometric auto check-in and check-out devices',
  'Fingerprint terminals designed and manufactured in-house for organisations that need reliable, tamper-proof automatic check-in and check-out at every entry point.',
  'Fingerprint',
  '["Fingerprint and RFID capture","Automatic check-in / check-out","Offline buffering with sync","Cloud dashboard integration","Custom branding per client"]'::jsonb,
  true,
  2,
  (select id from public.product_categories where slug = 'attendance-access-hardware')
),
(
  'Attendance Management System',
  'Attendance Management System',
  'attendance-management-system',
  'WEB_APP',
  'Device plus web platform for workforce attendance',
  'A combined hardware and web solution: our attendance devices feed a web platform with shift rules, leave, overtime and payroll-ready exports. The product name is configurable per client.',
  'Clock',
  '["Device to cloud sync","Shift, leave and overtime rules","Payroll-ready exports","Multi-branch support","White-label naming"]'::jsonb,
  true,
  3,
  (select id from public.product_categories where slug = 'web-development')
),
(
  'Custom Mobile Applications',
  'Custom Mobile Applications',
  'custom-mobile-applications',
  'MOBILE_APP',
  'iOS and Android apps built to your requirements',
  'We design and build mobile application software tailored to each client requirement, delivered under whichever product name the client chooses.',
  'Smartphone',
  '["iOS and Android","Requirement-driven scope","API and device integration","Store submission support","Ongoing maintenance"]'::jsonb,
  false,
  4,
  (select id from public.product_categories where slug = 'app-development')
);

insert into public.products (
  name,
  display_name,
  slug,
  kind,
  tagline,
  description,
  icon_name,
  features,
  benefits,
  hardware_specs,
  price_note,
  sort_order,
  is_published,
  is_featured,
  category_id
)
values
(
  'Auto Check-in / Check-out Device',
  'Auto Check-in / Check-out Device',
  'auto-check-in-out-device',
  'HARDWARE',
  'Touchless entry and exit logging for gates, hostels and factory floors.',
  'A wall-mounted terminal that records every entry and exit automatically using RFID cards or face recognition, then syncs to your attendance dashboard in real time. Works offline and uploads the moment connectivity returns.',
  'DoorOpen',
  '["RFID card and face recognition modes","Offline buffering with automatic sync","Real-time gate log on the dashboard","Guardian SMS on student check-out","Tamper alert and audit trail"]'::jsonb,
  '["Removes manual gate registers","Instant answers to who is inside right now","Exportable logs for audits"]'::jsonb,
  '[{"label":"Display","value":"5\" capacitive touch"},{"label":"Recognition","value":"Face + RFID 13.56 MHz"},{"label":"Capacity","value":"10,000 users / 200,000 logs"},{"label":"Connectivity","value":"Wi-Fi, Ethernet, optional 4G"},{"label":"Power","value":"12V DC with battery backup"}]'::jsonb,
  'Quoted per gate after a site survey.',
  5,
  true,
  true,
  (select id from public.product_categories where slug = 'attendance-access-hardware')
),
(
  'Website Development',
  'Website Development',
  'website-development',
  'WEB_APP',
  'Fast, SEO-ready corporate sites and portals built to your brand.',
  'We design and build marketing sites, customer portals and internal dashboards with a CMS your own team can run. Every build ships with performance budgets, structured data and analytics wired in.',
  'Globe',
  '["Custom design system, not a template","Editable CMS for every section","SEO, structured data and sitemaps","Analytics and lead tracking","Hosting and maintenance options"]'::jsonb,
  '["Pages that load in under two seconds","Content changes without a developer","Search visibility from day one"]'::jsonb,
  '[]'::jsonb,
  'Fixed-price packages after a scoping call.',
  6,
  true,
  false,
  (select id from public.product_categories where slug = 'web-development')
),
(
  'Mobile App Development',
  'Mobile App Development',
  'mobile-app-development',
  'MOBILE_APP',
  'Android and iOS apps for your staff, students and customers.',
  'From a student hostel app to a field-force attendance app, we ship cross-platform mobile products with offline support, push notifications and a shared backend with your existing systems.',
  'Smartphone',
  '["Android and iOS from one codebase","Offline-first data sync","Push notifications","Biometric login","Store submission handled for you"]'::jsonb,
  '["One codebase, both platforms","Works in low-connectivity sites","Connects to your existing dashboards"]'::jsonb,
  '[]'::jsonb,
  'Scoped per feature set.',
  7,
  true,
  false,
  (select id from public.product_categories where slug = 'app-development')
);

insert into public.product_requests (
  product_id,
  name,
  phone,
  message,
  status,
  notes,
  created_at
)
select
  p.id,
  v.name,
  v.phone,
  v.message,
  v.status::public.request_status,
  v.notes,
  now() - v.ago
from (
  values
  (
    'hostel-management-system',
    'Rakibul Hasan',
    '01712345678',
    'We run a 400-bed hostel and need billing plus gate logs.',
    'NEW',
    null,
    interval '3 hours'
  ),
  (
    'fingerprint-attendance-system',
    'Nusrat Jahan',
    '01819876543',
    'Need 6 devices for our garments unit.',
    'CONTACTED',
    'Called 2 Aug — sending quotation.',
    interval '1 day'
  ),
  (
    'auto-check-in-out-device',
    'Mahmudul Karim',
    '01911223344',
    'Interested in face recognition at the main gate.',
    'INTERESTED',
    'Site survey booked.',
    interval '3 days'
  ),
  (
    'website-development',
    'Shahana Akter',
    '01633445566',
    'Corporate site with Bangla and English.',
    'CONVERTED',
    'Contract signed.',
    interval '9 days'
  ),
  (
    'mobile-app-development',
    'Tanvir Ahmed',
    '01555667788',
    null,
    'LOST',
    'Went with an in-house team.',
    interval '20 days'
  )
) as v(
  slug,
  name,
  phone,
  message,
  status,
  notes,
  ago
)
join public.products p
on p.slug = v.slug;

insert into public.faqs (
  question,
  answer,
  category,
  product_id,
  sort_order
)
select
  'Do your products support custom requirements?',
  'Yes. Product features and integrations can be customized according to the client requirements.',
  'Products',
  p.id,
  9
from public.products p
where p.slug = 'hostel-management-system';

insert into public.site_settings (
  site_name
)
select 'Hostel Management'
where not exists (
  select 1 from public.site_settings
);

select
  'Database setup completed successfully' as status,
  (select count(*) from public.products) as products,
  (select count(*) from public.product_categories) as product_categories,
  (select count(*) from public.services) as services,
  (select count(*) from public.projects) as projects,
  (select count(*) from public.blog_posts) as blog_posts,
  (select count(*) from public.faqs) as faqs,
  (select count(*) from public.careers) as careers;