-- Phase 6 Fix: Update Journeys table to reference auth.users directly
-- This avoids the issue where public.users is empty if no trigger exists.

-- 1. Drop the incorrect constraint
ALTER TABLE public.journeys
DROP CONSTRAINT IF EXISTS journeys_user_id_fkey;

-- 2. Add the correct constraint referencing auth.users
ALTER TABLE public.journeys
ADD CONSTRAINT journeys_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 3. Also fix RLS policies if necessary (though existing ones use auth.uid() = user_id which is fine)
-- The table definition had: user_id uuid references public.users(user_id)
-- Changing the FK doesn't change the column type, so RLS policies using `auth.uid() = user_id` remain valid because user_id stores the same UUID.
