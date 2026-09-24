/**
 * Validation middleware for exam create/update requests.
 * Centralizes the "Business Logic Rules" and "Edge Cases" from the spec:
 *   - subject, academic_year, section, exam_date, start_time, end_time
 *     are all mandatory
 *   - end_time must be strictly after start_time
 *   - exam_date must be a real, well-formed date
 */

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/; // HH:mm or HH:mm:ss

function validateExamPayload(req, res, next) {
  const { subject, academic_year, section, exam_date, start_time, end_time } = req.body;

  const errors = [];

  if (!subject || typeof subject !== 'string' || !subject.trim()) {
    errors.push('Subject is required.');
  }
  if (!academic_year || typeof academic_year !== 'string' || !academic_year.trim()) {
    errors.push('Academic year is required.');
  }
  if (!section || typeof section !== 'string' || !section.trim()) {
    errors.push('Section is required.');
  }
  if (!exam_date || isNaN(Date.parse(exam_date))) {
    errors.push('A valid exam date is required.');
  }
  if (!start_time || !TIME_REGEX.test(start_time)) {
    errors.push('A valid start time (HH:mm) is required.');
  }
  if (!end_time || !TIME_REGEX.test(end_time)) {
    errors.push('A valid end time (HH:mm) is required.');
  }

  // Only compare times if both are individually well-formed
  if (start_time && end_time && TIME_REGEX.test(start_time) && TIME_REGEX.test(end_time)) {
    const [sh, sm] = start_time.split(':').map(Number);
    const [eh, em] = end_time.split(':').map(Number);
    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;
    if (endMinutes <= startMinutes) {
      errors.push('End time must be strictly after start time.');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed.', errors });
  }

  next();
}

module.exports = { validateExamPayload };
