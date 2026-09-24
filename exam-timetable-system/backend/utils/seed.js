/**
 * Seed script — populates the database with a test admin, three test
 * students (covering three different year/section combinations so the
 * filtering logic is easy to verify), and a handful of sample exams.
 *
 * Run with:  npm run seed
 * (schema.sql must already have been executed against the database)
 *
 * All seeded accounts use the password: Password123
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const TEST_PASSWORD = 'Password123';

async function seed() {
  const hash = await bcrypt.hash(TEST_PASSWORD, 10);

  try {
    // --- Admin -------------------------------------------------
    await pool.query(
      `INSERT INTO admins (username, password_hash)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
      ['admin', hash]
    );
    const [[admin]] = await pool.query(
      'SELECT id FROM admins WHERE username = ?',
      ['admin']
    );

    // --- Students ------------------------------------------------
    const students = [
      ['Aditi Rao', 'aditi.2a@example.com', '2nd Year', 'A'],
      ['Rohan Mehta', 'rohan.2b@example.com', '2nd Year', 'B'],
      ['Sara Khan', 'sara.3a@example.com', '3rd Year', 'A'],
    ];
    for (const [name, email, year, section] of students) {
      await pool.query(
        `INSERT INTO students (name, email, password_hash, academic_year, section)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
        [name, email, hash, year, section]
      );
    }

    // --- Sample exams --------------------------------------------
    const exams = [
      ['Data Structures', '2nd Year', 'A', '2026-10-15', '10:00:00', '12:00:00'],
      ['Operating Systems', '2nd Year', 'A', '2026-10-17', '10:00:00', '12:00:00'],
      ['Database Systems', '2nd Year', 'B', '2026-10-15', '14:00:00', '16:00:00'],
      ['Computer Networks', '3rd Year', 'A', '2026-10-18', '09:00:00', '11:00:00'],
    ];
    for (const [subject, year, section, date, start, end] of exams) {
      const [[existing]] = await pool.query(
        `SELECT id FROM exams WHERE subject = ? AND academic_year = ? AND section = ? AND exam_date = ?`,
        [subject, year, section, date]
      );
      if (!existing) {
        await pool.query(
          `INSERT INTO exams (subject, academic_year, section, exam_date, start_time, end_time, status, created_by)
           VALUES (?, ?, ?, ?, ?, ?, 'SCHEDULED', ?)`,
          [subject, year, section, date, start, end, admin.id]
        );
      }
    }

    console.log('✅ Seed complete.');
    console.log('   Admin login    -> username: admin           password: Password123');
    console.log('   Student login  -> email: aditi.2a@example.com  password: Password123 (2nd Year - A)');
    console.log('   Student login  -> email: rohan.2b@example.com  password: Password123 (2nd Year - B)');
    console.log('   Student login  -> email: sara.3a@example.com   password: Password123 (3rd Year - A)');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await pool.end();
  }
}

seed();
