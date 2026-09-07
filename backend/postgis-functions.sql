-- Run this in Supabase SQL Editor
-- Creates the PostGIS function for finding nearby available workers

DROP FUNCTION IF EXISTS find_nearby_workers(double precision, double precision, text, integer);

CREATE OR REPLACE FUNCTION find_nearby_workers(
  p_lat FLOAT,
  p_lng FLOAT,
  p_service_category TEXT,
  p_radius_meters INT DEFAULT 10000
)
RETURNS TABLE (
  worker_id UUID,
  user_id UUID,
  name VARCHAR(255),
  phone VARCHAR(15),
  photo_url VARCHAR(500),
  rating DECIMAL,
  total_ratings INT,
  completed_jobs INT,
  distance_meters FLOAT,
  city VARCHAR(100),
  skills JSONB,
  lat FLOAT,
  lng FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    w.id AS worker_id,
    w.user_id,
    u.name,
    u.phone,
    w.photo_url,
    w.rating,
    w.total_ratings,
    w.completed_jobs,
    ST_Distance(
      w.location::geography,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
    ) AS distance_meters,
    w.city,
    (
      SELECT jsonb_agg(jsonb_build_object(
        'category', ws.category,
        'subcategory', ws.subcategory,
        'skill_level', ws.skill_level
      ))
      FROM worker_skills ws
      WHERE ws.worker_id = w.id
    ) AS skills,
    ST_Y(w.location::geometry) AS lat,
    ST_X(w.location::geometry) AS lng
  FROM workers w
  JOIN users u ON w.user_id = u.id
  WHERE
    w.available = TRUE
    AND w.verification_status = 'verified'
    AND ST_DWithin(
      w.location::geography,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      p_radius_meters
    )
    AND EXISTS (
      SELECT 1 FROM worker_skills ws
      WHERE ws.worker_id = w.id
      AND ws.category ILIKE p_service_category
    )
  ORDER BY distance_meters ASC, w.rating DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;
