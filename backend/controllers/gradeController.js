const Assignment = require("../models/Assignment");
const AssignmentSubmission = require("../models/AssignmentSubmission");
const Course = require("../models/Course");
const mongoose = require("mongoose");

/**
 * Grade a student's assignment submission
 * POST /api/grades/:assignmentId/grade
 */
exports.gradeAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { studentId, score } = req.body;

    if (!score && score !== 0) {
      return res.status(400).json({ message: "Score is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ message: "Invalid assignment ID" });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const numScore = parseFloat(score);
    if (isNaN(numScore) || numScore < 0) {
      return res.status(400).json({ message: "Score must be a valid non-negative number" });
    }

    if (numScore > assignment.maxScore) {
      return res.status(400).json({
        message: `Score cannot exceed maximum of ${assignment.maxScore}`,
      });
    }

    // Find or create submission
    let submission = await AssignmentSubmission.findOne({
      assignment: assignmentId,
      student: studentId,
    });

    if (!submission) {
      submission = await AssignmentSubmission.create({
        assignment: assignmentId,
        student: studentId,
        score: numScore,
      });
    } else {
      submission.score = numScore;
      await submission.save();
    }

    await submission.populate("student", "name email");

    return res.status(200).json({
      message: "Grade saved successfully",
      submission,
    });
  } catch (err) {
    console.error("GRADE ASSIGNMENT ERROR:", err);
    return res.status(500).json({ message: "Error grading assignment" });
  }
};

/**
 * Add or update feedback for a student's submission
 * POST /api/grades/:assignmentId/feedback
 */
exports.addFeedback = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { studentId, feedback } = req.body;

    if (!feedback) {
      return res.status(400).json({ message: "Feedback is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ message: "Invalid assignment ID" });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Find or create submission
    let submission = await AssignmentSubmission.findOne({
      assignment: assignmentId,
      student: studentId,
    });

    if (!submission) {
      submission = await AssignmentSubmission.create({
        assignment: assignmentId,
        student: studentId,
        feedback,
      });
    } else {
      submission.feedback = feedback;
      await submission.save();
    }

    await submission.populate("student", "name email");

    return res.status(200).json({
      message: "Feedback added successfully",
      submission,
    });
  } catch (err) {
    console.error("ADD FEEDBACK ERROR:", err);
    return res.status(500).json({ message: "Error adding feedback" });
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
      .populate("assignment", "title maxScore");

    return res.status(200).json(submissions);
  } catch (err) {
    console.error("GET SUBMISSIONS ERROR:", err);
    return res.status(500).json({ message: "Error retrieving submissions" });
  }
};

/**
 * Get all grades for a specific course
 * GET /api/grades/course/:courseId
 */
exports.getCourseGrades = async (req, res) => {
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
      .populate("assignment", "title maxScore");

    return res.status(200).json(submissions);
  } catch (err) {
    console.error("GET COURSE GRADES ERROR:", err);
    return res.status(500).json({ message: "Error retrieving course grades" });
  }
};

/**
 * Get grades for a specific student in a course
 * GET /api/grades/student/:studentId/course/:courseId
 */
exports.getStudentCourseGrades = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid student or course ID" });
    }

    // Get all assignments in the course
    const assignments = await Assignment.find({ course: courseId }).select("_id");
    const assignmentIds = assignments.map((a) => a._id);

    // Get submissions for this student in this course
    const submissions = await AssignmentSubmission.find({
      student: studentId,
      assignment: { $in: assignmentIds },
    })
      .populate("assignment", "title maxScore");

    return res.status(200).json(submissions);
  } catch (err) {
    console.error("GET STUDENT COURSE GRADES ERROR:", err);
    return res.status(500).json({ message: "Error retrieving student grades" });
  }
};

/**
 * Update a grade for a specific submission
 * PUT /api/grades/:assignmentId/:studentId
 */
exports.updateGrade = async (req, res) => {
  try {
    const { assignmentId, studentId } = req.params;
    const { score } = req.body;

    if (!score && score !== 0) {
      return res.status(400).json({ message: "Score is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ message: "Invalid assignment ID" });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const numScore = parseFloat(score);
    if (isNaN(numScore) || numScore < 0) {
      return res.status(400).json({ message: "Score must be a valid non-negative number" });
    }

    if (numScore > assignment.maxScore) {
      return res.status(400).json({
        message: `Score cannot exceed maximum of ${assignment.maxScore}`,
      });
    }

    const submission = await AssignmentSubmission.findOne({
      assignment: assignmentId,
      student: studentId,
    }).populate("student", "name email");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    submission.score = numScore;
    await submission.save();

    return res.status(200).json({
      message: "Grade updated successfully",
      submission,
    });
  } catch (err) {
    console.error("UPDATE GRADE ERROR:", err);
    return res.status(500).json({ message: "Error updating grade" });
  }
};
