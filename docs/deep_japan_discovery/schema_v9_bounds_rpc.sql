-- RPC: Get spots within a bounding box
-- Drop if exists to allow clean re-runs
drop function if exists get_spots_in_bounds;

create or replace function get_spots_in_bounds(
  min_lat float,
  min_lng float,
  max_lat float,
  max_lng float
)
returns table (
  spot_id uuid,
  name_en text,
  name_jp text,
  location geography,
  category text,
  difficulty int,
  avg_stay_minutes int,
  deep_guide_json jsonb,
  image_url text,
  created_at timestamptz
)
language plpgsql
as $$
begin
  -- ST_MakeEnvelope(xmin, ymin, xmax, ymax, srid)
  -- Uses && operator which checks if bounding box intersects
  -- Casting geography to geometry for simple bbox check is often faster/simpler if accurate enough, 
  -- but since column is geography, we should use geography based check or cast carefully.
  -- ST_MakeEnvelope returns geometry.
  -- We can case s.location to geometry for the check.
  
  return query
  select
    s.spot_id,
    s.name_en,
    s.name_jp,
    s.location,
    s.category,
    s.difficulty,
    s.avg_stay_minutes,
    s.deep_guide_json,
    s.image_url,
    s.created_at
  from
    public.spots s
  where
    -- PostGIS && operator works on geometry. 
    -- Casting geography to geometry(Point) allows using spatial index for bbox.
    s.location::geometry && ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326);
end;
$$;
