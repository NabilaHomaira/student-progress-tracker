// routes/assistantRoutes.js
// Feature 4: Course Assistant Management Routes
// This file contains all assistant-related routes

const express = require('express');
const router = express.Router();
const assistantController = require('../controllers/assistantController');
const auth = require('../middleware/auth');
const { checkInstructor } = require('../middleware/coursePermission');

// Get all assistants for a course
router.get('/courses/:id/assistants', auth, checkInstructor, assistantController.getCourseAssistants);

// Assign assistant to a course
router.post('/courses/:id/assistants', auth, checkInstructor, assistantController.assignAssistant);

// Remove assistant from a course
router.delete('/courses/:id/assistants/:assistantId', auth, checkInstructor, assistantController.removeAssistant);

// Update assistant permissions
router.patch('/courses/:id/assistants/:assistantId/permissions', auth, checkInstructor, assistantController.updateAssistantPermissions);

module.exports = router;

