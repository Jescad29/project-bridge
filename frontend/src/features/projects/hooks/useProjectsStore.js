import { create } from "zustand";
import { projectsApi } from "../../../api/projects.api";

function getErrorMessage(err, fallback) {
  return (
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message ||
    fallback
  );
}

export const useProjectsStore = create((set, get) => ({
  projects: [],
  selectedProject: null,
  loading: false,
  submitting: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const response = await projectsApi.getAll();
      const items = Array.isArray(response?.data?.items)
        ? response.data.items
        : [];
      set({ projects: items, loading: false });
    } catch (err) {
      set({
        error: getErrorMessage(err, "No se pudieron cargar los proyectos."),
        loading: false,
      });
    }
  },

  fetchProjectById: async (projectId) => {
    set({ loading: true, error: null, selectedProject: null });
    try {
      const response = await projectsApi.getById(projectId);
      set({ selectedProject: response?.data || null, loading: false });
      return { ok: true, data: response?.data };
    } catch (err) {
      const message = getErrorMessage(
        err,
        "No se pudo cargar el detalle del proyecto."
      );
      set({ error: message, loading: false });
      return { ok: false, error: message };
    }
  },

  addProject: async (payload) => {
    set({ submitting: true, error: null });
    try {
      const response = await projectsApi.create(payload);
      const created = response?.data;

      if (created && created.id !== undefined) {
        set((state) => ({
          projects: [created, ...state.projects],
          submitting: false,
        }));
      } else {
        await get().fetchProjects();
        set({ submitting: false });
      }

      return { ok: true, data: created };
    } catch (err) {
      const message = getErrorMessage(err, "No se pudo crear el proyecto.");
      set({ error: message, submitting: false });
      return { ok: false, error: message };
    }
  },

  updateProject: async (projectId, payload) => {
    set({ submitting: true, error: null });
    try {
      const response = await projectsApi.update(projectId, payload);
      const updated = response?.data;

      set((state) => ({
        projects: state.projects.map((item) =>
          item.id === projectId ? updated : item
        ),
        selectedProject:
          state.selectedProject?.id === projectId
            ? updated
            : state.selectedProject,
        submitting: false,
      }));

      return { ok: true, data: updated };
    } catch (err) {
      const message = getErrorMessage(
        err,
        "No se pudo actualizar el proyecto."
      );
      set({ error: message, submitting: false });
      return { ok: false, error: message };
    }
  },

  deleteProject: async (projectId) => {
    set({ error: null });
    try {
      await projectsApi.remove(projectId);
      set((state) => ({
        projects: state.projects.filter((item) => item.id !== projectId),
      }));
      return { ok: true };
    } catch (err) {
      const message = getErrorMessage(err, "No se pudo eliminar el proyecto.");
      set({ error: message });
      return { ok: false, error: message };
    }
  },
}));