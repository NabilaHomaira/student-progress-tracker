import { api } from "./api";

export const getEnrollmentHistory = () =>
  api.get("/api/enrollments/students/enrollment-history");

export const unenrollFromCourse = (courseId) =>
  api.post('/api/enrollments/courses/${courseId}/unenroll');

export const markCourseCompleted = (courseId) =>
  api.post('/api/enrollments/courses/${courseId}/mark-completed');
