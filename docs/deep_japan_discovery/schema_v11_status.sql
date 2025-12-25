-- Add status column to spots table
ALTER TABLE spots 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published';

-- Add check constraint for status values
ALTER TABLE spots 
ADD CONSTRAINT spots_status_check 
CHECK (status IN ('published', 'on_hold'));

-- Comment on column
COMMENT ON COLUMN spots.status IS 'Publication status: published or on_hold';
