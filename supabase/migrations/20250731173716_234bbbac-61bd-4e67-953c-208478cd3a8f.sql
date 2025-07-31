-- Create art_forms table for better organization
CREATE TABLE IF NOT EXISTS public.art_forms (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert common art forms
INSERT INTO public.art_forms (name, description) VALUES
  ('Mehendi Artist', 'Traditional henna art and designs'),
  ('Makeup Artist', 'Professional makeup services'),
  ('Hair Stylist', 'Hair styling and grooming'),
  ('Nail Artist', 'Nail art and manicure services'),
  ('Face Painting', 'Creative face painting for events'),
  ('Tattoo Artist', 'Temporary and permanent tattoo services'),
  ('Photography', 'Professional photography services'),
  ('Jewelry Design', 'Custom jewelry creation'),
  ('Fashion Design', 'Clothing and fashion design'),
  ('Event Decoration', 'Event styling and decoration')
ON CONFLICT (name) DO NOTHING;

-- Add art_form_id to artist_profiles table
ALTER TABLE public.artist_profiles 
ADD COLUMN IF NOT EXISTS art_form_id INTEGER REFERENCES public.art_forms(id);

-- Enable RLS on art_forms table
ALTER TABLE public.art_forms ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read art forms (for dropdown)
CREATE POLICY "Anyone can view art forms" 
ON public.art_forms 
FOR SELECT 
USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_artist_profiles_art_form_id ON public.artist_profiles(art_form_id);

-- Update existing artist profiles with default art form based on specialty
UPDATE public.artist_profiles 
SET art_form_id = (
  SELECT id FROM public.art_forms 
  WHERE LOWER(name) LIKE '%' || LOWER(COALESCE(specialty, 'makeup')) || '%' 
  LIMIT 1
)
WHERE art_form_id IS NULL;