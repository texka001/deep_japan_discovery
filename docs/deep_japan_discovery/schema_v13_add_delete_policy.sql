-- Allow authenticated users (admins) to delete spots
CREATE POLICY "Admins can delete spots"
ON public.spots
FOR DELETE
TO authenticated
USING (true);
