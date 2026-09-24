const express = require('express');
const router = express.Router();
const {
  createExam,
  getAllExams,
  getExamById,
  updateExam,
  cancelExam,
  deleteExam,
} = require('../controllers/examController');
const { authenticate, requireRole } = require('../middleware/auth');
const { validateExamPayload } = require('../middleware/validate');

// Every route in this file requires a valid admin token.
router.use(authenticate, requireRole('admin'));

router.post('/', validateExamPayload, createExam);
router.get('/', getAllExams);
router.get('/:id', getExamById);
router.put('/:id', validateExamPayload, updateExam);
router.patch('/:id/cancel', cancelExam);
router.delete('/:id', deleteExam);

module.exports = router;
