-- ========================================================
-- DearHand Sample Production Seed Data (V3__sample_data.sql)
-- Populates comprehensive realistic sample entries across all tables:
-- Users (Families & Helpers), Parents, Helper Profiles & Docs,
-- Care Packages, Bookings, Payments, Visit Logs, Reviews, Incidents,
-- Notifications, and Audit Logs.
-- ========================================================

-- Passwords hashed with BCrypt (Cost 10)
-- 'Admin@123'  -> $2a$10$HbzEL/ccGuZTT3RJ4mg4m.HBwdrdDmIOgI.LOs8j03YWiy0uRigeC
-- 'Family@123' -> $2a$10$syd/NUB.nTrcoFSvdgvNF.zDmLq9moUztppRsQYvHyS1KAuGVU9Oy
-- 'Helper@123' -> $2a$10$5NIDLolXtwcdafxtgy.5S.4nY9F.PvgKAgNXNvRbeIjJk1WRW2Gh2

-- 1. Additional Families & Helpers
INSERT INTO users (id, role, name, phone, email, password_hash, status)
VALUES 
    (4, 'FAMILY', 'Priya Nair', '+919845012345', 'priya.nair@example.com', '$2a$10$syd/NUB.nTrcoFSvdgvNF.zDmLq9moUztppRsQYvHyS1KAuGVU9Oy', 'ACTIVE'),
    (5, 'FAMILY', 'Arun Venkatesh', '+919900114477', 'arun.v@example.com', '$2a$10$syd/NUB.nTrcoFSvdgvNF.zDmLq9moUztppRsQYvHyS1KAuGVU9Oy', 'ACTIVE'),
    (6, 'FAMILY', 'Ananya Deshpande', '+919980556644', 'ananya.desh@example.com', '$2a$10$syd/NUB.nTrcoFSvdgvNF.zDmLq9moUztppRsQYvHyS1KAuGVU9Oy', 'ACTIVE'),
    (7, 'HELPER', 'Manjula Gowda', '+919844223344', 'manjula.care@example.com', '$2a$10$5NIDLolXtwcdafxtgy.5S.4nY9F.PvgKAgNXNvRbeIjJk1WRW2Gh2', 'ACTIVE'),
    (8, 'HELPER', 'Ramesh Babu', '+919731556677', 'ramesh.b@example.com', '$2a$10$5NIDLolXtwcdafxtgy.5S.4nY9F.PvgKAgNXNvRbeIjJk1WRW2Gh2', 'ACTIVE'),
    (9, 'HELPER', 'Chethan Murthy', '+919845998877', 'chethan.m@example.com', '$2a$10$5NIDLolXtwcdafxtgy.5S.4nY9F.PvgKAgNXNvRbeIjJk1WRW2Gh2', 'ACTIVE')
ON DUPLICATE KEY UPDATE email=email;

-- 2. Helper Profiles
INSERT INTO helper_profiles (id, user_id, bio, languages, skills, has_licence, licence_no, licence_expiry, vehicle_type, years_experience, status, rating_avg)
VALUES 
    (2, 7, 'Certified eldercare companion with 7 years of nursing background in Mysuru. Specialized in diabetic diet management, post-operative care, and compassionate conversation.', 'Kannada, Tamil, English', 'Elderly Companion, Medication Management, First Aid, Diabetic Care, Mobility Support', FALSE, NULL, NULL, 'Two Wheeler (Honda Activa)', 7, 'APPROVED', 4.95),
    (3, 8, 'Former defense services driver and verified senior care assistant in Mysuru with 10 years experience. Highly reliable for hospital escorts, wheelchair mobility, and government office paperwork.', 'Kannada, Hindi, English', 'Hospital Escort, Safe Driving, Wheelchair Transfer, Emergency First Aid, Grocery & Banking', TRUE, 'KA09-2015-007890', '2032-08-20', 'Four Wheeler (Toyota Etios)', 10, 'APPROVED', 4.88),
    (4, 9, 'Energetic youth volunteer and certified home companion in Mysuru. Excellent with tech support, smartphone tutoring for seniors, and fast errand runs.', 'Kannada, English', 'Tech Support & UPI, Errand Runs, Daily Walking Companion, Reading & Conversation', TRUE, 'KA09-2020-001298', '2040-01-10', 'Two Wheeler (TVS Jupiter)', 3, 'APPROVED', 4.80)
ON DUPLICATE KEY UPDATE status=status;

-- 3. Helper Documents
INSERT INTO helper_documents (id, helper_id, type, file_key, verified_by, verified_at)
VALUES
    (1, 1, 'GOVERNMENT_ID', 'uploads/documents/suresh_aadhaar.pdf', 1, NOW()),
    (2, 1, 'DRIVING_LICENCE', 'uploads/documents/suresh_dl.pdf', 1, NOW()),
    (3, 1, 'POLICE_VERIFICATION', 'uploads/documents/suresh_police_clearance.pdf', 1, NOW()),
    (4, 2, 'GOVERNMENT_ID', 'uploads/documents/manjula_aadhaar.pdf', 1, NOW()),
    (5, 2, 'POLICE_VERIFICATION', 'uploads/documents/manjula_pcc.pdf', 1, NOW()),
    (6, 2, 'HEALTH_DECLARATION', 'uploads/documents/manjula_health.pdf', 1, NOW()),
    (7, 3, 'GOVERNMENT_ID', 'uploads/documents/ramesh_aadhaar.pdf', 1, NOW()),
    (8, 3, 'DRIVING_LICENCE', 'uploads/documents/ramesh_dl.pdf', 1, NOW()),
    (9, 3, 'POLICE_VERIFICATION', 'uploads/documents/ramesh_pcc.pdf', 1, NOW()),
    (10, 4, 'GOVERNMENT_ID', 'uploads/documents/chethan_aadhaar.pdf', 1, NOW()),
    (11, 4, 'DRIVING_LICENCE', 'uploads/documents/chethan_dl.pdf', 1, NOW())
ON DUPLICATE KEY UPDATE file_key=file_key;

-- 4. Additional Parents in Mysuru
INSERT INTO parents (id, family_user_id, name, age, address, city, language, care_notes, emergency_contact_name, emergency_contact_phone)
VALUES 
    (2, 4, 'Smt. Lakshmi Nair', 72, 'Flat 302, Green Acres Apt, Gokulam 3rd Stage, Mysuru 570002', 'Mysuru', 'Kannada, Malayalam, English', 'Mild arthritis in knees. Requires assistance with grocery errands, morning walk escort, and prescription refills from Apollo Pharmacy.', 'Priya Nair (Daughter in Chennai)', '+919845012345'),
    (3, 5, 'Prof. H. R. Venkatesh & Sunanda Venkatesh', 79, 'No 42, 5th Cross, Saraswathipuram, Mysuru 570009', 'Mysuru', 'Kannada, English', 'Retired university professor. Needs companion for morning park walks, library book exchanges, and assistance with online banking/UPI bill payments.', 'Arun Venkatesh (Son in Singapore)', '+919900114477'),
    (4, 6, 'Smt. Radha Deshpande', 68, 'Plot 118, Anikethana Road, Kuvempunagar, Mysuru 570023', 'Mysuru', 'Kannada, Marathi, Hindi', 'Needs companion for monthly cardiology review at Columbia Asia Hospital and assistance with gentle physiotherapy stretches at home.', 'Ananya Deshpande (Daughter in Hyderabad)', '+919980556644')
ON DUPLICATE KEY UPDATE name=name;

-- 5. Additional Package (Monthly Plan)
INSERT INTO packages (id, name, type, duration_hours, base_price, active)
VALUES 
    (4, 'Monthly Companionship & Care (20 Visits)', 'MONTHLY', 80, 14999.00, TRUE)
ON DUPLICATE KEY UPDATE name=name;

-- 6. Bookings across lifecycle states
INSERT INTO bookings (id, family_id, parent_id, package_id, helper_id, scheduled_start, scheduled_end, address, task_notes, status, total_amount)
VALUES 
    (1, 2, 1, 1, 1, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(DATE_SUB(NOW(), INTERVAL 3 DAY), INTERVAL 2 HOUR), 'No 14, 3rd Main, Jayalakshmipuram, Mysuru 570012', 'Accompanied Dr. Rao to Apollo Clinic for blood test and collected cardiac medications.', 'COMPLETED', 499.00),
    (2, 4, 2, 2, 2, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_ADD(NOW(), INTERVAL 2 HOUR), 'Flat 302, Green Acres Apt, Gokulam 3rd Stage, Mysuru 570002', 'Morning walk escort, prepared diabetic breakfast, and assisted with Chamundeshwari temple visit.', 'IN_PROGRESS', 999.00),
    (3, 5, 3, 1, 3, DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 2 HOUR), 'No 42, 5th Cross, Saraswathipuram, Mysuru 570009', 'Help Prof. Venkatesh setup electricity autopay on smartphone and deposit pension cheque at SBI Saraswathipuram branch.', 'PAID', 499.00),
    (4, 6, 4, 3, 2, DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 3 DAY), INTERVAL 8 HOUR), 'Plot 118, Anikethana Road, Kuvempunagar, Mysuru 570023', 'Full day companion for outpatient cardiology review, pharmacy pickup, and post-appointment rest assistance.', 'ACCEPTED', 1799.00),
    (5, 2, 1, 2, NULL, DATE_ADD(NOW(), INTERVAL 4 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 4 DAY), INTERVAL 4 HOUR), 'No 14, 3rd Main, Jayalakshmipuram, Mysuru 570012', 'Need a trusted helper with four-wheeler to take parents to family function in Kuvempunagar.', 'REQUESTED', 999.00),
    (6, 4, 2, 1, 4, DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_ADD(DATE_SUB(NOW(), INTERVAL 6 DAY), INTERVAL 2 HOUR), 'Flat 302, Green Acres Apt, Gokulam 3rd Stage, Mysuru 570002', 'Urgent prescription delivery and digital blood pressure monitor setup.', 'COMPLETED', 499.00)
ON DUPLICATE KEY UPDATE status=status;

-- 7. Payments
INSERT INTO payments (id, booking_id, razorpay_order_id, razorpay_payment_id, amount, status, paid_at)
VALUES 
    (1, 1, 'order_Mysuru_001', 'pay_Mysuru_Live_001', 499.00, 'SUCCESS', DATE_SUB(NOW(), INTERVAL 3 DAY)),
    (2, 2, 'order_Mysuru_002', 'pay_Mysuru_Live_002', 999.00, 'SUCCESS', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
    (3, 3, 'order_Mysuru_003', 'pay_Mysuru_Live_003', 499.00, 'SUCCESS', NOW()),
    (4, 4, 'order_Mysuru_004', NULL, 1799.00, 'PENDING', NULL),
    (5, 6, 'order_Mysuru_006', 'pay_Mysuru_Live_006', 499.00, 'SUCCESS', DATE_SUB(NOW(), INTERVAL 6 DAY))
ON DUPLICATE KEY UPDATE status=status;

-- 8. Visit Logs
INSERT INTO visit_logs (id, booking_id, checkin_at, checkout_at, notes, photo_keys)
VALUES 
    (1, 1, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(DATE_SUB(NOW(), INTERVAL 3 DAY), INTERVAL 2 HOUR), 'Accompanied Dr. Rao to Apollo Clinic. Blood samples drawn comfortably. Picked up prescribed cardiac medicines and fruit from Nilgiris. Returned Dr. Rao safely home.', '["uploads/visits/b1_clinic_receipt.jpg","uploads/visits/b1_medicines.jpg"]'),
    (2, 2, DATE_SUB(NOW(), INTERVAL 2 HOUR), NULL, 'Arrived at Gokulam residence on time. Assisted Smt. Lakshmi with her morning park walk and served mild green tea. Preparing to leave for Chamundeshwari temple.', '["uploads/visits/b2_morning_checkin.jpg"]'),
    (3, 6, DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_ADD(DATE_SUB(NOW(), INTERVAL 6 DAY), INTERVAL 2 HOUR), 'Delivered prescription medicine from Apollo Pharmacy Gokulam and demonstrated Omron digital BP monitor setup to Smt. Lakshmi.', '["uploads/visits/b6_receipt.jpg","uploads/visits/b6_bp_check.jpg"]')
ON DUPLICATE KEY UPDATE notes=notes;

-- 9. Reviews
INSERT INTO reviews (id, booking_id, rating, comment)
VALUES 
    (1, 1, 5, 'Suresh was exceptionally polite, patient, and punctual. My father felt very safe and comfortable. Living in Bengaluru, knowing DearHand is there in Mysuru gives our family immense peace of mind.'),
    (2, 6, 5, 'Chethan was very quick, courteous, and patiently explained the blood pressure monitor to my mother. Fantastic service!')
ON DUPLICATE KEY UPDATE comment=comment;

-- 10. Incidents
INSERT INTO incidents (id, booking_id, reported_by, description, severity, status)
VALUES 
    (1, 1, 3, 'Mild road blockage on Kalidasa Road due to Dasara procession preparations. Re-routed via Temple Road, delayed arrival at clinic by 8 minutes. Informed family immediately via WhatsApp.', 'LOW', 'RESOLVED'),
    (2, 2, 7, 'Pharmacy was out of stock for the specific eye drop brand. Consulted family doctor over phone and obtained safe alternate brand with daughter Priya Nair approval.', 'MEDIUM', 'RESOLVED')
ON DUPLICATE KEY UPDATE status=status;

-- 11. Notifications
INSERT INTO notifications (id, user_id, channel, template, status, sent_at)
VALUES 
    (1, 2, 'WHATSAPP', 'Booking #1 completed successfully. Suresh Kumar spent 2 hours with Dr. K. S. Rao. View visit notes & pharmacy receipt in app.', 'SENT', DATE_SUB(NOW(), INTERVAL 3 DAY)),
    (2, 4, 'SMS', 'DearHand Alert: Helper Manjula Gowda has checked in at your mother Lakshmi Nair residence in Gokulam.', 'SENT', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
    (3, 5, 'EMAIL', 'Payment confirmed for Booking #3. Ramesh Babu is assigned and scheduled for tomorrow 11:00 AM.', 'SENT', NOW()),
    (4, 3, 'IN_APP', 'You received a 5-star review from Rohan Rao for your visit with Dr. K. S. Rao!', 'READ', DATE_SUB(NOW(), INTERVAL 3 DAY)),
    (5, 6, 'WHATSAPP', 'Helper Manjula Gowda has accepted Booking #4 for Smt. Radha Deshpande scheduled in 3 days.', 'SENT', NOW()),
    (6, 1, 'IN_APP', 'New booking request #5 submitted by Rohan Rao awaiting helper assignment.', 'PENDING', NOW())
ON DUPLICATE KEY UPDATE status=status;

-- 12. Audit Log
INSERT INTO audit_log (id, actor_id, action, entity, entity_id, created_at)
VALUES 
    (1, 1, 'VERIFY_HELPER_PROFILE', 'HelperProfile', 1, DATE_SUB(NOW(), INTERVAL 10 DAY)),
    (2, 1, 'VERIFY_HELPER_PROFILE', 'HelperProfile', 2, DATE_SUB(NOW(), INTERVAL 8 DAY)),
    (3, 1, 'VERIFY_HELPER_PROFILE', 'HelperProfile', 3, DATE_SUB(NOW(), INTERVAL 7 DAY)),
    (4, 2, 'CREATE_BOOKING', 'Booking', 1, DATE_SUB(NOW(), INTERVAL 4 DAY)),
    (5, 4, 'CREATE_BOOKING', 'Booking', 2, DATE_SUB(NOW(), INTERVAL 1 DAY)),
    (6, 5, 'PAYMENT_SUCCESS', 'Payment', 3, NOW()),
    (7, 7, 'CHECKIN_VISIT', 'VisitLog', 2, DATE_SUB(NOW(), INTERVAL 2 HOUR))
ON DUPLICATE KEY UPDATE action=action;
