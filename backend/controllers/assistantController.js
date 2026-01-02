// controllers/assistantController.js
// Feature 4: Course Assistant Management
// This file contains all assistant-related controller functions

const Course = require('../models/Course');
const User = require('../models/User');

// Get all assistants for a course
exports.getCourseAssistants = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id)
      .populate('assistants.user', 'name email role')
      .select('assistants');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.status(200).json({
      message: 'Course assistants retrieved successfully',
      assistants: course.assistants,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving assistants', error });
  }
};

// Assign assistant to a course
exports.assignAssistant = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, permissions } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Check if course exists
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already an assistant
    const existingAssistant = course.assistants.find(
      (assistant) => assistant.user.toString() === userId
    );
    if (existingAssistant) {
      return res.status(400).json({ message: 'User is already an assistant for this course' });
    }

    // Check if user is the instructor
    if (course.instructor.toString() === userId) {
      return res.status(400).json({ message: 'Instructor cannot be assigned as assistant' });
    }

    // Default permissions
    const defaultPermissions = {
      canViewStudents: true,
      canViewGrades: false,
      canEditGrades: false,
      canManageAssignments: false,
      canViewAssignments: true,
      canManageEnrollments: false,
    };

    // Merge with provided permissions
    const assistantPermissions = { ...defaultPermissions, ...permissions };

    // Add assistant to course
    course.assistants.push({
      user: userId,
      permissions: assistantPermissions,
      assignedAt: new Date(),
    });

    await course.save();

    // Populate the newly added assistant
    await course.populate('assistants.user', 'name email role');

    const addedAssistant = course.assistants[course.assistants.length - 1];

    res.status(201).json({
      message: 'Assistant assigned successfully',
      assistant: addedAssistant,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning assistant', error });
  }
};

// Remove assistant from a course
exports.removeAssistant = async (req, res) => {
  try {
    const { id, assistantId } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Find and remove assistant
    const assistantIndex = course.assistants.findIndex(
      (assistant) => assistant._id.toString() === assistantId
    );

    if (assistantIndex === -1) {
      return res.status(404).json({ message: 'Assistant not found in this course' });
    }

    course.assistants.splice(assistantIndex, 1);
    await course.save();

    res.status(200).json({
      message: 'Assistant removed successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Error removing assistant', error });
  }
};

// Update assistant permissions
exports.updateAssistantPermissions = async (req, res) => {
  try {
    const { id, assistantId } = req.params;
    const { permissions } = req.body;

    if (!permissions) {
      return res.status(400).json({ message: 'Permissions are required' });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Find assistant
    const assistant = course.assistants.find(
      (assistant) => assistant._id.toString() === assistantId
    );

    if (!assistant) {
      return res.status(404).json({ message: 'Assistant not found in this course' });
    }

    // Update permissions
    assistant.permissions = { ...assistant.permissions, ...permissions };
    await course.save();

    await course.populate('assistants.user', 'name email role');

    const updatedAssistant = course.assistants.find(
      (assistant) => assistant._id.toString() === assistantId
    );

    res.status(200).json({
      message: 'Assistant permissions updated successfully',
      assistant: updatedAssistant,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating assistant permissions', error });
  }
};

// Helper function to populate assistants when fetching course (for Feature 4)
exports.populateAssistantsForCourse = async (course) => {
  if (!course) return course;
  
  if (Array.isArray(course)) {
    // If it's an array of courses
    return await Course.populate(course, { path: 'assistants.user', select: 'name email role' });
  } else {
    // If it's a single course
    return await course.populate('assistants.user', 'name email role');
  }
};

