// controllers/feedbackController.js
const Submission = require('../models/AssignmentSubmission');
const Assignment = require('../models/Assignment');

exports.addFeedback = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { score, feedback, learningTips } = req.body;

    const submission = await Submission.findById(submissionId).populate('assignment');
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // If score provided, validate against assignment maxScore
    if (score !== undefined && score !== null) {
      const numeric = Number(score);
      if (isNaN(numeric) || numeric < 0) {
        return res.status(400).json({ message: 'Score must be a non-negative number' });
      }

      // Ensure we have the assignment or load it
      const assignment = submission.assignment || (await Assignment.findById(submission.assignment));
      const max = assignment?.maxScore;
      if (typeof max === 'number' && numeric > max) {
        return res.status(400).json({ message: `Score cannot exceed assignment maxScore (${max})` });
      }

      const wasGraded = submission.score !== undefined && submission.score !== null;
      submission.score = numeric;
      submission.feedback = feedback !== undefined ? feedback : submission.feedback;
      submission.learningTips = learningTips !== undefined ? learningTips : submission.learningTips;

      await submission.save();

      return res.status(200).json({
        message: wasGraded ? 'Grade updated successfully' : 'Submission graded',
        submission,
      });
    }

    // No score provided — just update feedback/learningTips
    submission.feedback = feedback !== undefined ? feedback : submission.feedback;
    submission.learningTips = learningTips !== undefined ? learningTips : submission.learningTips;

    await submission.save();

    res.status(200).json({ message: 'Feedback added successfully', submission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add feedback' });
  }
};

// Grade a submission by assignmentId + studentId (compatibility endpoint)
exports.gradeSubmission = async (req, res) => {
  try {
    const { assignmentId, studentId, score, feedback, learningTips } = req.body;

    if (!assignmentId || !studentId || score === undefined) {
      return res.status(400).json({ message: 'assignmentId, studentId and score are required' });
    }

    const numeric = Number(score);
    if (isNaN(numeric) || numeric < 0) {
      return res.status(400).json({ message: 'Score must be a non-negative number' });
    }

    // Validate against assignment maxScore
    const assignment = await Assignment.findById(assignmentId);
    if (assignment && typeof assignment.maxScore === 'number' && numeric > assignment.maxScore) {
      return res.status(400).json({ message: `Score cannot exceed assignment maxScore (${assignment.maxScore})` });
    }

    const submission = await Submission.findOne({ assignment: assignmentId, student: studentId });
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const wasGraded = submission.score !== undefined && submission.score !== null;
    submission.score = numeric;
    if (feedback !== undefined) submission.feedback = feedback;
    if (learningTips !== undefined) submission.learningTips = learningTips;

    await submission.save();

    return res.status(200).json({ message: wasGraded ? 'Grade updated successfully' : 'Submission graded', submission });
  } catch (err) {
    console.error('GRADE SUBMISSION ERROR:', err);
    res.status(500).json({ message: 'Failed to grade submission' });
  }
};

// Add feedback by assignmentId + studentId (compatibility: comments -> feedback)
exports.addFeedbackByAssignmentStudent = async (req, res) => {
  try {
    const { assignmentId, studentId, comments, learningTips } = req.body;

    if (!assignmentId || !studentId) {
      return res.status(400).json({ message: 'assignmentId and studentId are required' });
    }

    const submission = await Submission.findOne({ assignment: assignmentId, student: studentId });
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (comments !== undefined) submission.feedback = comments;
    if (learningTips !== undefined) submission.learningTips = learningTips;

    await submission.save();

    return res.status(200).json({ message: 'Feedback added successfully', submission });
  } catch (err) {
    console.error('ADD FEEDBACK ERROR:', err);
    return res.status(500).json({ message: 'Failed to add feedback' });
  }
};

// Get current student's submission/feedback for an assignment
exports.getMyFeedback = async (req, res) => {
  try {
    const assignmentId = req.params.assignmentId;
    const studentId = req.userId;

    if (!assignmentId) return res.status(400).json({ message: 'assignmentId required' });

    const submission = await Submission.findOne({ assignment: assignmentId, student: studentId });
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    return res.status(200).json({ submission });
  } catch (err) {
    console.error('GET MY FEEDBACK ERROR:', err);
    return res.status(500).json({ message: 'Failed to retrieve submission' });
  }
};
