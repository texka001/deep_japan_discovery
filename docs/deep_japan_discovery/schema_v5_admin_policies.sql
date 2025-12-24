-- Phase 5 Fix: Enable Admin Updates
-- Since we don't have a distinct 'admin' role, we will allow 'authenticated' users to perform updates.
-- In a real app, strict RLS with a custom claim or specific user UUIDs would be required.

-- 1. Allow updating `spot_photos` status
CREATE POLICY "Admins can update photo status" ON public.spot_photos
FOR UPDATE
USING (auth.role() = 'authenticated');

-- 2. Allow updating `spot_corrections` status
CREATE POLICY "Admins can update correction status" ON public.spot_corrections
FOR UPDATE
USING (auth.role() = 'authenticated');

-- 3. Allow updating `spots` (for adding images from UGC or Spot Generator edits)
-- Note: 'insert' might have been working due to RLS not being fully enforced or some other state, 
-- but we need explicit UPDATE permission for the 'Approve' action to modify the `images` column.
CREATE POLICY "Admins can update spots" ON public.spots
FOR UPDATE
USING (auth.role() = 'authenticated');

-- 4. Ensure `spots` INSERT is also explicitly allowed for authenticated users (for the Generator)
CREATE POLICY "Admins can insert spots" ON public.spots
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
