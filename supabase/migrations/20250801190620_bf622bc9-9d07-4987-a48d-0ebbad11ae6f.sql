-- Fix the trigger function and add missing trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    user_type, 
    is_profile_complete,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data ->> 'user_type',
      'client'
    )::text,
    false,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create profile for existing user
INSERT INTO public.profiles (
  id, 
  email, 
  full_name, 
  user_type, 
  is_profile_complete,
  created_at,
  updated_at
)
SELECT 
  id,
  email,
  COALESCE(
    raw_user_meta_data ->> 'full_name',
    raw_user_meta_data ->> 'name',
    'Ravi Darji'
  ),
  COALESCE(
    raw_user_meta_data ->> 'user_type',
    'client'
  )::text,
  false,
  NOW(),
  NOW()
FROM auth.users 
WHERE id = '6f240cf6-7f09-46de-8e4d-ded09b3992e7'
ON CONFLICT (id) DO NOTHING;