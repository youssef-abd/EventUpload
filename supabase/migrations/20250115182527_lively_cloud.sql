/*
  # Remove category constraint from photos table

  1. Changes
    - Make category column nullable
    - Set default value to null
    - Remove not-null constraint

  This change allows photos to be uploaded without a category, which is no longer used in the application.
*/

ALTER TABLE photos ALTER COLUMN category DROP NOT NULL;
ALTER TABLE photos ALTER COLUMN category SET DEFAULT NULL;