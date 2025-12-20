const Assignment = require("../models/Assignment");
const Course = require("../models/Course");

// Create a new assignment
async function createAssignment(req, res) {
  try {
    const { title, instructions, dueDate, maxScore, courseId } = req.body;

    // Validate required fields
    if (!title || !instructions || !dueDate || !maxScore || !courseId) {
      return res.status(400).json({
        message: "Missing required fields: title, instructions, dueDate, maxScore, courseId",
      });
    }

    // Validate maxScore is a positive number
    const score = Number(maxScore);
    if (isNaN(score) || score < 0) {
      return res.status(400).json({
        message: "maxScore must be a positive number",
      });
    }

    // Validate dueDate is a valid date
    const due = new Date(dueDate);
    if (isNaN(due.getTime())) {
      return res.status(400).json({
        message: "Invalid dueDate format",
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // Get userId from auth middleware or body
    const userId = req.userId || req.body.userId;
    if (!userId) {
      return res.status(400).json({
        message: "User ID is required. Please provide userId in request body or use authentication.",
      });
    }

    // Create assignment
    const newAssignment = new Assignment({
      title: String(title).trim(),
      instructions: String(instructions).trim(),
      dueDate: due,
      maxScore: score,
      course: courseId,
      createdBy: userId,
    });

    const savedAssignment = await newAssignment.save();

    // Populate course and createdBy for response
    await savedAssignment.populate("course", "title code");
    await savedAssignment.populate("createdBy", "name email");

    return res.status(201).json({
      message: "Assignment created successfully",
      assignment: savedAssignment,
    });
  } catch (error) {
    console.error("CREATE ASSIGNMENT ERROR:", error);
    return res.status(500).json({
      message: "Error creating assignment",
      error: error?.message || String(error),
    });
  }
}

// Get all assignments for a course
async function getAssignmentsByCourse(req, res) {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({
        message: "Course ID is required",
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    const assignments = await Assignment.find({ course: courseId })
      .populate("course", "title code")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(assignments);
  } catch (error) {
    console.error("GET ASSIGNMENTS BY COURSE ERROR:", error);
    return res.status(500).json({
      message: "Error retrieving assignments",
      error: error?.message || String(error),
    });
  }
}

// Get assignment by ID
async function getAssignmentById(req, res) {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findById(id)
      .populate("course", "title code description")
      .populate("createdBy", "name email")
      .lean();

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    return res.status(200).json(assignment);
  } catch (error) {
    console.error("GET ASSIGNMENT BY ID ERROR:", error);
    return res.status(500).json({
      message: "Error retrieving assignment",
      error: error?.message || String(error),
    });
  }
}

// Update assignment
async function updateAssignment(req, res) {
  try {
    const { id } = req.params;
    const { title, instructions, dueDate, maxScore } = req.body;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    // Update fields if provided
    if (title !== undefined) assignment.title = String(title).trim();
    if (instructions !== undefined) assignment.instructions = String(instructions).trim();
    if (dueDate !== undefined) {
      const due = new Date(dueDate);
      if (isNaN(due.getTime())) {
        return res.status(400).json({
          message: "Invalid dueDate format",
        });
      }
      assignment.dueDate = due;
    }
    if (maxScore !== undefined) {
      const score = Number(maxScore);
      if (isNaN(score) || score < 0) {
        return res.status(400).json({
          message: "maxScore must be a positive number",
        });
      }
      assignment.maxScore = score;
    }

    const updatedAssignment = await assignment.save();
    await updatedAssignment.populate("course", "title code");
    await updatedAssignment.populate("createdBy", "name email");

    return res.status(200).json({
      message: "Assignment updated successfully",
      assignment: updatedAssignment,
    });
  } catch (error) {
    console.error("UPDATE ASSIGNMENT ERROR:", error);
    return res.status(500).json({
      message: "Error updating assignment",
      error: error?.message || String(error),
    });
  }
}

// Delete assignment
async function deleteAssignment(req, res) {
  try {
    const { id } = req.params;

    const deleted = await Assignment.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    return res.status(200).json({
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ASSIGNMENT ERROR:", error);
    return res.status(500).json({
      message: "Error deleting assignment",
      error: error?.message || String(error),
    });
  }
}

module.exports = {
  createAssignment,
  getAssignmentsByCourse,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
};

