// middleware/assistantPermission.js
const Course = require("../models/Course");

module.exports = (permission) => {
  return async (req, res, next) => {
    try {
      const courseId = req.params.courseId || req.body.courseId;
      if (!courseId) {
        return res.status(400).json({ message: "Course ID required" });
      }

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Instructor always allowed
      if (course.instructor.toString() === req.userId) {
        return next();
      }

      // Check assistant permissions
      const assistant = (course.assistants || []).find(
        (a) => a.user.toString() === req.userId
      );

      if (!assistant || !assistant.permissions || !assistant.permissions[permission]) {
        return res.status(403).json({ message: "Permission denied" });
      }

      next();
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
};
