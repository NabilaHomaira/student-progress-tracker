// routes/courseRoutes.js
const express = require('express');
const router = express.Router();

const courseController = require('../controllers/courseController');
const auth = require('../middleware/auth');
const permit = require('../middleware/role');

// Teacher/Admin only
router.post(
  '/',
  auth,
  permit('teacher', 'admin'),
  courseController.createCourse
);

router.put(
  '/:id',
  auth,
  permit('teacher', 'admin'),
  courseController.updateCourse
);

router.patch(
  '/:id/archive',
  auth,
  permit('teacher', 'admin'),
  courseController.archiveCourse
);

router.patch(
  '/:id/unarchive',
  auth,
  permit('teacher', 'admin'),
  courseController.unarchiveCourse
);

router.patch(
  '/:courseId/unenroll',
  auth,
  permit('student'),
  courseController.unenrollStudent
);

router.get(
  "/:courseId/stats",
  auth,
  permit("teacher", "admin"),
  courseController.getEnrollmentStats
);


// Any authenticated user
router.get('/', auth, courseController.getAllCourses);
router.get('/:id', auth, courseController.getCourseById);

module.exports = router;
