const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// Create a new course
router.post('/', courseController.createCourse);

// Get all courses
router.get('/', courseController.getAllCourses);

// Get course by ID
router.get('/:id', courseController.getCourseById);

// Update course details
router.put('/:id', courseController.updateCourse);

// Archive a course
router.patch('/:id/archive', courseController.archiveCourse);

// Unarchive a course
router.patch('/:id/unarchive', courseController.unarchiveCourse);

module.exports = router;