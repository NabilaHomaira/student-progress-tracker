const AssignmentSubmission = require("../models/AssignmentSubmission");
const Assignment = require("../models/Assignment");
const Course = require("../models/Course");

exports.getFocusAreas = async (req, res) => {
  try {
    const studentId = req.userId || req.params.studentId;

    if (!studentId) {
      return res.status(400).json({ message: "Student ID required" });
    }

    // 1️⃣ Get all submissions of this student
    const studentSubs = await AssignmentSubmission.find({ student: studentId })
      .populate({
        path: "assignment",
        populate: { path: "course", select: "title code" },
      });

    if (!studentSubs.length) {
      return res.status(200).json({
        message: "No submissions yet",
        coursesNeedingFocus: [],
        assignmentsNeedingFocus: [],
      });
    }

    const assignmentsNeedingFocus = [];
    const courseMap = new Map();

    // 2️⃣ For each assignment, compute class average
    for (const sub of studentSubs) {
      const assignmentId = sub.assignment._id;

      const allSubs = await AssignmentSubmission.find({
        assignment: assignmentId,
      });

      const scores = allSubs
        .map((s) => s.score)
        .filter((s) => typeof s === "number");

      if (!scores.length) continue;

      const classAvg =
        scores.reduce((a, b) => a + b, 0) / scores.length;

      if (sub.score < classAvg) {
        assignmentsNeedingFocus.push({
          assignmentId,
          assignmentTitle: sub.assignment.title,
          course: sub.assignment.course,
          studentScore: sub.score,
          classAverage: Math.round(classAvg),
        });

        const courseId = sub.assignment.course._id.toString();
        if (!courseMap.has(courseId)) {
          courseMap.set(courseId, {
            courseId,
            title: sub.assignment.course.title,
            code: sub.assignment.course.code,
            belowCount: 1,
          });
        } else {
          courseMap.get(courseId).belowCount++;
        }
      }
    }

    const coursesNeedingFocus = Array.from(courseMap.values());

    return res.status(200).json({
      message: "Focus areas identified",
      coursesNeedingFocus,
      assignmentsNeedingFocus,
    });
  } catch (error) {
    console.error("FOCUS AREA ERROR:", error);
    return res.status(500).json({
      message: "Failed to analyze focus areas",
      error: error.message,
    });
  }
};
