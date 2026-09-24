const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Creates a signed JWT carrying the account's id and role.
 * `role` is either "admin" or "student" and is what every protected
 * route uses to decide access — it is set here on the server, never
 * trusted from client input.
 *
 * For students, year/section are embedded too so the timetable query
 * service can filter directly off the verified token instead of a
 * client-supplied year/section (this is what stops a student from
 * manipulating query params to see another section's exams).
 */
function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
}

module.exports = generateToken;
