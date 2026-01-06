
// import { api } from "./api";

// // Req 1 – Feature 3
// export const getEnrollmentStats = async () => {
//   const res = await api.get("/api/stats/enrollment");
//   return res.data; // { totalStudents, totalEnrollments, averagePerformance }
// };

// // Req 3 – Feature 4
// export const getSubmissionStats = async (courseId) => {
//   const res = await api.get('/api/stats/submissions/${courseId}');
//   return res.data; // { course, submitted, pending, overdue }
// };

// // Req 4 – Feature 3
// export const getTrendAnalysis = async (studentId) => {
//   const res = await api.get('/api/stats/trends/${studentId}');
//   return res.data; // { studentSeries, classSeries }
// };

// // Req 5 – Feature 1
// export const getStudentProgress = async (studentId) => {
//   const res = await api.get('/api/stats/progress/${studentId}');
//   return res.data; // { studentName, points }
// };



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