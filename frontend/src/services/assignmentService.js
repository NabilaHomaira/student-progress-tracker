// services/assignmentService.js
// Assignment management API calls

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create a new assignment
export const createAssignment = async (assignmentData, token) => {
  const response = await fetch(`${API_BASE_URL}/api/assignments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(assignmentData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create assignment');
  }

  return await response.json();
};

// Get all assignments for a course
export const getAssignmentsByCourse = async (courseId, token) => {
  const response = await fetch(`${API_BASE_URL}/api/assignments/course/${courseId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to get assignments');
  }

  return await response.json();
};

// Get assignment by ID
export const getAssignmentById = async (assignmentId, token) => {
  const response = await fetch(`${API_BASE_URL}/api/assignments/${assignmentId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to get assignment');
  }

  return await response.json();
};

// Update assignment
export const updateAssignment = async (assignmentId, updateData, token) => {
  const response = await fetch(`${API_BASE_URL}/api/assignments/${assignmentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update assignment');
  }

  return await response.json();
};

// Delete assignment
export const deleteAssignment = async (assignmentId, token) => {
  const response = await fetch(`${API_BASE_URL}/api/assignments/${assignmentId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete assignment');
  }

  return await response.json();
};

// Requirement 3, Feature 2: Duplicate assignment to multiple courses
export const duplicateAssignment = async (assignmentId, targetCourseIds, adjustDueDate, token) => {
  const response = await fetch(`${API_BASE_URL}/api/assignments/${assignmentId}/duplicate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      targetCourseIds,
      adjustDueDate,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to duplicate assignment');
  }

  return await response.json();
};

// Get duplication stats for an assignment
export const getAssignmentDuplicationStats = async (assignmentId, token) => {
  const response = await fetch(`${API_BASE_URL}/api/assignments/${assignmentId}/duplication-stats`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to get duplication stats');
  }

  return await response.json();
};
