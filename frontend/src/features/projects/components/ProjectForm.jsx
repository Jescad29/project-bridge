import { useState } from "react";
import { useProjectsStore } from "../hooks/useProjectsStore";

const INITIAL_FORM = {
  name: "",
  description: "",
  status: "draft",
};

export function ProjectForm() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [localError, setLocalError] = useState(null);

  const addProject = useProjectsStore((state) => state.addProject);
  const submitting = useProjectsStore((state) => state.submitting);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLocalError(null);

    const trimmedName = form.name.trim();
    if (!trimmedName) {
      setLocalError("El nombre del proyecto es obligatorio.");
      return;
    }

    if (trimmedName.length > 120) {
      setLocalError("El nombre no puede superar los 120 caracteres.");
      return;
    }

    const payload = {
      name: trimmedName,
      description: form.description.trim() || null,
      status: form.status,
    };

    const result = await addProject(payload);
    if (result.ok) {
      setForm(INITIAL_FORM);
    } else {
      setLocalError(result.error);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">
          Nuevo proyecto
        </h2>
        <span className="text-xs text-slate-400">POST /api/v1/projects/</span>
      </div>

      {localError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-700">
          {localError}
        </div>
      )}

      <div>
        <label
          htmlFor="project-name"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Nombre *
        </label>
        <input
          id="project-name"
          name="name"
          type="text"
          maxLength={120}
          value={form.name}
          onChange={handleChange}
          placeholder="Ej. Catálogo Técnico y Cotizador"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      <div>
        <label
          htmlFor="project-description"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Descripción
        </label>
        <textarea
          id="project-description"
          name="description"
          rows={3}
          value={form.description}
          onChange={handleChange}
          placeholder="Describe brevemente el alcance del proyecto..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      <div>
        <label
          htmlFor="project-status"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Estado
        </label>
        <select
          id="project-status"
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="draft">Borrador (draft)</option>
          <option value="active">Activo (active)</option>
          <option value="completed">Completado (completed)</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-sky-600 hover:bg-sky-700 disabled:bg-sky-300 text-white font-medium text-sm py-2.5 px-4 transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        {submitting ? "Guardando..." : "Crear proyecto"}
      </button>
    </form>
  );
}