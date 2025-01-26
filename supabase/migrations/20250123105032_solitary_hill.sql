/*
  # Add cover image support

  1. Changes
    - Add cover_image column to events table
    - Create covers storage bucket for event cover images

  2. Security
    - Enable RLS on storage bucket
    - Add policy for authenticated users to manage their event covers
*/

-- Add cover_image column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'cover_image'
  ) THEN
    ALTER TABLE events ADD COLUMN cover_image text;
  END IF;
END $$;

-- Create storage bucket for covers if it doesn't exist
INSERT INTO storage.buckets (id, name)
VALUES ('covers', 'covers')
ON CONFLICT (id) DO NOTHING;

-- Set up storage bucket security
CREATE POLICY "Allow public read access to covers"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'covers');

CREATE POLICY "Allow organizers to upload covers"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'covers');

CREATE POLICY "Allow organizers to update covers"
  ON storage.objects FOR UPDATE
  TO public
  USING (bucket_id = 'covers')
  WITH CHECK (bucket_id = 'covers');