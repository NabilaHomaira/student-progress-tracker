import { api } from "./api";

export const getAllCourses = () => api.get("/api/courses");

export const getCourseById = (id) =>
  api.get(`/api/courses/${id}`);

export const createCourse = (payload) =>
  api.post("/api/courses", payload);

export const updateCourse = (id, payload) =>
  api.put(`/api/courses/${id}`, payload);

export const archiveCourse = (id) =>
  api.patch(`/api/courses/${id}/archive`);

export const unarchiveCourse = (id) =>
  api.patch(`/api/courses/${id}/unarchive`);
