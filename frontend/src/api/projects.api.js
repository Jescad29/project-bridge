import apiClient from "./client";

export const projectsApi = {
  getAll: () => apiClient.get("/projects/"),
  create: (payload) => apiClient.post("/projects/", payload),
  remove: (projectId) => apiClient.delete(`/projects/${projectId}`),
};