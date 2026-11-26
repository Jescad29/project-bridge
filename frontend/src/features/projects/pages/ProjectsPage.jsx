import { useEffect } from "react";
import { Layers } from "lucide-react";
import { useProjectsStore } from "../hooks/useProjectsStore";
import { ProjectForm } from "../components/ProjectForm";
import { ProjectList } from "../components/ProjectList";

export function ProjectsPage() {
  const fetchProjects = useProjectsStore((state) => state.fetchProjects);
  const projects = useProjectsStore((state) => state.projects);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const activeCount = projects.filter((p) => p.status === "active").length;

  return (
    <div className="min-h-screen bg-zinc-50/70 text-zinc-900">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-xs border-b border-zinc-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-zinc-50">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  Project Bridge
                </span>
                <span className="text-[11px] text-zinc-400">•</span>
                <span className="text-[11px] text-zinc-500">
                  {activeCount} {activeCount === 1 ? "activo" : "activos"}
                </span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-900">
                Gestión de Proyectos
              </h1>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-full px-3 py-1 self-start sm:self-auto">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            API v1 conectada
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
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