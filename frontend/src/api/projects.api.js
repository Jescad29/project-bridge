import apiClient from "./client";

export const projectsApi = {
  getAll: () => apiClient.get("/projects/"),
  getById: (id) => apiClient.get(`/projects/${id}`),
  create: (payload) => apiClient.post("/projects/", payload),
  update: (id, payload) => apiClient.patch(`/projects/${id}`, payload),
  remove: (projectId) => apiClient.delete(`/projects/${projectId}`),
};