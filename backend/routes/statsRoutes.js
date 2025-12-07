
const express = require("express");
const Student = require("../models/student");
const Course = require("../models/course");
const router = express.Router();

const computeAverage = (arr) => {
  if (!arr.length) return null;
  const sum = arr.reduce((acc, v) => acc + v, 0);
  return Math.round(sum / arr.length);
};

// Req 1 – Feature 3: Enrollment stats
router.get("/enrollment", async (_req, res) => {
  try {
    const students = await Student.find({});
    const totalStudents = students.length;
    const totalEnrollments = students.reduce(
      (acc, s) => acc + (s.enrollments?.length || 0),
      0
    );
    const allScores = students.flatMap((s) =>
      (s.gradeHistory || []).map((g) => g.score || 0)
    );
    const averagePerformance = computeAverage(allScores);

    res.json({ totalStudents, totalEnrollments, averagePerformance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load enrollment stats" });
  }
});

// Req 3 – Feature 4: submission stats
router.get("/submissions/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    const students = await Student.find({ "assignmentStats.course": courseId });

    let submitted = 0,
      pending = 0,
      overdue = 0;

    students.forEach((s) => {
      (s.assignmentStats || []).forEach((stat) => {
        if (String(stat.course) === String(courseId)) {
          submitted += stat.submitted || 0;
          pending += stat.pending || 0;
          overdue += stat.overdue || 0;
        }
      });
    });

    const course = await Course.findById(courseId).select("title code");

    res.json({ course, submitted, pending, overdue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load submission stats" });
  }
});

// Req 4 – Feature 3: trend analysis
router.get("/trends/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const allStudents = await Student.find({});
    const target = allStudents.find((s) => String(s._id) === String(studentId));
    if (!target) return res.status(404).json({ message: "Student not found" });

    const termSet = new Set();
    allStudents.forEach((s) =>
      (s.gradeHistory || []).forEach((g) => termSet.add(g.termLabel))
    );
    const terms = Array.from(termSet);

    const studentSeries = terms.map((term) => {
      const scores = (target.gradeHistory || [])
        .filter((g) => g.termLabel === term)
        .map((g) => g.score || 0);
      return { term, score: computeAverage(scores) };
    });

    const classSeries = terms.map((term) => {
      const allScores = allStudents.flatMap((s) =>
        (s.gradeHistory || [])
          .filter((g) => g.termLabel === term)
          .map((g) => g.score || 0)
      );
      return { term, score: computeAverage(allScores) };
    });

    res.json({ studentSeries, classSeries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load trend data" });
  }
});

// Req 5 – Feature 1: progress chart
router.get("/progress/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId).populate(
      "gradeHistory.course",
      "title code"
    );
    if (!student)
      return res.status(404).json({ message: "Student not found" });

    const points = (student.gradeHistory || []).map((g) => ({
      term: g.termLabel,
      courseTitle: g.course?.title,
      courseCode: g.course?.code,
      score: g.score,
    }));

    res.json({ studentName: student.name, points });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load progress data" });
  }
});

module.exports = router;