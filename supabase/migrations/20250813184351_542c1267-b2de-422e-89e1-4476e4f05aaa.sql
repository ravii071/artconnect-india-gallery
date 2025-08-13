-- Enable realtime for artist_profiles table
ALTER TABLE public.artist_profiles REPLICA IDENTITY FULL;

-- Add artist_profiles table to realtime publication
SELECT
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND tablename = 'artist_profiles'
    ) 
    THEN 'artist_profiles already in realtime publication'
    ELSE (
      SELECT 'artist_profiles added to realtime publication' 
      FROM pg_catalog.pg_publication_tables 
      WHERE 1=0
    )
  END as result;

-- Add to realtime publication if not already added
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'artist_profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.artist_profiles;
  END IF;
END $$;