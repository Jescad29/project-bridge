import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export function TasksPage() {
  return (
    <ModulePlaceholder
      title="Gestión de Tareas"
      description="Seguimiento de actividades vinculadas a proyectos, prioridades y estados de avance."
      endpoint="GET /api/v1/tasks/"
      phase="Módulo 2 • En preparación"
    />
  );
}