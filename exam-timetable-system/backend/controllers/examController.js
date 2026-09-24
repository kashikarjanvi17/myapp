const pool = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * POST /api/exams
 * Admin only. Body validated by validateExamPayload middleware first.
 */
const createExam = asyncHandler(async (req, res) => {
  const { subject, academic_year, section, exam_date, start_time, end_time } = req.body;
  const createdBy = req.user.id; // admin id, from verified token

  const [result] = await pool.query(
    `INSERT INTO exams (subject, academic_year, section, exam_date, start_time, end_time, status, created_by)
     VALUES (?, ?, ?, ?, ?, ?, 'SCHEDULED', ?)`,
    [subject.trim(), academic_year.trim(), section.trim(), exam_date, start_time, end_time, createdBy]
  );

  const [rows] = await pool.query('SELECT * FROM exams WHERE id = ?', [result.insertId]);

  res.status(201).json({ success: true, message: 'Exam created successfully.', exam: rows[0] });
});

/**
 * GET /api/exams
 * Admin only. Returns every exam (including cancelled ones), with
 * optional ?academic_year=&section= filters for the admin's own
 * convenience when browsing (these are admin-only filters — they do
 * NOT apply to the student-facing route, which never trusts query params).
 */
const getAllExams = asyncHandler(async (req, res) => {
  const { academic_year, section } = req.query;

  let query = 'SELECT * FROM exams WHERE 1=1';
  const params = [];

  if (academic_year) {
    query += ' AND academic_year = ?';
    params.push(academic_year);
  }
  if (section) {
    query += ' AND section = ?';
    params.push(section);
  }
  query += ' ORDER BY exam_date ASC, start_time ASC';

  const [rows] = await pool.query(query, params);
  res.json({ success: true, count: rows.length, exams: rows });
});

/**
 * GET /api/exams/:id
 * Admin only.
 */
const getExamById = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM exams WHERE id = ?', [req.params.id]);

  if (rows.length === 0) {
    return res.status(404).json({ success: false, message: 'Exam not found.' });
  }
  res.json({ success: true, exam: rows[0] });
});

/**
 * PUT /api/exams/:id
 * Admin only. Body validated by validateExamPayload middleware first.
 */
const updateExam = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { subject, academic_year, section, exam_date, start_time, end_time } = req.body;

  const [existing] = await pool.query('SELECT id FROM exams WHERE id = ?', [id]);
  if (existing.length === 0) {
    return res.status(404).json({ success: false, message: 'Exam not found.' });
  }

  await pool.query(
    `UPDATE exams
     SET subject = ?, academic_year = ?, section = ?, exam_date = ?, start_time = ?, end_time = ?
     WHERE id = ?`,
    [subject.trim(), academic_year.trim(), section.trim(), exam_date, start_time, end_time, id]
  );

  const [rows] = await pool.query('SELECT * FROM exams WHERE id = ?', [id]);
  res.json({ success: true, message: 'Exam updated successfully.', exam: rows[0] });
});

/**
 * PATCH /api/exams/:id/cancel
 * Admin only. Soft-cancel rather than hard delete, so history is preserved.
 */
const cancelExam = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [existing] = await pool.query('SELECT id FROM exams WHERE id = ?', [id]);
  if (existing.length === 0) {
    return res.status(404).json({ success: false, message: 'Exam not found.' });
  }

  await pool.query(`UPDATE exams SET status = 'CANCELLED' WHERE id = ?`, [id]);
  res.json({ success: true, message: 'Exam cancelled successfully.' });
});

/**
 * DELETE /api/exams/:id
 * Admin only. Hard delete, for completeness — cancelExam is the
 * recommended path per the spec's "cancel" language.
 */
const deleteExam = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [result] = await pool.query('DELETE FROM exams WHERE id = ?', [id]);
  if (result.affectedRows === 0) {
    return res.status(404).json({ success: false, message: 'Exam not found.' });
  }

  res.json({ success: true, message: 'Exam deleted successfully.' });
});

module.exports = { createExam, getAllExams, getExamById, updateExam, cancelExam, deleteExam };
