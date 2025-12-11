// middleware/enrollmentPermission.js
// Requirement 2, Feature 2: Enrollment Permission Middleware

/**
 * Middleware to verify user is a student
 */
module.exports.checkStudent = (req, res, next) => {
  const userRole = req.userRole;
  if (!userRole || userRole !== 'student') {
    return res.status(403).json({ message: 'Forbidden: Only students can perform this action' });
  }
  next();
};

/**
 * Middleware to verify user is instructor or assistant with enrollment permission
 */
module.exports.checkInstructorOrEnrollmentPermission = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.userId;

    const Course = require('../models/Course');
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the instructor
    if (course.instructor.toString() === userId) {
      req.course = course;
      return next();
    }

    // Check if user is an assistant with enrollment permission
    const assistant = course.assistants?.find(
      (assistant) => assistant.user.toString() === userId && assistant.permissions.canManageEnrollments
    );

    if (assistant) {
      req.course = course;
      req.assistant = assistant;
      return next();
    }

    return res.status(403).json({ 
      message: 'Forbidden: Only instructors and authorized assistants can manage enrollments' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking enrollment permissions', error });
  }
};

