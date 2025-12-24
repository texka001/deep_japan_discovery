-- Phase 3.1: Add Address Column

ALTER TABLE public.spots 
ADD COLUMN IF NOT EXISTS address text;
