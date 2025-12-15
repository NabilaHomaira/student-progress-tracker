
const BASE_URL = 'http://localhost:5000/api/stats';

// Enrollment stats
export async function getEnrollmentStats() {
  const res = await fetch(`${BASE_URL}/enrollment`);
  if (!res.ok) throw new Error('Failed to fetch enrollment stats');
  return res.json();
}

// Submission stats
export async function getSubmissionStats(courseId) {
  const res = await fetch(`${BASE_URL}/submissions/${courseId}`);
  if (!res.ok) throw new Error('Failed to fetch submission stats');
  return res.json();
}

// Trend analysis
export async function getTrendAnalysis(studentId) {
  const res = await fetch(`${BASE_URL}/trends/${studentId}`);
  if (!res.ok) throw new Error('Failed to fetch trend analysis');
  return res.json();
}

// Student progress
export async function getStudentProgress(studentId) {
  const res = await fetch(`${BASE_URL}/progress/${studentId}`);
  if (!res.ok) throw new Error('Failed to fetch student progress');
  return res.json();
}