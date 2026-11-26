import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export function ClientsPage() {
  return (
    <ModulePlaceholder
      title="Directorio de Clientes"
      description="Administración de cuentas, contactos comerciales y proyectos asociados por cliente."
      endpoint="GET /api/v1/clients/"
      phase="Módulo 3 • En preparación"
    />
  );
}