// routes/courseRoutes.js
const express = require("express");
const router = express.Router();

const courseController = require("../controllers/courseController");
const auth = require("../middleware/auth");
const permit = require("../middleware/role");

/* =========================================
   TEACHER / ADMIN ROUTES
========================================= */

// Create course (Req 1 Feature 1)
router.post(
  "/",
  auth,
  permit("teacher", "admin"),
  courseController.createCourse
);

// Update course
router.put(
  "/:id",
  auth,
  permit("teacher", "admin"),
  courseController.updateCourse
);

// Archive / Unarchive course (Req 1 Feature 2)
router.patch(
  "/:id/archive-toggle",
  auth,
  permit("teacher", "admin"),
  courseController.toggleArchiveCourse
);

// Alias: accept `/archive` path as well for compatibility
router.patch(
  "/:id/archive",
  auth,
  permit("teacher", "admin"),
  courseController.toggleArchiveCourse
);

// Alias: accept `/unarchive` path for compatibility
router.patch(
  "/:id/unarchive",
  auth,
  permit("teacher", "admin"),
  courseController.toggleArchiveCourse
);

// Enrollment statistics (Req 1 Feature 3)
router.get(
  "/:courseId/stats",
  auth,
  permit("teacher", "admin"),
  courseController.getEnrollmentStats
);

// Assign assistant (Req 1 Feature 4)
router.post(
  "/:courseId/assistants",
  auth,
  permit("teacher", "admin"),
  courseController.addAssistant
);

// Remove assistant
router.delete(
  "/:courseId/assistants/:assistantId",
  auth,
  permit("teacher", "admin"),
  courseController.removeAssistant
);

// Delete course (admin only – optional)
router.delete(
  "/:id",
  auth,
  permit("admin"),
  courseController.deleteCourse
);

/* =========================================
   STUDENT ROUTES
========================================= */

// Enroll in course (Req 2 Feature 2)
router.post(
  "/:courseId/enroll",
  auth,
  permit("student"),
  courseController.enrollStudent
);

// Unenroll (Req 2 Feature 3)
router.post(
  "/:courseId/unenroll",
  auth,
  permit("student"),
  courseController.unenrollStudent
);

// Enrollment history (Req 2 Feature 4)
router.get(
  "/my/enrollments",
  auth,
  permit("student"),
  courseController.getEnrollmentHistory
);

/* =========================================
   COMMON ROUTES (Any authenticated user)
========================================= */

// Get all courses (Req 2 Feature 1)
// Allow without auth for viewing, but auth is optional for additional features
router.get("/", courseController.getCourses);

// Get single course
router.get("/:id", auth, courseController.getCourseById);

module.exports = router;
