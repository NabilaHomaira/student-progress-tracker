// routes/feedbackRoutes.js
const express = require('express');
const router = express.Router();

const feedbackController = require('../controllers/feedbackController');
const auth = require('../middleware/auth');
const permit = require('../middleware/role');

router.patch(
  '/:submissionId',
  auth,
  permit('teacher', 'admin'),
  feedbackController.addFeedback
);

// Compatibility endpoint: grade by assignmentId + studentId
router.post('/grade', auth, permit('teacher', 'admin'), feedbackController.gradeSubmission);

// Compatibility endpoint: add feedback by assignmentId + studentId
router.post('/', auth, permit('teacher', 'admin'), feedbackController.addFeedbackByAssignmentStudent);

// Get my submission/feedback for an assignment
router.get('/my/:assignmentId', auth, permit('student'), feedbackController.getMyFeedback);

module.exports = router;
