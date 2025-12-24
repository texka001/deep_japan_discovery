-- Phase 4.1: Expand Category Options

ALTER TABLE public.spots 
DROP CONSTRAINT IF EXISTS spots_category_check;

ALTER TABLE public.spots
ADD CONSTRAINT spots_category_check 
CHECK (category IN ('Subculture', 'Retro', 'Craft', 'Food', 'Nature', 'Temple', 'Other'));
