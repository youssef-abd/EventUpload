/*
  # Initial Schema Setup for Event Photo Upload App

  1. New Tables
    - `events`
      - `id` (uuid, primary key)
      - `code` (text, unique)
      - `name` (text)
      - `description` (text)
      - `is_private` (boolean)
      - `created_at` (timestamp)
      
    - `photos`
      - `id` (uuid, primary key)
      - `event_id` (uuid, foreign key)
      - `url` (text)
      - `user_name` (text)
      - `category` (text)
      - `description` (text)
      - `likes` (integer)
      - `created_at` (timestamp)

  2. Functions
    - `increment_likes`: Function to safely increment photo likes

  3. Security
    - Enable RLS on all tables
    - Add policies for public access to events and photos
*/

-- Create events table
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  is_private boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create photos table
CREATE TABLE photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  url text NOT NULL,
  user_name text NOT NULL,
  category text NOT NULL,
  description text,
  likes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create function to increment likes
CREATE OR REPLACE FUNCTION increment_likes(photo_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE photos
  SET likes = likes + 1
  WHERE id = photo_id;
END;
$$;

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Create policies for events
CREATE POLICY "Allow public read access to events"
  ON events
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to events"
  ON events
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policies for photos
CREATE POLICY "Allow public read access to photos"
  ON photos
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to photos"
  ON photos
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to photos"
  ON photos
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);