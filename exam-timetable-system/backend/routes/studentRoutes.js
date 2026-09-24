const express = require('express');
const router = express.Router();
const { getMyProfile, getMyTimetable } = require('../controllers/studentController');
const { authenticate, requireRole } = require('../middleware/auth');

// Every route in this file requires a valid student token.
router.use(authenticate, requireRole('student'));

router.get('/me', getMyProfile);
router.get('/me/timetable', getMyTimetable);

module.exports = router;
