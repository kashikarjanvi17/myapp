const pool = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');
const { getExamsForStudent } = require('../services/timetableService');

/**
 * GET /api/students/me
 * Student only. Returns the logged-in student's own profile.
 */
const getMyProfile = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, name, email, academic_year, section FROM students WHERE id = ?',
    [req.user.id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Student profile not found.' });
  }
  res.json({ success: true, student: rows[0] });
});

/**
 * GET /api/students/me/timetable
 * Student only.
 *
 * Deliberately ignores any year/section sent in the query string —
 * it always uses req.user.academicYear / req.user.section, which come
 * from the verified JWT set at login. This is the concrete enforcement
 * of "Students can strictly view only exams belonging to their own
 * year and section" and defeats the "manipulate API parameters" edge case.
 */
const getMyTimetable = asyncHandler(async (req, res) => {
  const { academicYear, section } = req.user;

  if (!academicYear || !section) {
    return res.status(400).json({
      success: false,
      message: 'Your profile is missing academic year or section. Please contact the administrator.',
    });
  }

  const exams = await getExamsForStudent(academicYear, section);

  res.json({
    success: true,
    academicYear,
    section,
    count: exams.length, // 0 is a perfectly valid, gracefully-handled result
    exams,
  });
});

module.exports = { getMyProfile, getMyTimetable };
