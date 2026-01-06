import api from "./api";

// Feature 3
export const getEnrollmentStats = async () => {
  const res = await api.get("/stats/enrollment");
  return res.data; // { totalStudents, totalEnrollments, averagePerformance }
};

// Feature 4
export const getSubmissionStats = async (courseId) => {
  const res = await api.get(`/stats/submissions/${courseId}`);
  return res.data; // { course, submitted, pending, overdue }
};

// Feature 3 (trend)
export const getTrendAnalysis = async (studentId) => {
  const res = await api.get(`/stats/trends/${studentId}`);
  return res.data; // { studentSeries, classSeries }
};

// Feature 1 (student progress)
export const getStudentProgress = async (studentId) => {
  const res = await api.get(`/stats/progress/${studentId}`);
  return res.data; // { studentName, points }
};
