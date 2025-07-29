-- Enable realtime for artist_profiles table
ALTER TABLE public.artist_profiles REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.artist_profiles;