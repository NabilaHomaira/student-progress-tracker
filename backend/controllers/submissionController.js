/**
 * Assignment Submission Controller
 * Handles operations on assignment submissions including getting, updating, and feedback
 */

const AssignmentSubmission = require("../models/AssignmentSubmission");
const Assignment = require("../models/Assignment");
const mongoose = require("mongoose");

/**
 * Get all submissions for a course
 * GET /api/submissions/course/:courseId
 */
exports.getSubmissionsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    // Get all assignments in the course
    const assignments = await Assignment.find({ course: courseId }).select("_id");
    const assignmentIds = assignments.map((a) => a._id);

    // Get all submissions for these assignments
    const submissions = await AssignmentSubmission.find({
      assignment: { $in: assignmentIds },
    })
      .populate("student", "name email")
      .populate("assignment", "title maxScore course")
      .sort({ submittedAt: -1 });

    return res.status(200).json(submissions);
  } catch (err) {
    console.error("GET SUBMISSIONS BY COURSE ERROR:", err);
    return res.status(500).json({ message: "Error retrieving submissions" });
  }
};

/**
 * Get a specific submission
 * GET /api/submissions/:submissionId
 */
exports.getSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      return res.status(400).json({ message: "Invalid submission ID" });
    }

    const submission = await AssignmentSubmission.findById(submissionId)
      .populate("student", "name email")
      .populate("assignment", "title maxScore instructions");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    return res.status(200).json(submission);
  } catch (err) {
    console.error("GET SUBMISSION ERROR:", err);
    return res.status(500).json({ message: "Error retrieving submission" });
  }
};

/**
 * Update submission with learning tips and feedback
 * PUT /api/submissions/:submissionId
 */
exports.updateSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { feedback, learningTips, score } = req.body;

    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      return res.status(400).json({ message: "Invalid submission ID" });
    }

    const submission = await AssignmentSubmission.findById(submissionId);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Update feedback if provided
    if (feedback !== undefined) {
      submission.feedback = feedback;
    }

    // Update learning tips if provided
    if (learningTips !== undefined) {
      submission.learningTips = learningTips;
    }

    // Update score if provided and valid
    if (score !== undefined && score !== null) {
      const numScore = parseFloat(score);
      if (isNaN(numScore) || numScore < 0) {
        return res.status(400).json({ message: "Score must be a valid non-negative number" });
      }

      // Verify score doesn't exceed max
      const assignment = await Assignment.findById(submission.assignment);
      if (assignment && numScore > assignment.maxScore) {
        return res.status(400).json({
          message: `Score cannot exceed maximum of ${assignment.maxScore}`,
        });
      }

      submission.score = numScore;
    }

    await submission.save();
    await submission.populate("student", "name email");

    return res.status(200).json({
      message: "Submission updated successfully",
      submission,
    });
  } catch (err) {
    console.error("UPDATE SUBMISSION ERROR:", err);
    return res.status(500).json({ message: "Error updating submission" });
  }
};

/**
 * Get all submissions for an assignment
 * GET /api/submissions/assignment/:assignmentId
 */
exports.getAssignmentSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ message: "Invalid assignment ID" });
    }

    const submissions = await AssignmentSubmission.find({
      assignment: assignmentId,
    })
      .populate("student", "name email")
      .populate("assignment", "title maxScore")
      .sort({ submittedAt: 1 });

    return res.status(200).json(submissions);
  } catch (err) {
    console.error("GET ASSIGNMENT SUBMISSIONS ERROR:", err);
    return res.status(500).json({ message: "Error retrieving submissions" });
  }
};

/**
 * Get all submissions for a student
 * GET /api/submissions/student/:studentId
 */
exports.getStudentSubmissions = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const submissions = await AssignmentSubmission.find({
      student: studentId,
    })
      .populate("student", "name email")
      .populate("assignment", "title maxScore course")
      .sort({ submittedAt: -1 });

    return res.status(200).json(submissions);
  } catch (err) {
    console.error("GET STUDENT SUBMISSIONS ERROR:", err);
    return res.status(500).json({ message: "Error retrieving submissions" });
  }
};
