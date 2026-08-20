-- ============================================================
-- ADMIN USERS SETUP
-- ============================================================
-- OLD ADMIN
-- Email: admin@hostelmanagement.demo
-- Password: Admin@123456
-- Role: super_admin
--
-- NEW ADMIN
-- Email: pranto@gmail.com
-- Password: pranto2024pranto
-- Role: super_admin
-- ============================================================

-- ============================================================
-- 1. OLD ADMIN
-- ============================================================

DO $$
DECLARE
    admin_id uuid;
BEGIN

    SELECT id
    INTO admin_id
    FROM auth.users
    WHERE email = 'admin@hostelmanagement.demo'
    LIMIT 1;

    IF admin_id IS NULL THEN

        admin_id := '04748d7d-5efc-48ae-9c4c-47de3f693604';

        INSERT INTO auth.users (
            id,
            instance_id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
        )
        VALUES (
            admin_id,
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            'admin@hostelmanagement.demo',
            crypt('Admin@123456', gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            '{"name":"Demo Admin"}'::jsonb,
            now(),
            now()
        );

    END IF;

    INSERT INTO public.profiles (
        id,
        name,
        email,
        is_active
    )
    VALUES (
        admin_id,
        'Demo Admin',
        'admin@hostelmanagement.demo',
        true
    )
    ON CONFLICT (id)
    DO UPDATE SET
        name = 'Demo Admin',
        email = 'admin@hostelmanagement.demo',
        is_active = true,
        updated_at = now();

    INSERT INTO public.user_roles (
        user_id,
        role
    )
    VALUES (
        admin_id,
        'super_admin'
    )
    ON CONFLICT (user_id, role)
    DO NOTHING;

END $$;


-- ============================================================
-- 2. NEW ADMIN
-- ============================================================

DO $$
DECLARE
    admin_id uuid;
BEGIN

    SELECT id
    INTO admin_id
    FROM auth.users
    WHERE email = 'pranto@gmail.com'
    LIMIT 1;

    IF admin_id IS NULL THEN

        admin_id := gen_random_uuid();

        INSERT INTO auth.users (
            id,
            instance_id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
        )
        VALUES (
            admin_id,
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            'pranto@gmail.com',
            crypt('pranto2024pranto', gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            '{"name":"MD Pranto Ali"}'::jsonb,
            now(),
            now()
        );

    END IF;

    INSERT INTO public.profiles (
        id,
        name,
        email,
        is_active
    )
    VALUES (
        admin_id,
        'MD Pranto Ali',
        'pranto@gmail.com',
        true
    )
    ON CONFLICT (id)
    DO UPDATE SET
        name = 'MD Pranto Ali',
        email = 'pranto@gmail.com',
        is_active = true,
        updated_at = now();

    INSERT INTO public.user_roles (
        user_id,
        role
    )
    VALUES (
        admin_id,
        'super_admin'
    )
    ON CONFLICT (user_id, role)
    DO NOTHING;

END $$;


-- ============================================================
-- 3. VERIFY ADMIN USERS
-- ============================================================

SELECT
    u.id,
    u.email,
    p.name,
    r.role,
    p.is_active
FROM auth.users u
LEFT JOIN public.profiles p
    ON p.id = u.id
LEFT JOIN public.user_roles r
    ON r.user_id = u.id
WHERE u.email IN (
    'admin@hostelmanagement.demo',
    'pranto@gmail.com'
)
ORDER BY u.email;