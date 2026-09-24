const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const generateToken = require('../utils/generateToken');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * POST /api/auth/admin/login
 * Body: { username, password }
 */
const adminLogin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }

  const [rows] = await pool.query('SELECT * FROM admins WHERE username = ?', [username]);
  const admin = rows[0];

  if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
    return res.status(401).json({ success: false, message: 'Invalid username or password.' });
  }

  const token = generateToken({ id: admin.id, role: 'admin', username: admin.username });

  res.json({
    success: true,
    token,
    user: { id: admin.id, username: admin.username, role: 'admin' },
  });
});

/**
 * POST /api/auth/student/login
 * Body: { email, password }
 *
 * Edge case handled: a student profile missing academic_year or section
 * is rejected at login rather than being allowed to silently see an
 * unfiltered (or wrongly filtered) timetable later.
 */
const studentLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const [rows] = await pool.query('SELECT * FROM students WHERE email = ?', [email]);
  const student = rows[0];

  if (!student || !(await bcrypt.compare(password, student.password_hash))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  if (!student.academic_year || !student.section) {
    return res.status(400).json({
      success: false,
      message: 'Your profile is missing academic year or section. Please contact the administrator.',
    });
  }

  const token = generateToken({
    id: student.id,
    role: 'student',
    academicYear: student.academic_year,
    section: student.section,
  });

  res.json({
    success: true,
    token,
    user: {
      id: student.id,
      name: student.name,
      email: student.email,
      academicYear: student.academic_year,
      section: student.section,
      role: 'student',
    },
  });
});

/**
 * POST /api/auth/student/register
 * Body: { name, email, password, academic_year, section }
 * Basic self-registration endpoint so the system is testable end-to-end.
 */
const studentRegister = asyncHandler(async (req, res) => {
  const { name, email, password, academic_year, section } = req.body;

  if (!name || !email || !password || !academic_year || !section) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, password, academic year, and section are all required.',
    });
  }

  const password_hash = await bcrypt.hash(password, 10);

  const [result] = await pool.query(
    `INSERT INTO students (name, email, password_hash, academic_year, section) VALUES (?, ?, ?, ?, ?)`,
    [name, email, password_hash, academic_year, section]
  );

  res.status(201).json({
    success: true,
    message: 'Student registered successfully.',
    studentId: result.insertId,
  });
});

module.exports = { adminLogin, studentLogin, studentRegister };
