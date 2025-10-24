-- Add missing expired_manually column to download_tokens table
ALTER TABLE download_tokens ADD COLUMN IF NOT EXISTS expired_manually BOOLEAN DEFAULT FALSE;