// controllers/enrollmentController.js
// Requirement 2, Feature 2: Enrollment Management Controller
// Handles enrollment requests and enrollment validations

const Course = require('../models/Course');
const User = require('../models/User');
const Student = require('../models/student');
const EnrollmentRequest = require('../models/EnrollmentRequest');

// Request enrollment in a course
exports.requestEnrollment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { message } = req.body;
    const studentId = req.userId;

    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Validate user exists and is a student
    const user = await User.findById(studentId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can enroll in courses' });
    }

    // Check if course is archived
    if (course.isArchived) {
      return res.status(400).json({ message: 'Cannot enroll in archived courses' });
    }

    // Check if already enrolled
    const isEnrolled = course.enrolledStudents.some(
      (id) => id.toString() === studentId
    );
    if (isEnrolled) {
      return res.status(400).json({ message: 'You are already enrolled in this course' });
    }

    // Check for existing pending request
    const existingRequest = await EnrollmentRequest.findOne({
      student: studentId,
      course: courseId,
      status: 'pending',
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending enrollment request for this course' });
    }

    // Create enrollment request
    const enrollmentRequest = new EnrollmentRequest({
      student: studentId,
      course: courseId,
      status: 'pending',
      message: message || null,
    });

    await enrollmentRequest.save();

    // Populate the request for response
    await enrollmentRequest.populate('student', 'name email');
    await enrollmentRequest.populate('course', 'title code');

    res.status(201).json({
      message: 'Enrollment request submitted successfully',
      enrollmentRequest,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate enrollment request' });
    }
    res.status(500).json({ message: 'Error creating enrollment request', error: error.message });
  }
};

// Enroll directly (auto-approve)
exports.enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.userId;

    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Validate user exists and is a student
    const user = await User.findById(studentId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can enroll in courses' });
    }

    // Check if course is archived
    if (course.isArchived) {
      return res.status(400).json({ message: 'Cannot enroll in archived courses' });
    }

    // Check if already enrolled
    const isEnrolled = course.enrolledStudents.some(
      (id) => id.toString() === studentId
    );
    if (isEnrolled) {
      return res.status(400).json({ message: 'You are already enrolled in this course' });
    }

    // Add student to course
    course.enrolledStudents.push(studentId);
    await course.save();

    // Update or create student record
    let student = await Student.findOne({ email: user.email });
    if (!student) {
      student = new Student({
        name: user.name,
        email: user.email,
      });
    }

    // Check if enrollment already exists in student record
    const enrollmentExists = student.enrollments.some(
      (enrollment) => enrollment.course.toString() === courseId
    );

    if (!enrollmentExists) {
      student.enrollments.push({
        course: courseId,
        status: 'enrolled',
      });
      await student.save();
    }

    // Update any pending requests to enrolled
    await EnrollmentRequest.updateMany(
      {
        student: studentId,
        course: courseId,
        status: 'pending',
      },
      {
        status: 'enrolled',
        processedAt: new Date(),
      }
    );

    res.status(201).json({
      message: 'Successfully enrolled in course',
      course: {
        _id: course._id,
        title: course.title,
        code: course.code,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error enrolling in course', error: error.message });
  }
};

// Get enrollment status for a student in a course
exports.getEnrollmentStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.userId;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if enrolled
    const isEnrolled = course.enrolledStudents.some(
      (id) => id.toString() === studentId
    );

    // Check for pending request
    const pendingRequest = await EnrollmentRequest.findOne({
      student: studentId,
      course: courseId,
      status: 'pending',
    }).populate('course', 'title code');

    res.status(200).json({
      isEnrolled,
      hasPendingRequest: !!pendingRequest,
      pendingRequest: pendingRequest || null,
      course: {
        _id: course._id,
        title: course.title,
        code: course.code,
        isArchived: course.isArchived,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching enrollment status', error: error.message });
  }
};

// Get all enrollment requests for a student
exports.getMyEnrollmentRequests = async (req, res) => {
  try {
    const studentId = req.userId;

    const requests = await EnrollmentRequest.find({ student: studentId })
      .populate('course', 'title code description instructor')
      .populate('processedBy', 'name email')
      .sort({ requestedAt: -1 });

    res.status(200).json({
      message: 'Enrollment requests retrieved successfully',
      requests,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching enrollment requests', error: error.message });
  }
};

// Cancel pending enrollment request
exports.cancelEnrollmentRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const studentId = req.userId;

    const request = await EnrollmentRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Enrollment request not found' });
    }

    // Verify the request belongs to the student
    if (request.student.toString() !== studentId) {
      return res.status(403).json({ message: 'You can only cancel your own enrollment requests' });
    }

    // Only allow cancellation of pending requests
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Can only cancel pending enrollment requests' });
    }

    await EnrollmentRequest.findByIdAndDelete(requestId);

    res.status(200).json({
      message: 'Enrollment request cancelled successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling enrollment request', error: error.message });
  }
};

// Get all pending enrollment requests for a course (for instructors)
exports.getCourseEnrollmentRequests = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is instructor or assistant with permission
    const userId = req.userId;
    const isInstructor = course.instructor.toString() === userId;
    const assistant = course.assistants?.find(
      (a) => a.user?.toString() === userId && a.permissions?.canManageEnrollments
    );

    if (!isInstructor && !assistant) {
      return res.status(403).json({ message: 'Only instructors and authorized assistants can view enrollment requests' });
    }

    const requests = await EnrollmentRequest.find({
      course: courseId,
      status: 'pending',
    })
      .populate('student', 'name email')
      .sort({ requestedAt: -1 });

    res.status(200).json({
      message: 'Enrollment requests retrieved successfully',
      requests,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching enrollment requests', error: error.message });
  }
};

// Approve enrollment request (for instructors)
exports.approveEnrollmentRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.userId;

    const request = await EnrollmentRequest.findById(requestId)
      .populate('course')
      .populate('student');

    if (!request) {
      return res.status(404).json({ message: 'Enrollment request not found' });
    }

    // Check if user is instructor or assistant with permission
    const course = request.course;
    const isInstructor = course.instructor.toString() === userId;
    const assistant = course.assistants?.find(
      (a) => a.user?.toString() === userId && a.permissions?.canManageEnrollments
    );

    if (!isInstructor && !assistant) {
      return res.status(403).json({ message: 'Only instructors and authorized assistants can approve enrollment requests' });
    }

    // Check if request is still pending
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Enrollment request has already been processed' });
    }

    // Check if course is archived
    if (course.isArchived) {
      return res.status(400).json({ message: 'Cannot approve enrollment for archived courses' });
    }

    // Check if already enrolled
    const isEnrolled = course.enrolledStudents.some(
      (id) => id.toString() === request.student._id.toString()
    );

    if (isEnrolled) {
      // Mark request as enrolled and return
      request.status = 'enrolled';
      request.processedAt = new Date();
      request.processedBy = userId;
      await request.save();
      return res.status(200).json({ message: 'Student is already enrolled', request });
    }

    // Add student to course
    course.enrolledStudents.push(request.student._id);
    await course.save();

    // Update student record
    let student = await Student.findOne({ email: request.student.email });
    if (!student) {
      student = new Student({
        name: request.student.name,
        email: request.student.email,
      });
    }

    const enrollmentExists = student.enrollments.some(
      (enrollment) => enrollment.course.toString() === course._id.toString()
    );

    if (!enrollmentExists) {
      student.enrollments.push({
        course: course._id,
        status: 'enrolled',
      });
      await student.save();
    }

    // Update request status
    request.status = 'approved';
    request.processedAt = new Date();
    request.processedBy = userId;
    await request.save();

    await request.populate('student', 'name email');

    res.status(200).json({
      message: 'Enrollment request approved successfully',
      request,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error approving enrollment request', error: error.message });
  }
};

// Reject enrollment request (for instructors)
exports.rejectEnrollmentRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { rejectionReason } = req.body;
    const userId = req.userId;

    const request = await EnrollmentRequest.findById(requestId)
      .populate('course');

    if (!request) {
      return res.status(404).json({ message: 'Enrollment request not found' });
    }

    // Check if user is instructor or assistant with permission
    const course = request.course;
    const isInstructor = course.instructor.toString() === userId;
    const assistant = course.assistants?.find(
      (a) => a.user.toString() === userId && a.permissions.canManageEnrollments
    );

    if (!isInstructor && !assistant) {
      return res.status(403).json({ message: 'Only instructors and authorized assistants can reject enrollment requests' });
    }

    // Check if request is still pending
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Enrollment request has already been processed' });
    }

    // Update request status
    request.status = 'rejected';
    request.processedAt = new Date();
    request.processedBy = userId;
    request.rejectionReason = rejectionReason || 'No reason provided';
    await request.save();

    await request.populate('student', 'name email');

    res.status(200).json({
      message: 'Enrollment request rejected successfully',
      request,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting enrollment request', error: error.message });
  }
};

// Get enrollment history for a student
exports.getEnrollmentHistory = async (req, res) => {
  try {
    const studentId = req.userId;

    const student = await Student.findOne({ email: (await User.findById(studentId)).email })
      .populate({
        path: 'enrollmentHistory.course',
        select: 'title code description instructor',
        populate: {
          path: 'instructor',
          select: 'name email',
        },
      })
      .sort({ 'enrollmentHistory.enrolledAt': -1 });

    if (!student) {
      return res.status(404).json({ message: 'Student record not found' });
    }

    res.status(200).json({
      message: 'Enrollment history retrieved successfully',
      enrollmentHistory: student.enrollmentHistory || [],
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching enrollment history', error: error.message });
  }
};

// Unenroll from a course
exports.unenrollFromCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { reason } = req.body;
    const studentId = req.userId;

    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Validate user exists and is a student
    const user = await User.findById(studentId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can unenroll from courses' });
    }

    // Check if enrolled
    const enrollmentIndex = course.enrolledStudents.findIndex(
      (id) => id.toString() === studentId
    );

    if (enrollmentIndex === -1) {
      return res.status(400).json({ message: 'You are not enrolled in this course' });
    }

    // Remove from course
    course.enrolledStudents.splice(enrollmentIndex, 1);
    await course.save();

    // Update student record
    let student = await Student.findOne({ email: user.email });
    if (student) {
      // Update current enrollment
      const currentEnrollment = student.enrollments.find(
        (e) => e.course.toString() === courseId
      );

      if (currentEnrollment) {
        // Add to enrollment history with dropped status
        student.enrollmentHistory.push({
          course: courseId,
          status: 'dropped',
          enrolledAt: currentEnrollment._doc?.enrolledAt || new Date(),
          unenrolledAt: new Date(),
          reason: reason || 'Student requested unenrollment',
        });

        // Remove from current enrollments
        student.enrollments = student.enrollments.filter(
          (e) => e.course.toString() !== courseId
        );

        await student.save();
      }
    }

    res.status(200).json({
      message: 'Successfully unenrolled from course. Records have been preserved.',
      course: {
        _id: course._id,
        title: course.title,
        code: course.code,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error unenrolling from course', error: error.message });
  }
};

// Mark course as completed
exports.markCourseAsCompleted = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.userId;

    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Validate user exists and is a student
    const user = await User.findById(studentId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if enrolled
    const isEnrolled = course.enrolledStudents.some(
      (id) => id.toString() === studentId
    );

    if (!isEnrolled) {
      return res.status(400).json({ message: 'You are not enrolled in this course' });
    }

    // Update student record
    let student = await Student.findOne({ email: user.email });
    if (student) {
      const currentEnrollment = student.enrollments.find(
        (e) => e.course.toString() === courseId
      );

      if (currentEnrollment) {
        // Update status to completed
        currentEnrollment.status = 'completed';

        // Add to enrollment history
        student.enrollmentHistory.push({
          course: courseId,
          status: 'completed',
          enrolledAt: new Date(),
          unenrolledAt: new Date(),
          reason: 'Course completed',
        });

        await student.save();
      }
    }

    res.status(200).json({
      message: 'Course marked as completed successfully',
      course: {
        _id: course._id,
        title: course.title,
        code: course.code,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error marking course as completed', error: error.message });
  }
};

