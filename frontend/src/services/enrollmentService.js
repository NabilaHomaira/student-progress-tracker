// services/enrollmentService.js
// Requirement 2, Feature 2: Enrollment Management Service

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Request enrollment in a course
export const requestEnrollment = async (courseId, message, token) => {
  const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/request-enrollment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to request enrollment');
  }

  return await response.json();
};

// Enroll directly in a course (auto-approve)
export const enrollInCourse = async (courseId, token) => {
  const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/enroll`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to enroll in course');
  }

  return await response.json();
};

// Get enrollment status for a course
export const getEnrollmentStatus = async (courseId, token) => {
  const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/enrollment-status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to get enrollment status');
  }

  return await response.json();
};

// Get all enrollment requests for logged-in student
export const getMyEnrollmentRequests = async (token) => {
  const response = await fetch(`${API_BASE_URL}/api/students/my-enrollment-requests`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to get enrollment requests');
  }

  return await response.json();
};

// Cancel enrollment request
export const cancelEnrollmentRequest = async (requestId, token) => {
  const response = await fetch(`${API_BASE_URL}/api/enrollment-requests/${requestId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to cancel enrollment request');
  }

  return await response.json();
};

// Get all pending enrollment requests for a course (instructor/assistant)
export const getCourseEnrollmentRequests = async (courseId, token) => {
  const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/enrollment-requests`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to get course enrollment requests');
  }

  return await response.json();
};

// Approve enrollment request (instructor/assistant)
export const approveEnrollmentRequest = async (requestId, token) => {
  const response = await fetch(`${API_BASE_URL}/api/enrollment-requests/${requestId}/approve`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to approve enrollment request');
  }

  return await response.json();
};

// Reject enrollment request (instructor/assistant)
export const rejectEnrollmentRequest = async (requestId, rejectionReason, token) => {
  const response = await fetch(`${API_BASE_URL}/api/enrollment-requests/${requestId}/reject`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ rejectionReason }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to reject enrollment request');
  }

  return await response.json();
};

// Requirement 2, Feature 4: Enrollment History

// Get enrollment history for student
export const getEnrollmentHistory = async (token) => {
  const response = await fetch(`${API_BASE_URL}/api/enrollment/students/enrollment-history`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to get enrollment history');
  }

  return await response.json();
};

// Unenroll from a course
export const unenrollFromCourse = async (courseId, reason, token) => {
  const response = await fetch(`${API_BASE_URL}/api/enrollment/courses/${courseId}/unenroll`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to unenroll from course');
  }

  return await response.json();
};

// Mark course as completed
export const markCourseAsCompleted = async (courseId, token) => {
  const response = await fetch(`${API_BASE_URL}/api/enrollment/courses/${courseId}/mark-completed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to mark course as completed');
  }

  return await response.json();
};

