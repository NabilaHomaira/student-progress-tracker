const express = require("express");
const router = express.Router();
const assignmentController = require("../controllers/assignmentController");

// Create a new assignment
router.post("/", assignmentController.createAssignment);

// Get all assignments for a course
router.get("/course/:courseId", assignmentController.getAssignmentsByCourse);

// Get assignment by ID
router.get("/:id", assignmentController.getAssignmentById);

// Update assignment
router.put("/:id", assignmentController.updateAssignment);

// Delete assignment
router.delete("/:id", assignmentController.deleteAssignment);

// Requirement 3, Feature 2: Duplicate assignment to multiple courses
router.post("/:id/duplicate", assignmentController.duplicateAssignment);

// Get duplication stats for an assignment
router.get("/:id/duplication-stats", assignmentController.getAssignmentDuplicationStats);

module.exports = router;

