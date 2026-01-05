const express = require("express");
const router = express.Router();

const assignmentController = require("../controllers/assignmentController");
const auth = require("../middleware/auth");
const permit = require("../middleware/role");
const assistantPermission = require("../middleware/assistantPermission");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

/**
 * Requirement 3 – Feature 3 Routes
 */

// Create assignment (Teacher/Admin)
router.post(
  "/",
  auth,
  permit("teacher", "admin"),
  assignmentController.createAssignment
);

// Get assignments by course (All logged-in users)
router.get(
  "/course/:courseId",
  auth,
  assignmentController.getAssignmentsByCourse
);

// Get upcoming deadlines (All logged-in users)
router.get(
  "/deadlines/upcoming",
  auth,
  assignmentController.getUpcomingDeadlines
);

// Alias: support older clients requesting /api/assignments/upcoming
router.get(
  "/upcoming",
  auth,
  assignmentController.getUpcomingDeadlines
);

// Get assignment by ID (All logged-in users)
router.get(
  "/:id",
  auth,
  assignmentController.getAssignmentById
);

// Get submissions for assignment (Teacher/Admin)
router.get('/:id/submissions', auth, permit('teacher','admin'), assignmentController.getSubmissionsByAssignment);

// Update assignment (Teacher/Admin)
router.put(
  "/:id",
  auth,
  permit("teacher", "admin"),
  assignmentController.updateAssignment
);

// Student submit assignment
router.post('/:id/submit', auth, permit('student'), upload.single('attachment'), assignmentController.submitAssignment);

// Delete assignment (Teacher/Admin)
router.delete(
  "/:id",
  auth,
  permit("teacher", "admin"),
  assignmentController.deleteAssignment
);

// Duplicate assignment (Teacher/Admin)
router.post(
  "/:id/duplicate",
  auth,
  permit("teacher", "admin"),
  assignmentController.duplicateAssignment
);

// Assistant permission
router.post(
  "/",
  auth,
  permit("teacher", "admin", "assistant"),
  assistantPermission("canManageAssignments"),
  assignmentController.createAssignment
);
module.exports = router;

