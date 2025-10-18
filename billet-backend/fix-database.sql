-- Add missing used_at column to download_tokens table
ALTER TABLE download_tokens ADD COLUMN IF NOT EXISTS used_at TIMESTAMP WITH TIME ZONE;