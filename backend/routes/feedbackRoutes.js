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

module.exports = router;
