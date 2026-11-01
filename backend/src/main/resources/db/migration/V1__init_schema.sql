-- ========================================================
-- DearHand Initial Schema Migration (V1__init_schema.sql)
-- MySQL 8.0 Compatible
-- ========================================================

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role VARCHAR(20) NOT NULL COMMENT 'family, helper, admin',
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE, SUSPENDED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_role (role),
    INDEX idx_users_phone (phone),
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Parents table
CREATE TABLE IF NOT EXISTS parents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    family_user_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(50) NOT NULL DEFAULT 'Mysuru',
    language VARCHAR(50) NOT NULL DEFAULT 'Kannada',
    care_notes TEXT,
    emergency_contact_name VARCHAR(100) NOT NULL,
    emergency_contact_phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_parents_family_user FOREIGN KEY (family_user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_parents_family (family_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Helper Profiles table
CREATE TABLE IF NOT EXISTS helper_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    bio TEXT,
    languages VARCHAR(255) NOT NULL DEFAULT 'Kannada',
    skills TEXT,
    has_licence BOOLEAN NOT NULL DEFAULT FALSE,
    licence_no VARCHAR(50),
    licence_expiry DATE,
    vehicle_type VARCHAR(50),
    years_experience INT DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'APPLIED' COMMENT 'APPLIED, VERIFIED, APPROVED, SUSPENDED',
    rating_avg DECIMAL(3, 2) DEFAULT 5.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_helper_profiles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_helper_profiles_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Helper Documents table
CREATE TABLE IF NOT EXISTS helper_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    helper_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL COMMENT 'GOVERNMENT_ID, POLICE_VERIFICATION, DRIVING_LICENCE, HEALTH_DECLARATION',
    file_key VARCHAR(255) NOT NULL,
    verified_by BIGINT,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_helper_documents_helper FOREIGN KEY (helper_id) REFERENCES helper_profiles (id) ON DELETE CASCADE,
    CONSTRAINT fk_helper_documents_verifier FOREIGN KEY (verified_by) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_helper_documents_helper (helper_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Packages table
CREATE TABLE IF NOT EXISTS packages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(30) NOT NULL COMMENT 'TASK, HALF_DAY, FULL_DAY, MONTHLY',
    duration_hours INT NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_packages_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    family_id BIGINT NOT NULL,
    parent_id BIGINT NOT NULL,
    package_id BIGINT NOT NULL,
    helper_id BIGINT NULL,
    scheduled_start TIMESTAMP NOT NULL,
    scheduled_end TIMESTAMP NOT NULL,
    address TEXT NOT NULL,
    task_notes TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'REQUESTED' COMMENT 'REQUESTED, MATCHED, ACCEPTED, PAID, IN_PROGRESS, COMPLETED, CANCELLED',
    total_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bookings_family FOREIGN KEY (family_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_bookings_parent FOREIGN KEY (parent_id) REFERENCES parents (id) ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_package FOREIGN KEY (package_id) REFERENCES packages (id) ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_helper FOREIGN KEY (helper_id) REFERENCES helper_profiles (id) ON DELETE SET NULL,
    INDEX idx_bookings_family (family_id),
    INDEX idx_bookings_helper (helper_id),
    INDEX idx_bookings_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Payments table
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL UNIQUE,
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING, SUCCESS, FAILED, REFUNDED',
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE,
    INDEX idx_payments_order (razorpay_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Visit Logs table
CREATE TABLE IF NOT EXISTS visit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL UNIQUE,
    checkin_at TIMESTAMP NULL,
    checkout_at TIMESTAMP NULL,
    notes TEXT,
    photo_keys TEXT COMMENT 'JSON array or comma-separated list of keys',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_visit_logs_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL UNIQUE,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Incidents table
CREATE TABLE IF NOT EXISTS incidents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    reported_by BIGINT NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' COMMENT 'LOW, MEDIUM, HIGH, CRITICAL',
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' COMMENT 'OPEN, INVESTIGATING, RESOLVED, CLOSED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_incidents_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE,
    CONSTRAINT fk_incidents_reporter FOREIGN KEY (reported_by) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_incidents_booking (booking_id),
    INDEX idx_incidents_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    channel VARCHAR(20) NOT NULL COMMENT 'WHATSAPP, SMS, EMAIL, IN_APP',
    template VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING, SENT, FAILED',
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Audit Log table
CREATE TABLE IF NOT EXISTS audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    actor_id BIGINT NULL,
    action VARCHAR(255) NOT NULL,
    entity VARCHAR(50) NOT NULL,
    entity_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_log_actor FOREIGN KEY (actor_id) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_audit_log_actor (actor_id),
    INDEX idx_audit_log_entity (entity, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
