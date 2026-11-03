import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Clock, Lock, Plus, Route } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { NovedadDerivacionDialog } from "@/components/derivaciones/NovedadDerivacionDialog";
import { derivacionService, type DerivacionHistorial, type EstadoDerivacion } from "@/services/derivacionService";
import { ESTADO_DERIVACION_BADGE } from "@/lib/derivaciones";
import { formatFecha } from "@/lib/dates";
import { cn } from "@/lib/utils";

type Resultado =
  | { status: "ok"; data: DerivacionHistorial[] }
  | { status: "forbidden"; message: string };

const MENSAJE_403 = "Solo el psicoorientador asignado puede consultar las derivaciones de este estudiante.";

function EstadoBadge({ estado, etiqueta }: { estado: EstadoDerivacion; etiqueta: string }) {
  return (
    <Badge variant="outline" className={ESTADO_DERIVACION_BADGE[estado]}>
      {etiqueta}
    </Badge>
  );
}

function DerivacionCard({ derivacion }: { derivacion: DerivacionHistorial }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const dias = derivacion.diasTranscurridos;

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold break-words">{derivacion.destinoNombre}</h3>
            <p className="text-sm text-muted-foreground">
              Derivado el {formatFecha(derivacion.fecha)} · {derivacion.orientadorNombre}
            </p>
          </div>
          <div className="flex flex-col items-start gap-1.5 sm:items-end">
            <EstadoBadge estado={derivacion.estado} etiqueta={derivacion.estadoEtiqueta} />
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {dias} {dias === 1 ? "día" : "días"} desde la derivación
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <h4 className="text-sm font-medium text-muted-foreground">Motivo</h4>
          <p className="whitespace-pre-wrap break-words text-sm">{derivacion.motivo}</p>
        </div>

        <div className="space-y-4 border-t pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-medium text-muted-foreground">Novedades</h4>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => setDialogOpen(true)}
              aria-label={`Registrar novedad de la derivación a ${derivacion.destinoNombre}`}
            >
              <Plus className="h-4 w-4" aria-hidden="true" /> Registrar novedad
            </Button>
          </div>

          {derivacion.novedades.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no hay novedades registradas.</p>
          ) : (
            // El backend las envía en orden cronológico: la última define el estado actual
            <ol className="ml-1.5">
              {derivacion.novedades.map((n, i) => {
                const esActual = i === derivacion.novedades.length - 1;
                return (
                  <li key={n.id} className="relative border-l pb-5 pl-5 last:border-transparent last:pb-0">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute top-1.5 rounded-full",
                        esActual
                          ? "-left-[6.5px] h-3 w-3 bg-primary ring-4 ring-primary/20"
                          : "-left-[5.5px] h-2.5 w-2.5 bg-muted-foreground/40",
                      )}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{formatFecha(n.fecha)}</span>
                      <EstadoBadge estado={n.estado} etiqueta={n.estadoEtiqueta} />
                      {esActual && <span className="text-xs font-medium text-primary">Estado actual</span>}
                    </div>
                    <p className="mt-1.5 whitespace-pre-wrap break-words text-sm text-muted-foreground">
                      {n.descripcion}
                    </p>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </CardContent>

      <NovedadDerivacionDialog open={dialogOpen} onOpenChange={setDialogOpen} derivacion={derivacion} />
    </Card>
  );
}

function DerivacionesSkeleton() {
  return (
    <div className="grid gap-4" aria-busy="true" aria-label="Cargando derivaciones">
      {[0, 1].map((i) => (
        <Card key={i}>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-64 max-w-full" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Derivaciones del estudiante con su línea de tiempo de novedades
export function DerivacionesSection({ estudianteId }: { estudianteId: number }) {
  const { data: resultado, isLoading, isError, isFetching, refetch } = useQuery<Resultado>({
    queryKey: ["derivaciones", estudianteId],
    queryFn: async () => {
      try {
        return { status: "ok", data: await derivacionService.listarPorEstudiante(estudianteId) };
      } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status === 403) {
          // El backend explica el motivo (otro psicoorientador o sin asignar)
          const msg = e.response.data?.message || e.response.data?.error;
          return { status: "forbidden", message: msg || MENSAJE_403 };
        }
        throw e;
      }
    },
    enabled: !isNaN(estudianteId),
    retry: false,
  });

  if (isLoading) return <DerivacionesSkeleton />;

  if (isError) {
    return (
      <Card>
        <CardContent className="p-5 text-center space-y-3">
          <p className="text-sm text-muted-foreground">No pudimos cargar las derivaciones.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (resultado?.status === "forbidden") {
    return (
      <Card>
        <CardContent className="p-5 flex items-center gap-3 text-muted-foreground">
          <Lock className="h-5 w-5 shrink-0" aria-hidden="true" />
          <p>{resultado.message}</p>
        </CardContent>
      </Card>
    );
  }

  const derivaciones = resultado?.status === "ok" ? resultado.data : [];

  if (derivaciones.length === 0) {
    return (
      <Card>
        <CardContent className="p-5 py-10 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Route className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold">Sin derivaciones</h3>
            <p className="text-sm text-muted-foreground">
              Este estudiante no tiene derivaciones registradas.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {derivaciones.map((d) => (
        <DerivacionCard key={d.id} derivacion={d} />
      ))}
    </div>
  );
}
