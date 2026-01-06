
const express = require("express");
const Student = require("../models/student");
const Course = require("../models/Course");
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
// Additional trends route: allow optional course filter via /trends/:courseId/:studentId
router.get("/trends/:courseId/:studentId", async (req, res) => {
  try {
    const { courseId, studentId } = req.params;
    const allStudents = await Student.find({});

    // Try direct Student._id match
    let target = allStudents.find((s) => String(s._id) === String(studentId));

    // If not found, try resolving as a User id -> find User by id and then Student by email
    if (!target) {
      try {
        const User = require('../models/User');
        const user = await User.findById(studentId).select('email');
        if (user && user.email) {
          target = allStudents.find((s) => String(s.email) === String(user.email));
        }
      } catch (e) {
        // ignore resolution errors
      }
    }

    if (!target) return res.status(404).json({ message: "Student not found" });

    const termSet = new Set();
    allStudents.forEach((s) =>
      (s.gradeHistory || []).forEach((g) => termSet.add(g.termLabel))
    );
    const terms = Array.from(termSet);

    const studentSeries = terms.map((term) => {
      const scores = (target.gradeHistory || [])
        .filter((g) => g.termLabel === term && String(g.course) === String(courseId))
        .map((g) => g.score || 0);
      return { term, score: computeAverage(scores) };
    });

    const classSeries = terms.map((term) => {
      const allScores = allStudents.flatMap((s) =>
        (s.gradeHistory || [])
          .filter((g) => g.termLabel === term && String(g.course) === String(courseId))
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

// Original trends route: no course filter
router.get("/trends/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const allStudents = await Student.find({});

    // Try direct Student._id match
    let target = allStudents.find((s) => String(s._id) === String(studentId));

    // If not found, try resolving as a User id -> find User by id and then Student by email
    if (!target) {
      try {
        const User = require('../models/User');
        const user = await User.findById(studentId).select('email');
        if (user && user.email) {
          target = allStudents.find((s) => String(s.email) === String(user.email));
        }
      } catch (e) {
        // ignore resolution errors
      }
    }

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
// Alias: support older client path `/student-progress?studentId=...`
const auth = require('../middleware/auth');
const User = require('../models/User');

// This route accepts either `?studentId=` (admin/teacher) or a student token.
router.get('/student-progress', auth, async (req, res) => {
  try {
    let studentId = req.query.studentId;

    if (!studentId) {
      // derive student by authenticated user (student token)
      const userId = req.userId;
      if (!userId) return res.status(400).json({ message: 'Missing studentId query parameter' });
      const user = await User.findById(userId).select('email');
      if (!user) return res.status(404).json({ message: 'User not found' });
      const studentDoc = await Student.findOne({ email: user.email });
      if (!studentDoc) return res.status(404).json({ message: 'Student enrollment record not found' });
      studentId = studentDoc._id;
    } else {
      // If a studentId was provided, it may be a User id (from name lookup).
      // Try to resolve a User id -> Student doc by email when direct Student lookup fails.
      const directStudent = await Student.findById(studentId);
      if (!directStudent) {
        try {
          const maybeUser = await User.findById(studentId).select('email');
          if (maybeUser && maybeUser.email) {
            const studentDoc = await Student.findOne({ email: maybeUser.email });
            if (studentDoc) studentId = studentDoc._id;
          }
        } catch (e) {
          // ignore and continue; we'll attempt direct lookup below which will fail
        }
      }
    }

    // populate both enrollments.course and gradeHistory.course so we can compute per-course grades
    const student = await Student.findById(studentId).populate([
      { path: 'enrollments.course', select: 'title code' },
      { path: 'gradeHistory.course', select: 'title code' },
    ]);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const courses = (student.enrollments || [])
      .map((e) => e.course)
      .filter(Boolean)
      .map((course) => {
        // collect all gradeHistory scores for this course
        const grades = (student.gradeHistory || [])
          .filter((g) => g.course && String(g.course._id) === String(course._id))
          .map((g) => (typeof g.score === 'number' ? g.score : 0));

        return {
          courseId: course._id,
          courseName: course.title,
          average: computeAverage(grades) || 0,
          grades,
        };
      });

    return res.json({ studentId: student._id, studentName: student.name, courses });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to load progress data' });
  }
});

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
