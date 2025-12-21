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

// Duplicate assignment to multiple courses
async function duplicateAssignment(req, res) {
  try {
    const { id } = req.params;
    const { targetCourseIds, adjustDueDate } = req.body;

    // Validate required fields
    if (!targetCourseIds || !Array.isArray(targetCourseIds) || targetCourseIds.length === 0) {
      return res.status(400).json({
        message: "targetCourseIds must be a non-empty array",
      });
    }

    // Check if source assignment exists
    const sourceAssignment = await Assignment.findById(id)
      .populate("course", "title code")
      .populate("createdBy", "name email");

    if (!sourceAssignment) {
      return res.status(404).json({
        message: "Source assignment not found",
      });
    }

    // Validate that all target courses exist
    const courses = await Course.find({ _id: { $in: targetCourseIds } });
    if (courses.length !== targetCourseIds.length) {
      return res.status(400).json({
        message: "One or more target courses do not exist",
      });
    }

    // Check for duplicates in target courses
    const existingAssignments = await Assignment.find({
      course: { $in: targetCourseIds },
      title: sourceAssignment.title,
    });

    if (existingAssignments.length > 0) {
      return res.status(400).json({
        message: `Assignment "${sourceAssignment.title}" already exists in ${existingAssignments.length} target course(s)`,
        conflictingCourses: existingAssignments.map((a) => a.course),
      });
    }

    // Get userId from auth middleware
    const userId = req.userId || sourceAssignment.createdBy._id;

    // Create duplicated assignments
    const duplicatedAssignments = [];
    const dueDateOffset = adjustDueDate ? 7 : 0; // Add 7 days if adjustDueDate is true

    for (const courseId of targetCourseIds) {
      const newDueDate = new Date(sourceAssignment.dueDate);
      if (adjustDueDate) {
        newDueDate.setDate(newDueDate.getDate() + dueDateOffset);
      }

      const newAssignment = new Assignment({
        title: `${sourceAssignment.title} (Duplicated)`,
        instructions: sourceAssignment.instructions,
        dueDate: newDueDate,
        maxScore: sourceAssignment.maxScore,
        course: courseId,
        createdBy: userId,
      });

      const savedAssignment = await newAssignment.save();
      await savedAssignment.populate("course", "title code");
      await savedAssignment.populate("createdBy", "name email");

      duplicatedAssignments.push(savedAssignment);
    }

    return res.status(201).json({
      message: `Assignment duplicated successfully to ${duplicatedAssignments.length} course(s)`,
      sourceAssignment: {
        _id: sourceAssignment._id,
        title: sourceAssignment.title,
        course: sourceAssignment.course,
      },
      duplicatedAssignments,
      count: duplicatedAssignments.length,
    });
  } catch (error) {
    console.error("DUPLICATE ASSIGNMENT ERROR:", error);
    return res.status(500).json({
      message: "Error duplicating assignment",
      error: error?.message || String(error),
    });
  }
}

// Get assignment duplication summary (stats on how many times duplicated)
async function getAssignmentDuplicationStats(req, res) {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    // Count duplicates with similar title
    const duplicates = await Assignment.find({
      title: { $regex: assignment.title.replace(/\s*\(Duplicated\)\s*$/, ""), $options: "i" },
    })
      .populate("course", "title code")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Assignment duplication stats retrieved",
      sourceAssignment: {
        _id: assignment._id,
        title: assignment.title,
        course: assignment.course,
      },
      totalDuplications: duplicates.length - 1, // Exclude the source assignment
      duplicates,
    });
  } catch (error) {
    console.error("GET DUPLICATION STATS ERROR:", error);
    return res.status(500).json({
      message: "Error retrieving duplication stats",
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
  duplicateAssignment,
  getAssignmentDuplicationStats,
};

