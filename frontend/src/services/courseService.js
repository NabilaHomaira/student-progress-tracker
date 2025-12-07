const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Archive a course
export const archiveCourse = async (courseId) => {
  const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/archive`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to archive course');
  }

  return await response.json();
};

// Unarchive a course
export const unarchiveCourse = async (courseId) => {
  const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/unarchive`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to unarchive course');
  }

  return await response.json();
};

// Get all courses
export const getCourses = async (includeArchived = false) => {
  const response = await fetch(
    `${API_BASE_URL}/api/courses?includeArchived=${includeArchived}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch courses');
  }

  return await response.json();
};

// Get course by ID
export const getCourseById = async (courseId) => {
  const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch course');
  }

  return await response.json();
};

// Create a new course
export const createCourse = async (courseData) => {
  const response = await fetch(`${API_BASE_URL}/api/courses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(courseData),
  });

  if (!response.ok) {
    throw new Error('Failed to create course');
  }

  return await response.json();
};

// Update course
export const updateCourse = async (courseId, courseData) => {
  const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(courseData),
  });

  if (!response.ok) {
    throw new Error('Failed to update course');
  }

  return await response.json();
};
