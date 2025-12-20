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

module.exports = router;

