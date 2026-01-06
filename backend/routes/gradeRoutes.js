const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const permit = require("../middleware/role");
const gradeController = require("../controllers/gradeController");

/**
 * Grade Management Routes
 */

// Submit a grade for a student's assignment (Teacher/Admin only)
router.post(
  "/:assignmentId/grade",
  auth,
  permit("teacher", "admin"),
  gradeController.gradeAssignment
);

// Add feedback to a submission (Teacher/Admin only)
router.post(
  "/:assignmentId/feedback",
  auth,
  permit("teacher", "admin"),
  gradeController.addFeedback
);

// Get all submissions for an assignment (Teacher/Admin)
router.get(
  "/assignment/:assignmentId",
  auth,
  permit("teacher", "admin"),
  gradeController.getAssignmentSubmissions
);

// Get all grades for a course (Teacher/Admin)
router.get(
  "/course/:courseId",
  auth,
  permit("teacher", "admin"),
  gradeController.getCourseGrades
);

// Get grades for a student in a specific course (Teacher/Admin or Student viewing own)
router.get(
  "/student/:studentId/course/:courseId",
  auth,
  gradeController.getStudentCourseGrades
);

// Update a grade for a specific submission (Teacher/Admin only)
router.put(
  "/:assignmentId/:studentId",
  auth,
  permit("teacher", "admin"),
  gradeController.updateGrade
);

module.exports = router;

