const Course = require("../models/Course");
const Student = require("../models/student");
const Assignment = require("../models/Assignment");

/* =====================================================
   HELPER
===================================================== */
function buildArchiveFilter(showArchived) {
  return showArchived ? {} : { archived: { $ne: true } };
}

/* =====================================================
   REQUIREMENT 1 – FEATURE 1
   GET ALL COURSES (seat availability)
===================================================== */
async function getCourses(req, res) {
  try {
    const showArchived =
      String(req.query.showArchived).toLowerCase() === "true";
    const filter = buildArchiveFilter(showArchived);

    const courses = await Course.find(filter)
      .populate("instructor", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const coursesWithSeats = courses.map((c) => {
      const enrolledCount = Array.isArray(c.enrolledStudents)
        ? c.enrolledStudents.length
        : 0;

      return {
        ...c,
        enrolledCount,
        seatsAvailable: Math.max((c.capacity || 0) - enrolledCount, 0),
      };
    });

    res.status(200).json(coursesWithSeats);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving courses" });
  }
}

/* =====================================================
   GET COURSE BY ID
===================================================== */
async function getCourseById(req, res) {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name email")
      .lean();

    if (!course) return res.status(404).json({ message: "Course not found" });

    const enrolledCount = course.enrolledStudents?.length || 0;

    res.status(200).json({
      ...course,
      enrolledCount,
      seatsAvailable: Math.max((course.capacity || 0) - enrolledCount, 0),
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving course" });
  }
}

/* =====================================================
   REQUIREMENT 1 – FEATURE 1
   CREATE COURSE
===================================================== */
async function createCourse(req, res) {
  try {
    const { title, code, description, instructor, capacity } = req.body;

    if (!title || !code || !instructor) {
      return res.status(400).json({
        message: "title, code, and instructor are required",
      });
    }

    const newCourse = new Course({
      title: title.trim(),
      code: code.trim(),
      description: description?.trim() || "",
      instructor,
      capacity: capacity || 30,
      archived: false,
      archiveDate: null,
      enrolledStudents: [],
      assistantIds: [],
    });

    const saved = await newCourse.save();

    res.status(201).json({
      message: "Course created successfully",
      course: saved,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Course code already exists" });
    }
    res.status(500).json({ message: "Error creating course" });
  }
}

/* =====================================================
   UPDATE COURSE
===================================================== */
async function updateCourse(req, res) {
  try {
    const updated = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "Course not found" });

    res.status(200).json({
      message: "Course updated successfully",
      course: updated,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating course" });
  }
}

/* =====================================================
   REQUIREMENT 1 – FEATURE 2
   ARCHIVE / UNARCHIVE COURSE
===================================================== */
async function toggleArchiveCourse(req, res) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Only the course instructor (creator) or an admin may archive/reactivate
    if (course.instructor.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: only the course instructor or admin may archive/reactivate this course' });
    }

    course.archived = !course.archived;
    course.archiveDate = course.archived ? new Date() : null;
    await course.save();

    res.status(200).json({
      message: course.archived ? "Course archived" : "Course reactivated",
    });
  } catch (error) {
    res.status(500).json({ message: "Error toggling archive" });
  }
}

/* =====================================================
   REQUIREMENT 1 – FEATURE 3
   ENROLLMENT STATISTICS
===================================================== */
async function getEnrollmentStats(req, res) {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const assignments = await Assignment.find({ course: courseId });

    let totalScore = 0;
    let count = 0;

    assignments.forEach((a) => {
      a.scores?.forEach((s) => {
        totalScore += s.score;
        count++;
      });
    });

    res.status(200).json({
      totalEnrolledStudents: course.enrolledStudents.length,
      averagePerformance: count ? (totalScore / count).toFixed(2) : 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching statistics" });
  }
}

/* =====================================================
   REQUIREMENT 1 – FEATURE 4
   ASSISTANT MANAGEMENT
===================================================== */
async function addAssistant(req, res) {
  const { courseId } = req.params;
  const { assistantId } = req.body;

  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ message: "Course not found" });

  // Only the course instructor (creator) or an admin may add assistants
  if (course.instructor.toString() !== req.userId && req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: only the course instructor or admin may add assistants' });
  }

  if (course.assistantIds.includes(assistantId)) {
    return res.status(400).json({ message: "Already an assistant" });
  }

  course.assistantIds.push(assistantId);
  await course.save();

  res.json({ message: "Assistant added" });
}

async function removeAssistant(req, res) {
  const { courseId, assistantId } = req.params;

  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ message: "Course not found" });

  // Only the course instructor (creator) or an admin may remove assistants
  if (course.instructor.toString() !== req.userId && req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: only the course instructor or admin may remove assistants' });
  }

  course.assistantIds = course.assistantIds.filter(
    (id) => id.toString() !== assistantId
  );

  await course.save();
  res.json({ message: "Assistant removed" });
}

/* =====================================================
   REQUIREMENT 2 – FEATURE 2
   ENROLL STUDENT
===================================================== */
async function enrollStudent(req, res) {
  const { courseId } = req.params;
  const studentId = req.userId;

  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ message: "Course not found" });

  if (course.archived)
    return res.status(400).json({ message: "Course is archived" });

  if (course.enrolledStudents.includes(studentId))
    return res.status(400).json({ message: "Already enrolled" });

  if (course.enrolledStudents.length >= course.capacity)
    return res.status(400).json({ message: "Course is full" });

  course.enrolledStudents.push(studentId);
  await course.save();

  // Update or create Student record. Match by user email (students are separate documents)
  try {
    const user = await require('./../models/User').findById(studentId);
    const studentEmail = user?.email;

    if (studentEmail) {
      let student = await Student.findOne({ email: studentEmail });
      if (!student) {
        student = new Student({
          name: user.name,
          email: studentEmail,
          enrollments: [],
          enrollmentHistory: [],
        });
      }

      // add active enrollment if not present
      const already = student.enrollments.some((e) => e.course.toString() === courseId);
      if (!already) {
        student.enrollments.push({ course: courseId, status: 'enrolled' });
      }

      // add history record
      student.enrollmentHistory.push({ course: courseId, status: 'enrolled', enrolledAt: new Date() });

      await student.save();
    }
  } catch (err) {
    // log but don't fail the request if student update fails
    console.error('Error updating Student record during enroll:', err.message);
  }

  res.json({ message: "Enrollment successful" });
}

/* =====================================================
   REQUIREMENT 2 – FEATURE 3
   UNENROLL STUDENT (PRESERVE RECORDS)
===================================================== */
async function unenrollStudent(req, res) {
  const { courseId } = req.params;
  const studentId = req.userId;

  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ message: "Course not found" });

  course.enrolledStudents = course.enrolledStudents.filter(
    (id) => id.toString() !== studentId
  );
  await course.save();

  await Student.updateOne(
    { _id: studentId, "enrollments.course": courseId },
    { $set: { "enrollments.$.status": "dropped" } }
  );

  res.json({
    message: "Unenrolled successfully. Academic records preserved.",
  });
}

/* =====================================================
   REQUIREMENT 2 – FEATURE 4
   ENROLLMENT HISTORY
===================================================== */
async function getEnrollmentHistory(req, res) {
  const student = await Student.findById(req.userId)
    .populate("enrollments.course", "title code");

  if (!student) return res.status(404).json({ message: "Student not found" });

  res.json(student.enrollments);
}

/* =====================================================
   DELETE COURSE (ADMIN)
===================================================== */
async function deleteCourse(req, res) {
  const deleted = await Course.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Course not found" });

  res.json({ message: "Course deleted successfully" });
}

/* =====================================================
   EXPORTS
===================================================== */
module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  toggleArchiveCourse,
  deleteCourse,

  enrollStudent,
  unenrollStudent,
  getEnrollmentHistory,

  getEnrollmentStats,
  addAssistant,
  removeAssistant,
};
