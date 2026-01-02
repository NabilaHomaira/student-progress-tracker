/**
 * Badge Routes
 * Modular achievement badge endpoints
 * All routes are read-only and require authentication
 */

const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badgeController');
const auth = require('../middleware/auth');

/**
 * All badge routes require authentication
 */
router.use(auth);

/**
 * Get all badges for a student
 */
router.get('/student/:studentId', badgeController.getStudentBadges);

/**
 * Root: list badge definitions (convenience)
 */
router.get('/', badgeController.getBadgeDefinitions);

/**
 * Get badges for a student in a specific course
 */
router.get('/student/:studentId/course/:courseId', badgeController.getCourseBadges);

/**
 * Get all badge definitions
 */
router.get('/definitions', badgeController.getBadgeDefinitions);

/**
 * Get specific badge definition
 */
router.get('/definitions/:badgeId', badgeController.getBadgeDefinition);

module.exports = router;
