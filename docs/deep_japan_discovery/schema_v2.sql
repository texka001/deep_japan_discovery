-- Phase 3 Schema Updates

-- 1. Update 'spots' table with new columns
ALTER TABLE public.spots 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- 2. Create 'spot_photos' table (UGC)
CREATE TABLE IF NOT EXISTS public.spot_photos (
  photo_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  spot_id uuid REFERENCES public.spots(spot_id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  status text CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for spot_photos
ALTER TABLE public.spot_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view approved photos" ON public.spot_photos FOR SELECT USING (status = 'approved');
CREATE POLICY "Users can view their own photos" ON public.spot_photos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upload photos" ON public.spot_photos FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Only admins can update status (omitted specific admin check logic for brevity, assumed via service role or separate admin policy in future)

-- 3. Create 'spot_corrections' table (UGC)
CREATE TABLE IF NOT EXISTS public.spot_corrections (
  correction_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  spot_id uuid REFERENCES public.spots(spot_id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  suggested_data jsonb NOT NULL, -- content of the suggestion
  status text CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for spot_corrections
ALTER TABLE public.spot_corrections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own corrections" ON public.spot_corrections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can submit corrections" ON public.spot_corrections FOR INSERT WITH CHECK (auth.uid() = user_id);
