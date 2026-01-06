// routes/enrollmentRoutes.js
// Requirement 2, Feature 2: Enrollment Management Routes

const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const auth = require('../middleware/auth');
const enrollmentPerm = require('../middleware/enrollmentPermission');
const permit = require('../middleware/role');
const checkStudent = enrollmentPerm.checkStudent;
const checkInstructorOrEnrollmentPermission = enrollmentPerm.checkInstructorOrEnrollmentPermission;
const EnrollmentRequest = require('../models/EnrollmentRequest');

// Sanity checks to surface clearer errors during startup
function assertHandler(name, fn) {
	if (typeof fn !== 'function') {
		console.error(`Enrollment route setup error: ${name} is not a function ->`, fn);
		throw new TypeError(`${name} must be a function`);
	}
}

assertHandler('auth', auth);
assertHandler('checkStudent', checkStudent);
assertHandler('checkInstructorOrEnrollmentPermission', checkInstructorOrEnrollmentPermission);
assertHandler('enrollmentController.requestEnrollment', enrollmentController.requestEnrollment);

// If a route is given a `requestId` (approve/reject aliases), attach the related courseId
async function attachCourseFromRequest(req, res, next) {
	try {
		const { requestId } = req.params;
		if (!requestId) return next();

		const requestObj = await EnrollmentRequest.findById(requestId).populate('course');
		if (!requestObj) return res.status(404).json({ message: 'Request not found' });
		if (!requestObj.course) return res.status(404).json({ message: 'Course not found' });

		// make sure permission middleware can read courseId
		req.enrollmentRequest = requestObj;
		req.params.courseId = requestObj.course._id.toString();
		return next();
	} catch (err) {
		return res.status(500).json({ message: 'Error resolving request', error: err.message });
	}
}

// Student routes
// Request enrollment in a course
router.post('/courses/:courseId/request-enrollment', auth, checkStudent, enrollmentController.requestEnrollment);

// Compatibility alias: accept `/request/:courseId` for clients using older path
router.post('/request/:courseId', auth, checkStudent, enrollmentController.requestEnrollment);

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

// Get all pending enrollment requests across courses taught by the logged-in instructor
router.get('/courses/my-requests', auth, permit('teacher','admin'), enrollmentController.getInstructorPendingRequests);

// Approve enrollment request
router.patch('/enrollment-requests/:requestId/approve', auth, attachCourseFromRequest, checkInstructorOrEnrollmentPermission, enrollmentController.approveEnrollmentRequest);

// Reject enrollment request
router.patch('/enrollment-requests/:requestId/reject', auth, attachCourseFromRequest, checkInstructorOrEnrollmentPermission, enrollmentController.rejectEnrollmentRequest);

// Compatibility aliases: accept `/approve/:requestId` and `/reject/:requestId`
router.patch('/approve/:requestId', auth, attachCourseFromRequest, checkInstructorOrEnrollmentPermission, enrollmentController.approveEnrollmentRequest);
router.patch('/reject/:requestId', auth, attachCourseFromRequest, checkInstructorOrEnrollmentPermission, enrollmentController.rejectEnrollmentRequest);

// Enrollment History - Requirement 2, Feature 4
// Get enrollment history for student
router.get('/students/enrollment-history', auth, checkStudent, enrollmentController.getEnrollmentHistory);

// Compatibility alias: accept `/history` for clients using a shorter path
router.get('/history', auth, checkStudent, enrollmentController.getEnrollmentHistory);

// Unenroll from a course
router.post('/courses/:courseId/unenroll', auth, checkStudent, enrollmentController.unenrollFromCourse);

// Compatibility alias: accept `/unenroll/:courseId` (PATCH) for clients using that path/method
router.patch('/unenroll/:courseId', auth, checkStudent, enrollmentController.unenrollFromCourse);

// Mark course as completed
router.post('/courses/:courseId/mark-completed', auth, checkStudent, enrollmentController.markCourseAsCompleted);

// Get enrolled students for a course (for instructors)
router.get('/course/:courseId', auth, checkInstructorOrEnrollmentPermission, enrollmentController.getCourseEnrolledStudents);

module.exports = router;



