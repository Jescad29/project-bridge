import { useEffect } from "react";
import { useProjectsStore } from "../hooks/useProjectsStore";
import { ProjectForm } from "../components/ProjectForm";
import { ProjectList } from "../components/ProjectList";

export function ProjectsPage() {
  const fetchProjects = useProjectsStore((state) => state.fetchProjects);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-600">
              Project Bridge
            </p>
            <h1 className="text-2xl font-bold text-slate-900">
              Gestión de Proyectos
            </h1>
          </div>
          <span className="inline-flex items-center gap-2 text-xs text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-3 py-1 self-start sm:self-auto">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            API v1 conectada
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5">
            <ProjectForm />
          </div>
          <div className="lg:col-span-7">
            <ProjectList />
          </div>
        </div>
      </main>
    </div>
  );
}