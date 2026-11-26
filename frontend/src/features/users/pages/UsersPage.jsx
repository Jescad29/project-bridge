import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export function UsersPage() {
  return (
    <ModulePlaceholder
      title="Usuarios y Roles"
      description="Control de acceso, perfiles del equipo y permisos sobre los módulos del sistema."
      endpoint="GET /api/v1/users/"
      phase="Módulo 4 • En preparación"
    />
  );
}