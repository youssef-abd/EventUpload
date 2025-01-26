/*
  # Add organizer code to events table

  1. Changes
    - Add `organizer_code` column to events table
    - Make organizer_code required and unique
  2. Security
    - No changes to RLS policies needed
*/

ALTER TABLE events ADD COLUMN IF NOT EXISTS organizer_code text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text;