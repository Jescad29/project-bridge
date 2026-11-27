import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useProjectsStore } from "../hooks/useProjectsStore";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const selectedProject = useProjectsStore((state) => state.selectedProject);
  const loading = useProjectsStore((state) => state.loading);
  const submitting = useProjectsStore((state) => state.submitting);
  const fetchProjectById = useProjectsStore((state) => state.fetchProjectById);
  const updateProject = useProjectsStore((state) => state.updateProject);
  const deleteProject = useProjectsStore((state) => state.deleteProject);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("draft");

  useEffect(() => {
    fetchProjectById(id).then((res) => {
      if (res.ok && res.data) {
        setName(res.data.name || "");
        setDescription(res.data.description || "");
        setStatus(res.data.status || "draft");
      }
    });
  }, [id, fetchProjectById]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("El nombre del proyecto es obligatorio.");
      return;
    }

    const res = await updateProject(Number(id), {
      name: name.trim(),
      description: description.trim() ? description.trim() : null,
      status,
    });

    if (res.ok) {
      toast.success("Proyecto actualizado correctamente.");
    } else {
      toast.error(res.error);
    }
  };

  const handleDelete = async () => {
    const res = await deleteProject(Number(id));
    if (res.ok) {
      toast.success("Proyecto eliminado.");
      navigate("/projects");
    } else {
      toast.error(res.error);
    }
  };

  if (loading && !selectedProject) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 text-sm text-zinc-500">
        Cargando detalle del proyecto...
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 space-y-4">
        <p className="text-sm text-zinc-600">
          No se encontró el proyecto solicitado.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link to="/projects">Volver a Proyectos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/projects" className="inline-flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            <span>Volver a Proyectos</span>
          </Link>
        </Button>

        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          className="inline-flex items-center gap-1.5"
        >
          <Trash2 className="h-4 w-4" />
          <span>Eliminar</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Proyecto #{selectedProject.id}</CardTitle>
          <CardDescription>
            Edita el nombre, descripción o estado del proyecto y guarda los cambios
            en PostgreSQL.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="detail-name">Nombre *</Label>
              <Input
                id="detail-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="detail-desc">Descripción</Label>
              <Textarea
                id="detail-desc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Borrador (draft)</SelectItem>
                  <SelectItem value="active">Activo (active)</SelectItem>
                  <SelectItem value="completed">Completado (completed)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5"
              >
                <Save className="h-4 w-4" />
                <span>{submitting ? "Guardando..." : "Guardar cambios"}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}