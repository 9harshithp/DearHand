-- ========================================================
-- DearHand Migration: Add medical_history to parents table (V4__add_medical_history_to_parents.sql)
-- ========================================================

ALTER TABLE parents ADD COLUMN medical_history TEXT AFTER care_notes;
