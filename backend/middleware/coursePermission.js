// middleware/coursePermission.js
const Course = require('../models/Course');

/**
 * Middleware to check if user is the instructor of a course
 */
module.exports.checkInstructor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the instructor
    if (course.instructor.toString() !== userId) {
      return res.status(403).json({ 
        message: 'Forbidden: Only the course instructor can perform this action' 
      });
    }

    req.course = course;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking course permissions', error });
  }
};

/**
 * Middleware to check if user is instructor OR has specific permission as assistant
 */
module.exports.checkInstructorOrPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Check if user is the instructor
      if (course.instructor.toString() === userId) {
        req.course = course;
        return next();
      }

      // Check if user is an assistant with the required permission
      const assistant = course.assistants.find(
        (assistant) => assistant.user.toString() === userId
      );

      if (assistant && assistant.permissions[requiredPermission]) {
        req.course = course;
        req.assistant = assistant;
        return next();
      }

      return res.status(403).json({ 
        message: `Forbidden: Insufficient permissions. Required: ${requiredPermission}` 
      });
    } catch (error) {
      res.status(500).json({ message: 'Error checking course permissions', error });
    }
  };
};

