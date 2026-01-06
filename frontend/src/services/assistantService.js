// services/assistantService.js
// Feature 4: Course Assistant Management Service
// This file contains all assistant-related API service functions

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Get all assistants for a course
export const getCourseAssistants = async (courseId, token) => {
  const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/assistants`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch course assistants');
  }

  return await response.json();
};

// Assign assistant to a course
export const assignAssistant = async (courseId, userId, permissions, token) => {
  const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/assistants`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ userId, permissions }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to assign assistant');
  }

  return await response.json();
};

// Remove assistant from a course
export const removeAssistant = async (courseId, assistantId, token) => {
  const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/assistants/${assistantId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to remove assistant');
  }

  return await response.json();
};

// Update assistant permissions
export const updateAssistantPermissions = async (courseId, assistantId, permissions, token) => {
  const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/assistants/${assistantId}/permissions`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ permissions }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update assistant permissions');
  }

  return await response.json();
};

// Get all users (for selecting assistants)
export const getAllUsers = async (token, role = null) => {
  const url = role 
    ? `${API_BASE_URL}/api/users?role=${role}`
    : `${API_BASE_URL}/api/users`;
    
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return await response.json();
};

