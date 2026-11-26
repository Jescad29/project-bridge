import { useState } from "react";
import { FolderPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useProjectsStore } from "../hooks/useProjectsStore";

const STATUS_LABELS = {
  draft: "Borrador (draft)",
  active: "Activo (active)",
  completed: "Completado (completed)",
};

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

  function handleStatusChange(value) {
    if (!value) return;
    setForm((prev) => ({ ...prev, status: value }));
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
      toast.success(`Proyecto "${trimmedName}" creado correctamente.`);
    } else {
      setLocalError(result.error);
      toast.error(result.error || "No se pudo crear el proyecto.");
    }
  }

  return (
    <Card className="border-zinc-200/80 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-zinc-50">
              <FolderPlus className="h-4 w-4" />
            </div>
            <CardTitle className="text-base font-semibold">
              Nuevo proyecto
            </CardTitle>
          </div>
          <span className="font-mono text-[11px] text-zinc-400">
            POST /projects/
          </span>
        </div>
        <CardDescription>
          Registra un proyecto en PostgreSQL a través de la API v1.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {localError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
              {localError}
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="project-name">Nombre *</Label>
              <span className="text-[11px] text-zinc-400">
                {form.name.length}/120
              </span>
            </div>
            <Input
              id="project-name"
              name="name"
              type="text"
              maxLength={120}
              value={form.name}
              onChange={handleChange}
              placeholder="Ej. Catálogo Técnico y Cotizador"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="project-description">Descripción</Label>
            <Textarea
              id="project-description"
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              placeholder="Describe brevemente el alcance del proyecto..."
              className="resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="project-status">Estado inicial</Label>
            <Select value={form.status} onValueChange={handleStatusChange}>
              <SelectTrigger id="project-status" className="w-full">
                <SelectValue>
                  {STATUS_LABELS[form.status] || "Selecciona un estado"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Borrador (draft)</SelectItem>
                <SelectItem value="active">Activo (active)</SelectItem>
                <SelectItem value="completed">Completado (completed)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Crear proyecto"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}