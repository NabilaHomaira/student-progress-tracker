const Assignment = require("../models/Assignment");

exports.gradeAssignment = async (req, res) => {
  const { assignmentId } = req.params;
  const { studentId, score } = req.body;

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) return res.status(404).json({ message: "Not found" });

  if (score > assignment.maxScore) {
    return res.status(400).json({ message: "Score exceeds max" });
  }

  assignment.scores.push({ student: studentId, score });
  await assignment.save();

  res.json({ message: "Grade saved" });
};

exports.addFeedback = async (req, res) => {
  const { assignmentId } = req.params;
  const { studentId, feedback } = req.body;

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) return res.status(404).json({ message: "Not found" });

  assignment.feedback.push({ student: studentId, text: feedback });
  await assignment.save();

  res.json({ message: "Feedback added" });
};
