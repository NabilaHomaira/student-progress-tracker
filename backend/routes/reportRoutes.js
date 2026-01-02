/**
 * Report Routes - Grade report generation endpoints
 * Modular routes for CSV and PDF report exports
 */

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');
const rolePermission = require('../middleware/role');

/**
 * All report routes require authentication and teacher role
 */
router.use(auth);
router.use(rolePermission(['teacher', 'admin']));

/**
 * Student Report Routes
 */
// support both path-format and query-format: /student/:id/format/:format  OR  /student/:id?format=csv
router.get('/student/:studentId/format/:format', reportController.generateStudentReport);
router.get('/student/:studentId', reportController.generateStudentReport);
router.get('/student/:studentId/validate', reportController.validateStudentGradeData);

/**
 * Course Report Routes
 */
router.get('/course/:courseId/format/:format', reportController.generateCourseReport);
router.get('/course/:courseId', reportController.generateCourseReport);
router.get('/course/:courseId/validate', reportController.validateCourseGradeData);

module.exports = router;
