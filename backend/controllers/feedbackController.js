// controllers/feedbackController.js
const Submission = require('../models/AssignmentSubmission');

exports.addFeedback = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { score, feedback, learningTips } = req.body;

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    submission.score = score ?? submission.score;
    submission.feedback = feedback;
    submission.learningTips = learningTips;

    await submission.save();

    res.status(200).json({
      message: 'Feedback added successfully',
      submission,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add feedback' });
  }
};
