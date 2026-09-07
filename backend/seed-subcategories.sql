-- Seed service subcategories with pricing for all categories
-- Run in Supabase SQL Editor

-- Get category IDs first, then insert subcategories

-- Plumbing subcategories
INSERT INTO service_subcategories (category_id, name, description, price_min, price_max, duration_min, duration_max)
SELECT id, 'Tap Leakage Repair', 'Fix dripping or leaking taps', 150, 300, 30, 60
FROM service_categories WHERE name = 'Plumbing' ON CONFLICT DO NOTHING;

INSERT INTO service_subcategories (category_id, name, description, price_min, price_max, duration_min, duration_max)
SELECT id, 'New Tap Installation', 'Install new tap or faucet', 350, 600, 45, 90
FROM service_categories WHERE name = 'Plumbing' ON CONFLICT DO NOTHING;

INSERT INTO service_subcategories (category_id, name, description, price_min, price_max, duration_min, duration_max)
SELECT id, 'Geyser Connection', 'Connect and install geyser/water heater', 450, 800, 60, 120
FROM service_categories WHERE name = 'Plumbing' ON CONFLICT DO NOTHING;

INSERT INTO service_subcategories (category_id, name, description, price_min, price_max, duration_min, duration_max)
SELECT id, 'Pipe Blockage Clearance', 'Clear blocked drain or pipe', 250, 500, 45, 90
FROM service_categories WHERE name = 'Plumbing' ON CONFLICT DO NOTHING;

INSERT INTO service_subcategories (category_id, name, description, price_min, price_max, duration_min, duration_max)
SELECT id, 'Toilet Repair', 'Fix flush, seat or toilet issues', 200, 450, 30, 60
FROM service_categories WHERE name = 'Plumbing' ON CONFLICT DO NOTHING;

-- Electrical subcategories
INSERT INTO service_subcategories (category_id, name, description, price_min, price_max, duration_min, duration_max)
SELECT id, 'Switch/Socket Repair', 'Fix or replace faulty switch or socket', 150, 350, 20, 45
FROM service_categories WHERE name = 'Electrical' ON CONFLICT DO NOTHING;

INSERT INTO service_subcategories (category_id, name, description, price_min, price_max, duration_min, duration_max)
SELECT id, 'Fan Installation', 'Install ceiling or wall fan', 300, 600, 45, 90
FROM service_categories WHERE name = 'Electrical' ON CONFLICT DO NOTHING;

INSERT INTO service_subcategories (category_id, name, description, price_min, price_max, duration_min, duration_max)
SELECT id, 'MCB/Fuse Repair', 'Fix tripping MCB or blown fuse', 200, 400, 30, 60
FROM service_categories WHERE name = 'Electrical' ON CONFLICT DO NOTHING;

INSERT INTO service_subcategories (category_id, name, description, price_min, price_max, duration_min, duration_max)
SELECT id, 'Light Fitting', 'Install or repair light fitting', 200, 450, 30, 60
FROM service_categories WHERE name = 'Electrical' ON CONFLICT DO NOTHING;

INSERT INTO service_subcategories (category_id, name, description, price_min, price_max, duration_min, duration_max)
SELECT id, 'AC Installation', 'Install split or window AC unit', 800, 1500, 120, 180
FROM service_categories WHERE name = 'Electrical' ON CONFLICT DO NOTHING;

-- Carpentry subcategories
INSERT INTO service_subcategories (category_id, name, description, price_min, price_max, duration_min, duration_max)
SELECT id, 'Door Repair', 'Fix stuck, broken or squeaky door', 300, 600, 45, 90
FROM service_categories WHERE name = 'Carpentry' ON CONFLICT DO NOTHING;

INSERT INTO service_subcategories (category_id, name, description, price_min, price_max, duration_min, duration_max)
SELECT id, 'Furniture Assembly', 'Assemble flat-pack or ready-made furniture', 400, 800, 60, 180
FROM service_categories WHERE name = 'Carpentry' ON CONFLICT DO NOTHING;

INSERT INTO service_subcategories (category_id, name, description, price_min, price_max, duration_min, duration_max)
SELECT id, 'Lock Repair', 'Fix or replace door lock', 250, 500, 30, 60
FROM service_categories WHERE name = 'Carpentry' ON CONFLICT DO NOTHING;

-- Cleaning subcategories
INSERT INTO service_subcategories (category_id, name, description, price_min, price_max, duration_min, duration_max)
SELECT id, 'Home Deep Clean', 'Full home deep cleaning service', 1500, 3000, 180, 360
FROM service_categories WHERE name = 'Cleaning' ON CONFLICT DO NOTHING;

INSERT INTO service_subcategories (category_id, name, description, price_min, price_max, duration_min, duration_max)
SELECT id, 'Bathroom Cleaning', 'Deep clean bathroom and toilet', 400, 800, 60, 120
FROM service_categories WHERE name = 'Cleaning' ON CONFLICT DO NOTHING;

INSERT INTO service_subcategories (category_id, name, description, price_min, price_max, duration_min, duration_max)
SELECT id, 'Kitchen Cleaning', 'Deep clean kitchen including chimney', 600, 1200, 90, 150
FROM service_categories WHERE name = 'Cleaning' ON CONFLICT DO NOTHING;

-- Appliance Repair subcategories
INSERT INTO service_subcategories (category_id, name, description, price_min, price_max, duration_min, duration_max)
SELECT id, 'Washing Machine Repair', 'Diagnose and repair washing machine', 400, 900, 60, 120
FROM service_categories WHERE name = 'Appliance Repair' ON CONFLICT DO NOTHING;

INSERT INTO service_subcategories (category_id, name, description, price_min, price_max, duration_min, duration_max)
SELECT id, 'Refrigerator Repair', 'Fix refrigerator cooling or other issues', 500, 1200, 60, 120
FROM service_categories WHERE name = 'Appliance Repair' ON CONFLICT DO NOTHING;

INSERT INTO service_subcategories (category_id, name, description, price_min, price_max, duration_min, duration_max)
SELECT id, 'Microwave Repair', 'Fix microwave heating or door issues', 300, 700, 45, 90
FROM service_categories WHERE name = 'Appliance Repair' ON CONFLICT DO NOTHING;

INSERT INTO service_subcategories (category_id, name, description, price_min, price_max, duration_min, duration_max)
SELECT id, 'AC Service/Repair', 'Service or repair air conditioner', 600, 1500, 90, 150
FROM service_categories WHERE name = 'Appliance Repair' ON CONFLICT DO NOTHING;

-- Painting subcategories
INSERT INTO service_subcategories (category_id, name, description, price_min, price_max, duration_min, duration_max)
SELECT id, 'Room Painting', 'Paint single room walls and ceiling', 2000, 5000, 240, 480
FROM service_categories WHERE name = 'Painting' ON CONFLICT DO NOTHING;

INSERT INTO service_subcategories (category_id, name, description, price_min, price_max, duration_min, duration_max)
SELECT id, 'Wall Touch-up', 'Fix and repaint damaged wall patches', 500, 1200, 60, 120
FROM service_categories WHERE name = 'Painting' ON CONFLICT DO NOTHING;
