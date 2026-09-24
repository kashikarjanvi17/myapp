-- ============================================================
-- Exam Timetable Management System - Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS exam_timetable_db;
USE exam_timetable_db;

-- ------------------------------------------------------------
-- Admins table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- Students table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  academic_year VARCHAR(50) NOT NULL,   -- e.g. "2nd Year"
  section VARCHAR(10) NOT NULL,         -- e.g. "A"
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- Exams table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS exams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject VARCHAR(150) NOT NULL,
  academic_year VARCHAR(50) NOT NULL,
  section VARCHAR(10) NOT NULL,
  exam_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status ENUM('SCHEDULED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_exam_admin FOREIGN KEY (created_by) REFERENCES admins(id),
  CONSTRAINT chk_time_order CHECK (end_time > start_time),
  INDEX idx_year_section (academic_year, section)
);

-- ------------------------------------------------------------
-- Seed data
-- NOTE: password_hash values are NOT inserted here because bcrypt hashes
-- must be generated at runtime with the project's bcrypt salt rounds.
-- Run `npm run seed` (backend/utils/seed.js) after creating this schema —
-- it inserts the admin, sample students, and sample exams below, with a
-- working password of "Password123" for every account.
-- ------------------------------------------------------------
