
-- Add isProfileComplete field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_profile_complete BOOLEAN NOT NULL DEFAULT false;

-- Update existing artist profiles to mark them as complete if they have required fields
UPDATE public.profiles 
SET is_profile_complete = true 
WHERE user_type = 'artist' 
AND id IN (
  SELECT ap.id 
  FROM public.artist_profiles ap 
  WHERE ap.specialty IS NOT NULL 
  AND ap.specialty != '' 
  AND ap.location IS NOT NULL 
  AND ap.location != ''
);

-- Update existing client profiles to mark them as complete (they don't need additional setup)
UPDATE public.profiles 
SET is_profile_complete = true 
WHERE user_type = 'client';
