// services/assignmentService.js
// Assignment management API calls

import api from './api';

// Create a new assignment
export const createAssignment = async (assignmentData) => {
  const response = await api.post('/assignments', assignmentData);
  return response;
};

// Get all assignments for a course
export const getAssignmentsByCourse = async (courseId) => {
  const response = await api.get(`/assignments/course/${courseId}`);
  return response;
};

// Get assignment by ID
export const getAssignmentById = async (assignmentId) => {
  const response = await api.get(`/assignments/${assignmentId}`);
  return response;
};

// Update assignment
export const updateAssignment = async (assignmentId, updateData) => {
  const response = await api.put(`/assignments/${assignmentId}`, updateData);
  return response;
};

// Delete assignment
export const deleteAssignment = async (assignmentId) => {
  const response = await api.delete(`/assignments/${assignmentId}`);
  return response;
};

// Requirement 3, Feature 2: Duplicate assignment to multiple courses
export const duplicateAssignment = async (assignmentId, targetCourseIds, adjustDueDate) => {
  const response = await api.post(`/assignments/${assignmentId}/duplicate`, {
    targetCourseIds,
    adjustDueDate,
  });
  return response;
};

// Get duplication stats for an assignment
export const getAssignmentDuplicationStats = async (assignmentId) => {
  const response = await api.get(`/assignments/${assignmentId}/duplication-stats`);
  return response;
};

// Feature 5.2: Get upcoming deadlines with urgency indicators
export const getUpcomingDeadlines = async (token) => {
  // Use token if provided, otherwise api interceptor will handle it
  const config = token ? {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  } : {};
  const response = await api.get('/assignments/deadlines/upcoming', config);
  return response.data;
};
