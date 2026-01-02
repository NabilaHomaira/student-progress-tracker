// controllers/enrollmentController.js
// Requirement 2 – Feature 2: Enrollment request & approval workflow

const Course = require("../models/Course");
const User = require("../models/User");
const Student = require("../models/student");
const EnrollmentRequest = require("../models/EnrollmentRequest");

/* ======================================================
   STUDENT: REQUEST ENROLLMENT
====================================================== */
exports.requestEnrollment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.userId;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.archived) {
      return res.status(400).json({ message: "Cannot enroll in archived course" });
    }

    const user = await User.findById(studentId);
    if (!user || user.role !== "student") {
      return res.status(403).json({ message: "Only students can enroll" });
    }

    const alreadyEnrolled = course.enrolledStudents.some(
      (id) => id.toString() === studentId
    );
    if (alreadyEnrolled) {
      return res.status(400).json({ message: "Already enrolled" });
    }

    const existingRequest = await EnrollmentRequest.findOne({
      student: studentId,
      course: courseId,
      status: "pending",
    });
    if (existingRequest) {
      return res.status(400).json({ message: "Enrollment request already pending" });
    }

    const request = await EnrollmentRequest.create({
      student: studentId,
      course: courseId,
      status: "pending",
    });

    await request.populate("course", "title code");
    res.status(201).json({
      message: "Enrollment request submitted",
      request,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   INSTRUCTOR: VIEW PENDING REQUESTS
====================================================== */
exports.getCourseEnrollmentRequests = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.userId;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const isInstructor = course.instructor.toString() === userId;
    const assistant = course.assistants?.find(
      (a) => a.user.toString() === userId && a.permissions.canManageEnrollments
    );

    if (!isInstructor && !assistant) {
      return res.status(403).json({ message: "Access denied" });
    }

    const requests = await EnrollmentRequest.find({
      course: courseId,
      status: "pending",
    }).populate("student", "name email");

    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   INSTRUCTOR: GET ALL PENDING REQUESTS FOR THEIR COURSES
   Returns pending EnrollmentRequest objects where the related
   course.instructor matches the logged-in user.
====================================================== */
exports.getInstructorPendingRequests = async (req, res) => {
  try {
    const userId = req.userId;
    const requests = await EnrollmentRequest.find({ status: 'pending' })
      .populate('student', 'name email')
      .populate('course', 'title code instructor');

    const filtered = requests.filter(r => r.course && r.course.instructor && r.course.instructor.toString() === userId);

    res.status(200).json(filtered);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   INSTRUCTOR: APPROVE REQUEST
====================================================== */
exports.approveEnrollmentRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const approverId = req.userId;

    const request = await EnrollmentRequest.findById(requestId)
      .populate("course")
      .populate("student");

    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request already processed" });
    }

    const course = request.course;
    const isInstructor = course.instructor.toString() === approverId;
    const assistant = course.assistants?.find(
      (a) => a.user.toString() === approverId && a.permissions.canManageEnrollments
    );

    if (!isInstructor && !assistant) {
      return res.status(403).json({ message: "Access denied" });
    }

    course.enrolledStudents.push(request.student._id);
    await course.save();

    let student = await Student.findOne({ email: request.student.email });
    if (!student) {
      student = new Student({
        name: request.student.name,
        email: request.student.email,
        enrollments: [],
        enrollmentHistory: [],
      });
    }

    student.enrollments.push({
      course: course._id,
      status: "enrolled",
      enrolledAt: new Date(),
    });
    // Also record in enrollmentHistory for accurate student history
    student.enrollmentHistory = student.enrollmentHistory || [];
    student.enrollmentHistory.push({
      course: course._id,
      status: 'enrolled',
      enrolledAt: new Date(),
    });
    await student.save();

    request.status = "approved";
    request.processedAt = new Date();
    request.processedBy = approverId;
    await request.save();

    res.status(200).json({
      message: "Enrollment approved",
      request,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   INSTRUCTOR: REJECT REQUEST
====================================================== */
exports.rejectEnrollmentRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const approverId = req.userId;

    const request = await EnrollmentRequest.findById(requestId).populate("course");
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request already processed" });
    }

    const course = request.course;
    const isInstructor = course.instructor.toString() === approverId;
    const assistant = course.assistants?.find(
      (a) => a.user.toString() === approverId && a.permissions.canManageEnrollments
    );

    if (!isInstructor && !assistant) {
      return res.status(403).json({ message: "Access denied" });
    }

    request.status = "rejected";
    request.processedAt = new Date();
    request.processedBy = approverId;
    await request.save();

    res.status(200).json({
      message: "Enrollment rejected",
      request,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   STUDENT: ENROLLMENT HISTORY (Feature 4 support)
====================================================== */
exports.getEnrollmentHistory = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const student = await Student.findOne({ email: user.email })
      .populate("enrollmentHistory.course", "title code");

    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }

    res.status(200).json(student.enrollmentHistory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Placeholder / not-yet-implemented handlers referenced by routes
exports.enrollInCourse = async (req, res) => {
  return res.status(501).json({ message: 'Not implemented: enrollInCourse' });
};

exports.getEnrollmentStatus = async (req, res) => {
  return res.status(501).json({ message: 'Not implemented: getEnrollmentStatus' });
};

exports.getMyEnrollmentRequests = async (req, res) => {
  try {
    const studentId = req.userId;
    const requests = await EnrollmentRequest.find({ student: studentId })
      .populate('course', 'title code instructor')
      .populate('student', 'name email');

    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancelEnrollmentRequest = async (req, res) => {
  return res.status(501).json({ message: 'Not implemented: cancelEnrollmentRequest' });
};

exports.unenrollFromCourse = async (req, res) => {
  try {
    // Support both /courses/:courseId/unenroll and /unenroll/:courseId
    const courseId = req.params.courseId || req.params.id;
    const studentId = req.userId;
    const { reason } = req.body || {};

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const isEnrolled = course.enrolledStudents.some((id) => id.toString() === studentId);
    if (!isEnrolled) return res.status(400).json({ message: 'Not enrolled in course' });

    // Remove student from course
    course.enrolledStudents = course.enrolledStudents.filter(
      (id) => id.toString() !== studentId
    );
    await course.save();

    // Update Student record: find by user email to avoid duplicate creation
    const user = await User.findById(studentId);
    let student = null;
    if (user && user.email) {
      student = await Student.findOne({ email: user.email });
    }

    if (student) {
      // mark active enrollment as dropped
      const enrollment = student.enrollments.find((e) => e.course.toString() === courseId);
      if (enrollment) {
        enrollment.status = 'dropped';
      }

      student.enrollmentHistory.push({
        course: courseId,
        status: 'dropped',
        unenrolledAt: new Date(),
        reason: reason || null,
      });

      await student.save();
    } else {
      // If no student doc exists, create a minimal student record using the User info
      const emailToUse = user?.email || `unknown-${studentId}@example.com`;
      const newStudent = new Student({
        name: user?.name || 'Unknown',
        email: emailToUse,
        enrollments: [],
        enrollmentHistory: [
          {
            course: courseId,
            status: 'dropped',
            unenrolledAt: new Date(),
            reason: reason || null,
          },
        ],
      });
      await newStudent.save();
    }

    return res.status(200).json({ message: 'Unenrolled successfully' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.markCourseAsCompleted = async (req, res) => {
  return res.status(501).json({ message: 'Not implemented: markCourseAsCompleted' });
};
