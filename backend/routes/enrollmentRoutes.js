// routes/enrollmentRoutes.js
// Requirement 2, Feature 2: Enrollment Management Routes

const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const auth = require('../middleware/auth');
const { checkStudent } = require('../middleware/enrollmentPermission');
const { checkInstructorOrEnrollmentPermission } = require('../middleware/enrollmentPermission');

// Student routes
// Request enrollment in a course
router.post('/courses/:courseId/request-enrollment', auth, checkStudent, enrollmentController.requestEnrollment);

// Enroll directly in a course (auto-approve)
router.post('/courses/:courseId/enroll', auth, checkStudent, enrollmentController.enrollInCourse);

// Get enrollment status for a course
router.get('/courses/:courseId/enrollment-status', auth, checkStudent, enrollmentController.getEnrollmentStatus);

// Get all enrollment requests for logged-in student
router.get('/students/my-enrollment-requests', auth, checkStudent, enrollmentController.getMyEnrollmentRequests);

// Cancel enrollment request
router.delete('/enrollment-requests/:requestId', auth, checkStudent, enrollmentController.cancelEnrollmentRequest);

// Instructor/Assistant routes
// Get all pending enrollment requests for a course
router.get('/courses/:courseId/enrollment-requests', auth, checkInstructorOrEnrollmentPermission, enrollmentController.getCourseEnrollmentRequests);

// Approve enrollment request
router.patch('/enrollment-requests/:requestId/approve', auth, checkInstructorOrEnrollmentPermission, enrollmentController.approveEnrollmentRequest);

// Reject enrollment request
router.patch('/enrollment-requests/:requestId/reject', auth, checkInstructorOrEnrollmentPermission, enrollmentController.rejectEnrollmentRequest);

module.exports = router;

