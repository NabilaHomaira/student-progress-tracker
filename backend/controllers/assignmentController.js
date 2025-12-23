const Assignment = require("../models/Assignment");
const Course = require("../models/Course");

/**
 * Requirement 3 – Feature 3
 * Assignment Management (CRUD + Duplicate)
 */

// CREATE assignment (Teacher/Admin only)
async function createAssignment(req, res) {
  try {
    const { title, instructions, dueDate, maxScore, courseId } = req.body;

    if (!title || !instructions || !dueDate || !maxScore || !courseId) {
      return res.status(400).json({
        message:
          "Missing required fields: title, instructions, dueDate, maxScore, courseId",
      });
    }

    const score = Number(maxScore);
    if (isNaN(score) || score <= 0) {
      return res.status(400).json({ message: "maxScore must be a positive number" });
    }

    const due = new Date(dueDate);
    if (isNaN(due.getTime())) {
      return res.status(400).json({ message: "Invalid dueDate" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const assignment = await Assignment.create({
      title: title.trim(),
      instructions: instructions.trim(),
      dueDate: due,
      maxScore: score,
      course: courseId,
      createdBy: req.userId,
    });

    await assignment.populate("course", "title code");
    await assignment.populate("createdBy", "name email");

    res.status(201).json({
      message: "Assignment created successfully",
      assignment,
    });
  } catch (err) {
    console.error("CREATE ASSIGNMENT ERROR:", err);
    res.status(500).json({ message: "Error creating assignment" });
  }
}

// GET assignments by course (ALL ROLES)
async function getAssignmentsByCourse(req, res) {
  try {
    const { courseId } = req.params;

    const assignments = await Assignment.find({ course: courseId })
      .populate("createdBy", "name email")
      .sort({ dueDate: 1 });

    res.status(200).json(assignments);
  } catch (err) {
    console.error("GET ASSIGNMENTS ERROR:", err);
    res.status(500).json({ message: "Error retrieving assignments" });
  }
}

// GET assignment by ID (ALL ROLES)
async function getAssignmentById(req, res) {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate("course", "title code description")
      .populate("createdBy", "name email");

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.status(200).json(assignment);
  } catch (err) {
    console.error("GET ASSIGNMENT ERROR:", err);
    res.status(500).json({ message: "Error retrieving assignment" });
  }
}

// UPDATE assignment (Teacher/Admin only)
async function updateAssignment(req, res) {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const { title, instructions, dueDate, maxScore } = req.body;

    if (title) assignment.title = title.trim();
    if (instructions) assignment.instructions = instructions.trim();

    if (dueDate) {
      const due = new Date(dueDate);
      if (isNaN(due.getTime())) {
        return res.status(400).json({ message: "Invalid dueDate" });
      }
      assignment.dueDate = due;
    }

    if (maxScore !== undefined) {
      const score = Number(maxScore);
      if (isNaN(score) || score <= 0) {
        return res.status(400).json({ message: "Invalid maxScore" });
      }
      assignment.maxScore = score;
    }

    const updated = await assignment.save();
    res.status(200).json({
      message: "Assignment updated successfully",
      assignment: updated,
    });
  } catch (err) {
    console.error("UPDATE ASSIGNMENT ERROR:", err);
    res.status(500).json({ message: "Error updating assignment" });
  }
}

// DELETE assignment (Teacher/Admin only)
async function deleteAssignment(req, res) {
  try {
    const deleted = await Assignment.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (err) {
    console.error("DELETE ASSIGNMENT ERROR:", err);
    res.status(500).json({ message: "Error deleting assignment" });
  }
}

// DUPLICATE assignment to multiple courses (Teacher/Admin only)
async function duplicateAssignment(req, res) {
  try {
    const { targetCourseIds } = req.body;

    if (!Array.isArray(targetCourseIds) || targetCourseIds.length === 0) {
      return res.status(400).json({
        message: "targetCourseIds must be a non-empty array",
      });
    }

    const source = await Assignment.findById(req.params.id);
    if (!source) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const created = [];

    for (const courseId of targetCourseIds) {
      const copy = await Assignment.create({
        title: `${source.title} (Copy)`,
        instructions: source.instructions,
        dueDate: source.dueDate,
        maxScore: source.maxScore,
        course: courseId,
        createdBy: req.userId,
      });
      created.push(copy);
    }

    res.status(201).json({
      message: "Assignment duplicated successfully",
      duplicatedCount: created.length,
    });
  } catch (err) {
    console.error("DUPLICATE ASSIGNMENT ERROR:", err);
    res.status(500).json({ message: "Error duplicating assignment" });
  }
}

module.exports = {
  createAssignment,
  getAssignmentsByCourse,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  duplicateAssignment,
};
