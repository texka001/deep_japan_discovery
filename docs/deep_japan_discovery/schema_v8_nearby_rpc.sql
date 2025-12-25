-- RPC: Get spots within X meters
-- Drop if exists to allow clean re-runs
drop function if exists get_spots_nearby;

create or replace function get_spots_nearby(
  lat float,
  long float,
  radius_meters int default 2000
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
  created_at timestamptz,
  dist_meters float
)
language plpgsql
as $$
declare
  center geography;
begin
  -- Construct a point from input lat/long
  center := ST_SetSRID(ST_MakePoint(long, lat), 4326)::geography;

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
    s.created_at,
    ST_Distance(s.location, center) as dist_meters
  from
    public.spots s
  where
    ST_DWithin(s.location, center, radius_meters)
  order by
    ST_Distance(s.location, center) asc;
end;
$$;
