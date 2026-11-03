import { useQuery } from "@tanstack/react-query";
import { Clock, Route } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { derivacionService, type DerivacionEstudiante, type EstadoDerivacion } from "@/services/derivacionService";
import { ESTADO_DERIVACION_BADGE, FRASE_ESTADO_DERIVACION } from "@/lib/derivaciones";
import { formatFecha } from "@/lib/dates";
import { cn } from "@/lib/utils";

function EstadoBadge({ estado, etiqueta }: { estado: EstadoDerivacion; etiqueta: string }) {
  return (
    <Badge variant="outline" className={ESTADO_DERIVACION_BADGE[estado]}>
      {etiqueta}
    </Badge>
  );
}

function DerivacionCard({ derivacion }: { derivacion: DerivacionEstudiante }) {
  const dias = derivacion.diasTranscurridos;

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-semibold break-words">{derivacion.destinoNombre}</h2>
            <p className="text-sm text-muted-foreground">Derivado el {formatFecha(derivacion.fecha)}</p>
          </div>
          <div className="flex flex-col items-start gap-1.5 sm:items-end">
            <EstadoBadge estado={derivacion.estado} etiqueta={derivacion.estadoEtiqueta} />
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {dias} {dias === 1 ? "día" : "días"} desde la derivación
            </p>
          </div>
        </div>

        <p className="text-sm">{FRASE_ESTADO_DERIVACION[derivacion.estado]}</p>

        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-medium text-muted-foreground">Novedades</h3>

          {derivacion.novedades.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no hay novedades en este proceso.</p>
          ) : (
            // El backend las envía en orden cronológico: la última define el estado actual
            <ol className="ml-1.5">
              {derivacion.novedades.map((n, i) => {
                const esActual = i === derivacion.novedades.length - 1;
                return (
                  <li key={i} className="relative border-l pb-5 pl-5 last:border-transparent last:pb-0">
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
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function DerivacionesSkeleton() {
  return (
    <div className="grid gap-4" aria-busy="true" aria-label="Cargando tus derivaciones">
      {[0, 1].map((i) => (
        <Card key={i}>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Consulta de solo lectura: en qué va cada derivación del estudiante
export default function EstudianteDerivacionesPage() {
  const { data: derivaciones = [], isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["mis-derivaciones"],
    queryFn: derivacionService.listarMisDerivaciones,
    retry: false,
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Mis derivaciones</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Aquí puedes ver en qué va el proceso de atención al que te remitió tu psicoorientador.
        </p>
      </div>

      {isLoading ? (
        <DerivacionesSkeleton />
      ) : isError ? (
        <Card>
          <CardContent className="p-5 py-10 text-center space-y-3">
            <p className="text-sm text-muted-foreground">No pudimos cargar tus derivaciones.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      ) : derivaciones.length === 0 ? (
        <Card>
          <CardContent className="p-5 py-12 flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Route className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 className="font-semibold">No tienes derivaciones</h2>
              <p className="text-sm text-muted-foreground">
                Si tu psicoorientador te remite a una ruta de atención, aquí podrás seguir el proceso.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {derivaciones.map((d) => (
            <DerivacionCard key={d.id} derivacion={d} />
          ))}
        </div>
      )}
    </div>
  );
}
