import { useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  FileEdit,
  FolderKanban,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useProjectsStore } from "../hooks/useProjectsStore";

const STATUS_META = {
  draft: {
    label: "Borrador",
    className: "bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-100",
    Icon: FileEdit,
  },
  active: {
    label: "Activo",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
    Icon: Activity,
  },
  completed: {
    label: "Completado",
    className: "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-50",
    Icon: CheckCircle2,
  },
};

const FILTER_OPTIONS = [
  { key: "all", label: "Todos" },
  { key: "active", label: "Activos" },
  { key: "draft", label: "Borradores" },
  { key: "completed", label: "Completados" },
];

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
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [targetProject, setTargetProject] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const projects = useProjectsStore((state) => state.projects);
  const loading = useProjectsStore((state) => state.loading);
  const error = useProjectsStore((state) => state.error);
  const fetchProjects = useProjectsStore((state) => state.fetchProjects);
  const deleteProject = useProjectsStore((state) => state.deleteProject);

  const filteredProjects = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesStatus =
        statusFilter === "all" || project.status === statusFilter;
      const matchesQuery =
        !query ||
        project.name?.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [projects, statusFilter, searchTerm]);

  async function handleConfirmDelete() {
    if (!targetProject) return;
    const { id, name } = targetProject;

    setDeletingId(id);
    const result = await deleteProject(id);
    setDeletingId(null);
    setTargetProject(null);

    if (result.ok) {
      toast.success(`Proyecto "${name}" eliminado.`);
    } else {
      toast.error(result.error || "No se pudo eliminar el proyecto.");
    }
  }

  return (
    <>
      <Card className="border-zinc-200/80 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-zinc-700" />
                Proyectos registrados
              </CardTitle>
              <CardDescription>
                {projects.length}{" "}
                {projects.length === 1 ? "proyecto" : "proyectos"} en base de
                datos
              </CardDescription>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchProjects}
              disabled={loading}
            >
              <RefreshCw
                className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? "Actualizando..." : "Recargar"}
            </Button>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre o descripción..."
                className="pl-8 h-8 text-xs"
              />
            </div>

            <div className="flex items-center gap-1 flex-wrap">
              {FILTER_OPTIONS.map((option) => {
                const active = statusFilter === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setStatusFilter(option.key)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      active
                        ? "bg-zinc-900 text-zinc-50"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          {loading && projects.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-500">
              Cargando proyectos desde la API...
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-200 py-10 px-4 text-center">
              <p className="text-sm font-medium text-zinc-700">
                {projects.length === 0
                  ? "Aún no hay proyectos registrados"
                  : "No hay proyectos que coincidan con el filtro"}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                {projects.length === 0
                  ? "Crea el primero usando el formulario de la izquierda."
                  : "Ajusta la búsqueda o cambia el filtro de estado."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProjects.map((project) => {
                const meta = STATUS_META[project.status] || {
                  label: project.status,
                  className: "bg-zinc-100 text-zinc-700 border-zinc-200",
                  Icon: FileEdit,
                };
                const StatusIcon = meta.Icon;
                const isDeleting = deletingId === project.id;

                return (
                  <article
                    key={project.id}
                    className="group rounded-xl border border-zinc-200/80 bg-zinc-50/40 hover:bg-white hover:border-zinc-300 hover:shadow-xs transition-all p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-zinc-400">
                          #{project.id}
                        </span>
                        <h3 className="text-sm font-semibold text-zinc-900 truncate">
                          {project.name}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`gap-1 font-medium ${meta.className}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {meta.label}
                        </Badge>
                      </div>

                      {project.description ? (
                        <p className="text-xs text-zinc-600 leading-relaxed">
                          {project.description}
                        </p>
                      ) : (
                        <p className="text-xs italic text-zinc-400">
                          Sin descripción
                        </p>
                      )}

                      {project.created_at && (
                        <p className="text-[11px] text-zinc-400 flex items-center gap-1 pt-0.5">
                          <Clock className="h-3 w-3" />
                          Creado: {formatDate(project.created_at)}
                        </p>
                      )}
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setTargetProject(project)}
                      disabled={isDeleting}
                      className="self-start shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      {isDeleting ? "Eliminando..." : "Eliminar"}
                    </Button>
                  </article>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={Boolean(targetProject)}
        onOpenChange={(open) => !open && setTargetProject(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar proyecto?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar{" "}
              <span className="font-semibold text-zinc-900">
                "{targetProject?.name}"
              </span>
              . Esta acción eliminará el registro de la base de datos y no se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(deletingId)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={Boolean(deletingId)}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deletingId ? "Eliminando..." : "Sí, eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}