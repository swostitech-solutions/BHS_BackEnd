-- Seed file for comprehensive home services
-- Run with: psql -U nabinchapagain -d bhs_db -f seed_services.sql

INSERT INTO services (service_code, name, description, status, "createdAt", "updatedAt") VALUES
('PL10001', 'Plumbing', 'All plumbing services including pipe repairs, leak fixes, tap installations, and bathroom fittings', 'ACTIVE', NOW(), NOW())
ON CONFLICT (service_code) DO NOTHING;

INSERT INTO services (service_code, name, description, status, "createdAt", "updatedAt") VALUES
('AC10001', 'AC Repair & Service', 'Air conditioner installation, repair, gas refill, and regular maintenance services', 'ACTIVE', NOW(), NOW())
ON CONFLICT (service_code) DO NOTHING;

INSERT INTO services (service_code, name, description, status, "createdAt", "updatedAt") VALUES
('CA10001', 'Carpentry', 'Furniture repair, custom woodwork, door/window installation, and cabinet making', 'ACTIVE', NOW(), NOW())
ON CONFLICT (service_code) DO NOTHING;

INSERT INTO services (service_code, name, description, status, "createdAt", "updatedAt") VALUES
('PA10001', 'Painting', 'Interior and exterior painting, wall textures, waterproofing, and wood polishing', 'ACTIVE', NOW(), NOW())
ON CONFLICT (service_code) DO NOTHING;

INSERT INTO services (service_code, name, description, status, "createdAt", "updatedAt") VALUES
('CL10001', 'Cleaning', 'Deep home cleaning, kitchen cleaning, bathroom cleaning, and sofa/carpet cleaning', 'ACTIVE', NOW(), NOW())
ON CONFLICT (service_code) DO NOTHING;

INSERT INTO services (service_code, name, description, status, "createdAt", "updatedAt") VALUES
('AP10001', 'Appliance Repair', 'Washing machine, refrigerator, microwave, and other home appliance repairs', 'ACTIVE', NOW(), NOW())
ON CONFLICT (service_code) DO NOTHING;

INSERT INTO services (service_code, name, description, status, "createdAt", "updatedAt") VALUES
('PE10001', 'Pest Control', 'Termite control, cockroach treatment, bed bug removal, and general pest management', 'ACTIVE', NOW(), NOW())
ON CONFLICT (service_code) DO NOTHING;

INSERT INTO services (service_code, name, description, status, "createdAt", "updatedAt") VALUES
('WP10001', 'Waterproofing', 'Terrace waterproofing, bathroom waterproofing, and wall seepage solutions', 'ACTIVE', NOW(), NOW())
ON CONFLICT (service_code) DO NOTHING;

INSERT INTO services (service_code, name, description, status, "createdAt", "updatedAt") VALUES
('GE10001', 'Geyser Service', 'Geyser installation, repair, and maintenance for all brands', 'ACTIVE', NOW(), NOW())
ON CONFLICT (service_code) DO NOTHING;

INSERT INTO services (service_code, name, description, status, "createdAt", "updatedAt") VALUES
('RO10001', 'RO & Water Purifier', 'Water purifier installation, filter replacement, and maintenance', 'ACTIVE', NOW(), NOW())
ON CONFLICT (service_code) DO NOTHING;

INSERT INTO services (service_code, name, description, status, "createdAt", "updatedAt") VALUES
('TV10001', 'TV & Electronics', 'TV mounting, smart TV setup, home theater installation, and electronics repair', 'ACTIVE', NOW(), NOW())
ON CONFLICT (service_code) DO NOTHING;

INSERT INTO services (service_code, name, description, status, "createdAt", "updatedAt") VALUES
('LO10001', 'Locksmith', 'Lock repair, key duplication, door lock installation, and emergency lockout services', 'ACTIVE', NOW(), NOW())
ON CONFLICT (service_code) DO NOTHING;

-- Verify the services
SELECT id, service_code, name FROM services ORDER BY id;
