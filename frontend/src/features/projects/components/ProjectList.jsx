import { useState } from "react";
import { useProjectsStore } from "../hooks/useProjectsStore";

const STATUS_STYLES = {
  draft: {
    label: "Borrador",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
  },
  active: {
    label: "Activo",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  completed: {
    label: "Completado",
    badge: "bg-sky-50 text-sky-700 border-sky-200",
  },
};

function formatDate(isoString) {
  if (!isoString) return "";
  try {
    return new Intl.DateTimeFormat("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

export function ProjectList() {
  const [deletingId, setDeletingId] = useState(null);

  const projects = useProjectsStore((state) => state.projects);
  const loading = useProjectsStore((state) => state.loading);
  const error = useProjectsStore((state) => state.error);
  const fetchProjects = useProjectsStore((state) => state.fetchProjects);
  const deleteProject = useProjectsStore((state) => state.deleteProject);

  async function handleDelete(projectId, projectName) {
    const confirmed = window.confirm(
      `¿Eliminar el proyecto "${projectName}"? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    setDeletingId(projectId);
    await deleteProject(projectId);
    setDeletingId(null);
  }

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Proyectos registrados
          </h2>
          <p className="text-xs text-slate-500">
            Total: {projects.length} {projects.length === 1 ? "proyecto" : "proyectos"}
          </p>
        </div>

        <button
          type="button"
          onClick={fetchProjects}
          disabled={loading}
          className="rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? "Actualizando..." : "Recargar"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && projects.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-500">
          Cargando proyectos desde la API...
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 py-10 px-4 text-center">
          <p className="text-sm font-medium text-slate-700">
            Aún no hay proyectos registrados
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Crea el primero usando el formulario de la izquierda.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-200">
          {projects.map((project) => {
            const statusInfo = STATUS_STYLES[project.status] || {
              label: project.status,
              badge: "bg-slate-100 text-slate-700 border-slate-200",
            };
            const isDeleting = deletingId === project.id;

            return (
              <li
                key={project.id}
                className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">
                      #{project.id}
                    </span>
                    <h3 className="text-base font-semibold text-slate-900 truncate">
                      {project.name}
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusInfo.badge}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  {project.description ? (
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {project.description}
                    </p>
                  ) : (
                    <p className="text-xs italic text-slate-400">
                      Sin descripción
                    </p>
                  )}

                  {project.created_at && (
                    <p className="text-xs text-slate-400">
                      Creado: {formatDate(project.created_at)}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(project.id, project.name)}
                  disabled={isDeleting}
                  className="self-start shrink-0 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 disabled:opacity-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  {isDeleting ? "Eliminando..." : "Eliminar"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}