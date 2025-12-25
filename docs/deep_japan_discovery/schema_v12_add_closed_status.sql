-- Drop existing check constraint
ALTER TABLE spots DROP CONSTRAINT IF EXISTS spots_status_check;

-- Add new check constraint including 'closed'
ALTER TABLE spots 
ADD CONSTRAINT spots_status_check 
CHECK (status IN ('published', 'on_hold', 'closed'));
