const express = require("express");
const router = express.Router();

const assignmentController = require("../controllers/assignmentController");
const auth = require("../middleware/auth");
const permit = require("../middleware/role");

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

// Get assignment by ID (All logged-in users)
router.get(
  "/:id",
  auth,
  assignmentController.getAssignmentById
);

// Update assignment (Teacher/Admin)
router.put(
  "/:id",
  auth,
  permit("teacher", "admin"),
  assignmentController.updateAssignment
);

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

module.exports = router;
