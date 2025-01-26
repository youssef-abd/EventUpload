/*
  # Add organizer_id to events table

  1. Changes
    - Add `organizer_id` column to `events` table
    - Set default value to ensure backward compatibility
    - Update existing rows to have a default value

  2. Security
    - Maintain existing RLS policies
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'organizer_id'
  ) THEN
    ALTER TABLE events ADD COLUMN organizer_id text NOT NULL DEFAULT 'guest';
  END IF;
END $$;