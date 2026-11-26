import { Layers, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ModulePlaceholder({
  title,
  description,
  endpoint,
  phase = "Próximo módulo",
}) {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <Card className="border-zinc-200/80 shadow-xs">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs font-medium">
              {phase}
            </Badge>
            <span className="font-mono text-xs text-zinc-400">{endpoint}</span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900">
            {title}
          </CardTitle>
          <CardDescription className="text-sm text-zinc-500">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t border-zinc-100">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Layers className="h-4 w-4 text-zinc-400" />
            <span>Arquitectura lista en backend y cliente HTTP desacoplado.</span>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link to="/projects" className="inline-flex items-center gap-1.5">
              <span>Ir a Proyectos</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}