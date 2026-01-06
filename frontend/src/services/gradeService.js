import api from './api';

/**
 * Grade Service
 * Handles all grade-related API calls
 */

/**
 * Submit a grade for a student's assignment
 * @param {string} assignmentId - Assignment ID
 * @param {string} studentId - Student ID
 * @param {number} score - Grade score
 * @returns {Promise} Response from server
 */
export const submitGrade = async (assignmentId, studentId, score) => {
  try {
    const response = await api.post(`/grades/${assignmentId}/grade`, {
      studentId,
      score,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to submit grade' };
  }
};

/**
 * Get grades for a specific assignment
 * @param {string} assignmentId - Assignment ID
 * @returns {Promise} Array of grade records
 */
export const getAssignmentGrades = async (assignmentId) => {
  try {
    const response = await api.get(`/grades/${assignmentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch grades' };
  }
};

/**
 * Get grades for a student in a course
 * @param {string} studentId - Student ID
 * @param {string} courseId - Course ID
 * @returns {Promise} Array of grades for the student in the course
 */
export const getStudentGradesByCourse = async (studentId, courseId) => {
  try {
    const response = await api.get(`/grades/student/${studentId}/course/${courseId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch student grades' };
  }
};

/**
 * Get all grades for a course
 * @param {string} courseId - Course ID
 * @returns {Promise} Array of all grades in the course
 */
export const getCourseGrades = async (courseId) => {
  try {
    const response = await api.get(`/grades/course/${courseId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch course grades' };
  }
};

/**
 * Update a student's grade
 * @param {string} assignmentId - Assignment ID
 * @param {string} studentId - Student ID
 * @param {number} newScore - Updated score
 * @returns {Promise} Response from server
 */
export const updateGrade = async (assignmentId, studentId, newScore) => {
  try {
    const response = await api.put(`/grades/${assignmentId}/${studentId}`, {
      score: newScore,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update grade' };
  }
};

/**
 * Validate if a score exceeds the assignment's maximum score
 * @param {number} score - Score to validate
 * @param {number} maxScore - Maximum allowed score
 * @returns {Object} Validation result { valid: boolean, message: string }
 */
export const validateScore = (score, maxScore) => {
  const numScore = parseFloat(score);
  const numMax = parseFloat(maxScore);

  if (isNaN(numScore)) {
    return { valid: false, message: 'Score must be a valid number' };
  }

  if (numScore < 0) {
    return { valid: false, message: 'Score cannot be negative' };
  }

  if (numScore > numMax) {
    return {
      valid: false,
      message: `Score cannot exceed maximum of ${numMax}`,
    };
  }

  return { valid: true, message: 'Score is valid' };
};

/**
 * Add feedback to an assignment submission
 * @param {string} assignmentId - Assignment ID
 * @param {string} studentId - Student ID
 * @param {string} feedback - Feedback text
 * @returns {Promise} Response from server
 */
export const addFeedback = async (assignmentId, studentId, feedback) => {
  try {
    const response = await api.post(`/grades/${assignmentId}/feedback`, {
      studentId,
      feedback,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add feedback' };
  }
};

/**
 * Add learning tips to an assignment submission
 * @param {string} submissionId - Submission ID
 * @param {string} learningTips - Learning tips text
 * @returns {Promise} Response from server
 */
export const addLearningTips = async (submissionId, learningTips) => {
  try {
    const response = await api.put(`/submissions/${submissionId}/tips`, {
      learningTips,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add learning tips' };
  }
};

/**
 * Get submission details including feedback and tips
 * @param {string} submissionId - Submission ID
 * @returns {Promise} Submission data
 */
export const getSubmissionDetails = async (submissionId) => {
  try {
    const response = await api.get(`/submissions/${submissionId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch submission details' };
  }
};

/**
 * Get all submissions for an assignment
 * @param {string} assignmentId - Assignment ID
 * @returns {Promise} Array of submissions
 */
export const getAssignmentSubmissions = async (assignmentId) => {
  try {
    const response = await api.get(`/submissions/assignment/${assignmentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch submissions' };
  }
};

/**
 * Get all submissions for a student
 * @param {string} studentId - Student ID
 * @returns {Promise} Array of submissions
 */
export const getStudentSubmissions = async (studentId) => {
  try {
    const response = await api.get(`/submissions/student/${studentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch student submissions' };
  }
};
