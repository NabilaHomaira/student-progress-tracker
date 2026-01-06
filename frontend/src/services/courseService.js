import api from "./api";

export const getAllCourses = () => api.get("/courses");

export const getCourseById = (id) =>
  api.get(`/courses/${id}`);

export const createCourse = (payload) =>
  api.post("/courses", payload);

export const updateCourse = (id, payload) =>
  api.put(`/courses/${id}`, payload);

export const archiveCourse = (id) =>
  api.patch(`/courses/${id}/archive`);

export const unarchiveCourse = (id) =>
  api.patch(`/courses/${id}/unarchive`);
