import { useQuery } from "@tanstack/react-query";
import { MessageSquareText, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { experienciaService } from "@/services/experienciaService";
import { formatFecha } from "@/lib/dates";
import type { Experiencia } from "@/types";

interface Props {
  onNueva: () => void;
  onCorregir: (e: Experiencia) => void;
}

// Lista de las experiencias del estudiante (la más reciente primero)
export function ExperienciasSection({ onNueva, onCorregir }: Props) {
  const { data: experiencias, isLoading, isError } = useQuery({
    queryKey: ["me-experiencias"],
    queryFn: experienciaService.list,
  });

  return (
    <div className="space-y-2 no-print">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-foreground">Mis experiencias</h2>
        <Button size="sm" variant="outline" onClick={onNueva} className="gap-1">
          <Plus className="h-4 w-4" /> Contar experiencia
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-20 w-full rounded-lg" />
      ) : isError ? (
        <Card>
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            No pudimos cargar tus experiencias. Intenta de nuevo en un momento.
          </CardContent>
        </Card>
      ) : !experiencias || experiencias.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center space-y-2">
            <MessageSquareText className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              Aún no has contado ninguna experiencia. Cuéntanos cómo te fue con alguna actividad de tu plan.
            </p>
          </CardContent>
        </Card>
      ) : (
        experiencias.map((e) => (
          <Card key={e.id}>
            <CardContent className="py-4 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{e.actividadNombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFecha(e.fecha)}
                    {e.updatedAt && " · corregida"}
                  </p>
                </div>
                {e.editable && (
                  <Button size="sm" variant="ghost" onClick={() => onCorregir(e)} className="gap-1 shrink-0">
                    <Pencil className="h-3.5 w-3.5" /> Corregir
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{e.texto}</p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}