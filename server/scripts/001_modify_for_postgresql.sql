-- PostgreSQL-specific modifications
-- Remove Supabase-specific auth references and modify for standard PostgreSQL

-- Drop the trigger and function that reference auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Modify profiles table to work without Supabase auth
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Add password_hash column for authentication
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Remove RLS policies that reference auth.uid() function
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view leads assigned to them or created by them" ON public.leads;
DROP POLICY IF EXISTS "Users can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update leads assigned to them or created by them" ON public.leads;
DROP POLICY IF EXISTS "Users can delete leads they created" ON public.leads;

DROP POLICY IF EXISTS "Users can view contacts assigned to them or created by them" ON public.contacts;
DROP POLICY IF EXISTS "Users can insert contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can update contacts assigned to them or created by them" ON public.contacts;
DROP POLICY IF EXISTS "Users can delete contacts they created" ON public.contacts;

DROP POLICY IF EXISTS "Users can view all properties" ON public.properties;
DROP POLICY IF EXISTS "Users can insert properties" ON public.properties;
DROP POLICY IF EXISTS "Users can update properties they created or listed" ON public.properties;
DROP POLICY IF EXISTS "Users can delete properties they created" ON public.properties;

DROP POLICY IF EXISTS "Users can view deals assigned to them or created by them" ON public.deals;
DROP POLICY IF EXISTS "Users can insert deals" ON public.deals;
DROP POLICY IF EXISTS "Users can update deals assigned to them or created by them" ON public.deals;
DROP POLICY IF EXISTS "Users can delete deals they created" ON public.deals;

DROP POLICY IF EXISTS "Users can view tasks assigned to them or created by them" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update tasks assigned to them or created by them" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete tasks they created" ON public.tasks;

DROP POLICY IF EXISTS "Users can view activities they created" ON public.activities;
DROP POLICY IF EXISTS "Users can insert activities" ON public.activities;
DROP POLICY IF EXISTS "Users can update activities they created" ON public.activities;
DROP POLICY IF EXISTS "Users can delete activities they created" ON public.activities;

DROP POLICY IF EXISTS "Users can view documents they uploaded" ON public.documents;
DROP POLICY IF EXISTS "Users can insert documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete documents they uploaded" ON public.documents;

-- Disable RLS (Row Level Security) since we'll handle authorization at application level
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Update profiles table to not reference auth.users
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Create a default admin user (you should change the password after first login)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'admin@aqarat.com') THEN
    INSERT INTO public.profiles (id, email, full_name, role, password_hash)
    VALUES (
      uuid_generate_v4(),
      'admin@aqarat.com',
      'System Administrator',
      'admin',
      '$2b$12$LQv3c1yqBw.VmnYMUAWeA.Y1WQCHYlT5d7C9F4RJB5b6w8q9H7JIG' -- password: admin123
    );
  END IF;
END
$$;

COMMIT;