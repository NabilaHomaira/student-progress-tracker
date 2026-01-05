const mongoose = require('mongoose');
const Assignment = require("../models/Assignment");
const Course = require("../models/Course");
const AssignmentSubmission = require("../models/AssignmentSubmission");
const Student = require('../models/student');
const User = require('../models/User');

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

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: 'Invalid courseId' });
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
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid assignment id' });
    }

    const assignment = await Assignment.findById(id)
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

// GET submissions for an assignment (Teacher/Admin)
async function getSubmissionsByAssignment(req, res) {
  try {
    const assignmentId = req.params.id;
    const submissions = await AssignmentSubmission.find({ assignment: assignmentId }).populate('student', 'name email');
    res.status(200).json(submissions);
  } catch (err) {
    console.error('GET SUBMISSIONS ERROR:', err);
    res.status(500).json({ message: 'Error retrieving submissions' });
  }
}

// STUDENT: Submit an assignment
async function submitAssignment(req, res) {
  try {
    const assignmentId = req.params.id;
    const studentUserId = req.userId;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    const now = new Date();
    if (assignment.dueDate && assignment.dueDate < now) {
      return res.status(400).json({ message: 'Assignment due date has passed' });
    }

    const existing = await AssignmentSubmission.findOne({ assignment: assignmentId, student: studentUserId });
    if (existing) return res.status(400).json({ message: 'Already submitted' });

    // Support multipart/form-data (file upload) via multer middleware
    const content = req.body?.content || '';
    const file = req.file;

    const submissionData = {
      assignment: assignmentId,
      student: studentUserId,
    };
    if (content) submissionData.content = content;
    if (file) {
      submissionData.attachment = {
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        path: file.path,
        size: file.size,
      };
    }

    const submission = await AssignmentSubmission.create(submissionData);

    // Update Student assignmentStats (increment submitted)
    try {
      const user = await User.findById(studentUserId).select('email');
      if (user && user.email) {
        const studentDoc = await Student.findOne({ email: user.email });
        if (studentDoc) {
          const courseId = assignment.course;
          let stat = (studentDoc.assignmentStats || []).find(s => String(s.course) === String(courseId));
          if (!stat) {
            studentDoc.assignmentStats = studentDoc.assignmentStats || [];
            studentDoc.assignmentStats.push({ course: courseId, submitted: 1, pending: 0, overdue: 0 });
          } else {
            stat.submitted = (stat.submitted || 0) + 1;
            if (stat.pending && stat.pending > 0) stat.pending = stat.pending - 1;
          }
          await studentDoc.save();
        }
      }
    } catch (e) {
      console.warn('Failed to update student assignmentStats:', e.message);
    }

    res.status(201).json({ message: 'Submission created', submission });
  } catch (err) {
    console.error('SUBMIT ASSIGNMENT ERROR:', err);
    res.status(500).json({ message: 'Error submitting assignment' });
  }
}

/**
 * Feature 5.2: List Upcoming Deadlines
 * Get upcoming deadlines with color-coded urgency indicators
 * Red: Due today/overdue
 * Yellow: Due within 3 days
 * Green: Due later
 */
async function getUpcomingDeadlines(req, res) {
  try {
    const userId = req.userId;
    const userRole = req.userRole;

    // Get relevant course IDs based on user role
    let courseIds = [];

    if (userRole === 'student') {
      // For students: get courses they're enrolled in
      const courses = await Course.find({
        enrolledStudents: userId,
        archived: false
      }).select('_id');
      courseIds = courses.map(c => c._id);
    } else if (userRole === 'teacher' || userRole === 'admin') {
      // For teachers/admins: get courses they teach or assist
      const taughtCourses = await Course.find({
        instructor: userId,
        archived: false
      }).select('_id');
      
      const assistedCourses = await Course.find({
        $or: [
          { 'assistants.user': userId },
          { assistantIds: userId }
        ],
        archived: false
      }).select('_id');
      
      const allCourseIds = [
        ...taughtCourses.map(c => c._id),
        ...assistedCourses.map(c => c._id)
      ];
      // Remove duplicates
      courseIds = [...new Set(allCourseIds.map(id => id.toString()))].map(id => new mongoose.Types.ObjectId(id));
    }

    if (courseIds.length === 0) {
      return res.status(200).json([]);
    }

    // Get all assignments from relevant courses
    const assignments = await Assignment.find({
      course: { $in: courseIds }
    })
      .populate('course', 'title code')
      .sort({ dueDate: 1 });

    // Get submission status for each assignment (for students)
    const assignmentIds = assignments.map(a => a._id);
    let submissions = [];
    if (userRole === 'student') {
      submissions = await AssignmentSubmission.find({
        assignment: { $in: assignmentIds },
        student: userId
      }).select('assignment');
    }

    const submittedAssignmentIds = new Set(
      submissions.map(s => s.assignment.toString())
    );

    // Calculate urgency and format response
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to start of day for comparison

    const deadlines = assignments.map(assignment => {
      const dueDate = new Date(assignment.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      
      let urgency = 'green'; // Default: Due later
      if (daysUntilDue < 0 || daysUntilDue === 0) {
        urgency = 'red'; // Due today/overdue
      } else if (daysUntilDue <= 3) {
        urgency = 'yellow'; // Due within 3 days
      }

      const isSubmitted = userRole === 'student' 
        ? submittedAssignmentIds.has(assignment._id.toString())
        : false;

      return {
        _id: assignment._id,
        title: assignment.title,
        instructions: assignment.instructions,
        dueDate: assignment.dueDate,
        maxScore: assignment.maxScore,
        course: assignment.course,
        urgency,
        daysUntilDue,
        isSubmitted,
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt
      };
    });

    res.status(200).json(deadlines);
  } catch (err) {
    console.error('GET UPCOMING DEADLINES ERROR:', err);
    res.status(500).json({ message: 'Error retrieving upcoming deadlines' });
  }
}

module.exports = {
  createAssignment,
  getAssignmentsByCourse,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  duplicateAssignment,
  submitAssignment,
  getSubmissionsByAssignment,
  getUpcomingDeadlines,
};
