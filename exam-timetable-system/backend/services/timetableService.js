const pool = require('../config/db');

/**
 * Filtered Timetable Query Service
 * ---------------------------------
 * The single source of truth for "which exams can this student see".
 * Implements: student.year === exam.year && student.section === exam.section
 *
 * IMPORTANT: academicYear and section are always taken from the verified
 * JWT (req.user), never from req.query/req.params/req.body. This is what
 * prevents a student from manipulating request parameters to view another
 * section's exams (see edge case in the spec) — there is no client input
 * for this service to trust in the first place.
 *
 * Cancelled exams are excluded from the student-facing view; students
 * should only ever see exams that are actually going to happen.
 */
async function getExamsForStudent(academicYear, section) {
  const [rows] = await pool.query(
    `SELECT id, subject, academic_year, section, exam_date, start_time, end_time, status
     FROM exams
     WHERE academic_year = ? AND section = ? AND status = 'SCHEDULED'
     ORDER BY exam_date ASC, start_time ASC`,
    [academicYear, section]
  );
  return rows; // empty array if no exams exist for this year/section — handled gracefully by the caller
}

module.exports = { getExamsForStudent };
