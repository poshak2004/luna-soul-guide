-- Security Fix: Add search_path to remaining functions and consolidate profile tables

-- Fix 1: Add search_path to update_updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix 2: Add search_path to update_updated_at_column function  
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix 3: Remove duplicate profiles table and consolidate to user_profiles
-- First, migrate any useful data from profiles to user_profiles if needed
DO $$
BEGIN
  -- Add longest_streak column to user_profiles if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'longest_streak'
  ) THEN
    ALTER TABLE public.user_profiles 
    ADD COLUMN longest_streak INTEGER DEFAULT 0,
    ADD COLUMN last_activity_date DATE;
  END IF;
END $$;

-- Migrate any data from profiles to user_profiles if both exist
INSERT INTO public.user_profiles (user_id, total_points, current_streak, longest_streak, last_activity_date, anonymous_username)
SELECT 
  p.id as user_id,
  COALESCE(p.total_points, 0) as total_points,
  COALESCE(p.current_streak, 0) as current_streak,
  COALESCE(p.longest_streak, 0) as longest_streak,
  p.last_activity_date,
  COALESCE(p.username, generate_anonymous_username()) as anonymous_username
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles up WHERE up.user_id = p.id
)
ON CONFLICT (user_id) DO NOTHING;

-- Remove the trigger that creates profiles entries
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the old handle_new_user function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop the profiles table (no longer needed)
DROP TABLE IF EXISTS public.profiles CASCADE;