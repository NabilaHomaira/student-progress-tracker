const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const permit = require("../middleware/role");
const submissionController = require("../controllers/submissionController");

/**
 * Assignment Submission Routes
 */

// Get submissions for a course (Teacher/Admin)
router.get(
  "/course/:courseId",
  auth,
  permit("teacher", "admin"),
  submissionController.getSubmissionsByCourse
);

// Get submissions for a student (Student can view own, Teacher/Admin can view any)
router.get(
  "/student/:studentId",
  auth,
  submissionController.getStudentSubmissions
);

// Get a specific submission (Student can view own, Teacher/Admin can view any)
router.get(
  "/:submissionId",
  auth,
  submissionController.getSubmission
);

// Update submission with learning tips and feedback (Teacher/Admin only)
router.put(
  "/:submissionId",
  auth,
  permit("teacher", "admin"),
  submissionController.updateSubmission
);

// Get submissions for an assignment (Teacher/Admin)
router.get(
  "/assignment/:assignmentId",
  auth,
  submissionController.getAssignmentSubmissions
);

module.exports = router;
