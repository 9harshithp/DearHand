-- ========================================================
-- DearHand Seed Initial Data Migration (V2__seed_initial_data.sql)
-- ========================================================

-- Passwords hashed with BCrypt (Cost 10)
-- 'Admin@123' -> $2a$10$w.p8pGjD7nS7K6rT.5d1..g2vW9Z2S9mP2.4T7/O3jF5P2i8O4eKy
-- 'Family@123' -> $2a$10$f3aF.w2Q/9Rj0K5m1D1Nze.3p9F7y2M4v7Q6W8e0O2r4T6y8U0iWe
-- 'Helper@123' -> $2a$10$h7bH.x4S/1Tk2M7p3F3Pbg.5r1H9a4O6x9S8Y0g2Q4t6V8a0W2kYe

-- 1. Insert Initial Admin
INSERT INTO users (id, role, name, phone, email, password_hash, status)
VALUES (
    1,
    'ADMIN',
    'DearHand Admin',
    '+919876543210',
    'admin@dearhand.in',
    '$2a$10$w.p8pGjD7nS7K6rT.5d1..g2vW9Z2S9mP2.4T7/O3jF5P2i8O4eKy',
    'ACTIVE'
) ON DUPLICATE KEY UPDATE email=email;

-- 2. Insert Standard Packages
INSERT INTO packages (id, name, type, duration_hours, base_price, active)
VALUES 
    (1, 'Single Task Errand', 'TASK', 2, 499.00, TRUE),
    (2, 'Half Day Assistance (4 Hours)', 'HALF_DAY', 4, 999.00, TRUE),
    (3, 'Full Day Dedicated Care (8 Hours)', 'FULL_DAY', 8, 1799.00, TRUE)
ON DUPLICATE KEY UPDATE name=name;

-- 3. Insert Test Family User
INSERT INTO users (id, role, name, phone, email, password_hash, status)
VALUES (
    2,
    'FAMILY',
    'Rohan Rao',
    '+919880011223',
    'rohan.rao@example.com',
    '$2a$10$f3aF.w2Q/9Rj0K5m1D1Nze.3p9F7y2M4v7Q6W8e0O2r4T6y8U0iWe',
    'ACTIVE'
) ON DUPLICATE KEY UPDATE email=email;

-- 4. Insert Test Parent under Rohan Rao
INSERT INTO parents (id, family_user_id, name, age, address, city, language, care_notes, emergency_contact_name, emergency_contact_phone)
VALUES (
    1,
    2,
    'Dr. K. S. Rao & Shakuntala Rao',
    76,
    'No 14, 3rd Main, Jayalakshmipuram, Mysuru 570012',
    'Mysuru',
    'Kannada, English',
    'Father uses walking stick; needs escort for weekly Apollo hospital appointment. Mother is diabetic.',
    'Rohan Rao (Son in Bengaluru)',
    '+919880011223'
) ON DUPLICATE KEY UPDATE name=name;

-- 5. Insert Test Helper User & Profile
INSERT INTO users (id, role, name, phone, email, password_hash, status)
VALUES (
    3,
    'HELPER',
    'Suresh Kumar',
    '+919741122334',
    'suresh.mysuru@example.com',
    '$2a$10$h7bH.x4S/1Tk2M7p3F3Pbg.5r1H9a4O6x9S8Y0g2Q4t6V8a0W2kYe',
    'ACTIVE'
) ON DUPLICATE KEY UPDATE email=email;

INSERT INTO helper_profiles (id, user_id, bio, languages, skills, has_licence, licence_no, licence_expiry, vehicle_type, years_experience, status, rating_avg)
VALUES (
    1,
    3,
    'Mysore native with 6 years experience assisting elderly citizens with hospital visits, medicine pickup, and driving.',
    'Kannada, English, Hindi',
    'Driving, First Aid, Smartphone/UPI Help, Wheelchair Handling',
    TRUE,
    'KA09-2018-004321',
    '2030-05-15',
    'Four Wheeler (Maruti Swift)',
    6,
    'APPROVED',
    4.90
) ON DUPLICATE KEY UPDATE status=status;
