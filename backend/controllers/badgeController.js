/**
 * Badge Controller
 * Handles HTTP requests for badge retrieval
 * Read-only endpoints that don't modify any data
 */

const badgeService = require('../services/badgeService');

/**
 * Get all badges for a student
 * GET /api/badges/student/:studentId
 */
exports.getStudentBadges = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Verify user is accessing their own data or is an admin/teacher
    const userId = req.userId;
    const userRole = req.userRole;

    // Allow access if: user is viewing their own data, or user is teacher/admin
    if (String(userId) !== String(studentId) && !['teacher', 'admin'].includes(userRole)) {
      return res.status(403).json({ message: 'Unauthorized access to badges' });
    }

    const badges = await badgeService.calculateBadgesForStudent(studentId);

    res.status(200).json({
      success: true,
      studentId,
      badges,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get badges for a student in a specific course
 * GET /api/badges/student/:studentId/course/:courseId
 */
exports.getCourseBadges = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    // Verify user is accessing their own data or is an admin/teacher
    const userId = req.userId;
    const userRole = req.userRole;

    if (String(userId) !== String(studentId) && !['teacher', 'admin'].includes(userRole)) {
      return res.status(403).json({ message: 'Unauthorized access to badges' });
    }

    const badges = await badgeService.getBadgesForStudentCourse(studentId, courseId);

    res.status(200).json({
      success: true,
      studentId,
      courseId,
      badges,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get badge definitions (for UI display)
 * GET /api/badges/definitions
 */
exports.getBadgeDefinitions = async (req, res) => {
  try {
    const badgeDefinitions = require('../config/badgeDefinitions');
    const definitions = badgeDefinitions.getAllBadges();

    res.status(200).json({
      success: true,
      badges: definitions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get a specific badge definition
 * GET /api/badges/definitions/:badgeId
 */
exports.getBadgeDefinition = async (req, res) => {
  try {
    const { badgeId } = req.params;
    const badgeDefinitions = require('../config/badgeDefinitions');
    const definition = badgeDefinitions.getBadgeById(badgeId);

    if (!definition) {
      return res.status(404).json({ message: 'Badge definition not found' });
    }

    res.status(200).json({
      success: true,
      badge: definition,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
