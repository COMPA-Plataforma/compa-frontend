import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarRange, ClipboardList, Sparkles } from "lucide-react";
import { parseFecha } from "@/lib/dates";
import { cn } from "@/lib/utils";
import {
  estudianteMeService,
  type ActividadProgreso,
} from "@/services/estudianteMeService";

interface Filtro {
  from?: string;
  to?: string;
}

// Colores por estado. Sin rojo: COMPA acompaña, no califica.
const ESTADOS = {
  completed: {
    label: "Cumplidas",
    bar: "bg-emerald-500 dark:bg-emerald-400",
    text: "text-emerald-700 dark:text-emerald-400",
    chip: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-950",
  },
  notCompleted: {
    label: "No cumplidas",
    bar: "bg-amber-300 dark:bg-amber-500/70",
    text: "text-amber-700 dark:text-amber-400",
    chip: "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-950",
  },
  pending: {
    label: "Pendientes",
    bar: "bg-muted-foreground/30",
    text: "text-muted-foreground",
    chip: "bg-muted text-muted-foreground hover:bg-muted",
  },
} as const;

// "Del 13 de octubre al 20 de octubre de 2026" (repite el año solo si cambia).
const formatPeriodo = (from: string, to: string) => {
  const desde = parseFecha(from);
  const hasta = parseFecha(to);
  const mismoAnio = desde.getFullYear() === hasta.getFullYear();
  const patronDesde = mismoAnio ? "d 'de' MMMM" : "d 'de' MMMM 'de' yyyy";
  return `Del ${format(desde, patronDesde, { locale: es })} al ${format(hasta, "d 'de' MMMM 'de' yyyy", { locale: es })}`;
};

const fraseAnimo = (percentage: number) => {
  if (percentage >= 80) return "Vas muy bien, sigue así.";
  if (percentage >= 50) return "Vas avanzando, cada paso cuenta.";
  return "Puedes retomarlo, estás a tiempo.";
};

// Barra apilada: cumplidas, no cumplidas y pendientes en proporción a lo programado.
function BarraEstados({ actividad }: { actividad: Pick<ActividadProgreso, "scheduled" | "completed" | "notCompleted" | "pending"> }) {
  const total = actividad.scheduled;
  const ancho = (n: number) => (total > 0 ? `${(n / total) * 100}%` : "0%");
  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full bg-secondary">
      <div className={ESTADOS.completed.bar} style={{ width: ancho(actividad.completed) }} />
      <div className={ESTADOS.notCompleted.bar} style={{ width: ancho(actividad.notCompleted) }} />
      <div className={ESTADOS.pending.bar} style={{ width: ancho(actividad.pending) }} />
    </div>
  );
}

function ProgressSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-44 w-full rounded-lg" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}

export default function EstudianteProgressReportPage() {
  const [desdeInput, setDesdeInput] = useState("");
  const [hastaInput, setHastaInput] = useState("");
  const [filtro, setFiltro] = useState<Filtro>({});
  const [errorFiltro, setErrorFiltro] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["me-progress", filtro.from ?? null, filtro.to ?? null],
    queryFn: () => estudianteMeService.getProgress(filtro.from, filtro.to),
    retry: false,
  });

  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  const mensajeBackend = axios.isAxiosError(error)
    ? (error.response?.data as { error?: string } | undefined)?.error
    : undefined;

  const aplicar = () => {
    if (desdeInput && hastaInput && desdeInput > hastaInput) {
      setErrorFiltro("La fecha Desde no puede ser posterior a la fecha Hasta.");
      return;
    }
    setErrorFiltro(null);
    setFiltro({ from: desdeInput || undefined, to: hastaInput || undefined });
  };

  const limpiar = () => {
    setDesdeInput("");
    setHastaInput("");
    setErrorFiltro(null);
    setFiltro({});
  };

  const encabezado = (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Mi progreso</h1>
      {data && <p className="text-sm text-muted-foreground mt-0.5">{data.planName}</p>}
    </div>
  );

  if (isError && status === 404) {
    return (
      <div className="space-y-4">
        {encabezado}
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              Aún no tienes un plan de acompañamiento activo.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {encabezado}

      {/* Filtro de fechas */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="progreso-desde">Desde</Label>
              <Input
                id="progreso-desde"
                type="date"
                value={desdeInput}
                onChange={(e) => setDesdeInput(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="progreso-hasta">Hasta</Label>
              <Input
                id="progreso-hasta"
                type="date"
                value={hastaInput}
                onChange={(e) => setHastaInput(e.target.value)}
              />
            </div>
          </div>
          {errorFiltro && <p className="text-sm text-destructive">{errorFiltro}</p>}
          <div className="flex gap-2">
            <Button onClick={aplicar} className="flex-1">Aplicar</Button>
            <Button variant="outline" onClick={limpiar} className="flex-1">Limpiar</Button>
          </div>
          {data && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarRange className="h-3.5 w-3.5" />
              {formatPeriodo(data.from, data.to)}
            </p>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <ProgressSkeleton />
      ) : isError ? (
        <Card>
          <CardContent className="py-8 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              {status === 400 && mensajeBackend
                ? mensajeBackend
                : "No pudimos cargar tu progreso."}
            </p>
            {status !== 400 && (
              <Button variant="outline" onClick={() => refetch()}>Reintentar</Button>
            )}
          </CardContent>
        </Card>
      ) : data ? (
        <>
          {/* Aún sin registros */}
          {!data.hasReports && (
            <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40">
              <CardContent className="py-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Aún no has informado ninguna actividad
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Cuando hagas tu check-in diario, aquí verás cómo vas.
                    </p>
                  </div>
                </div>
                <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                  <Link to="/estudiante/check-in">Ir al Check-in</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Resumen */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Cumplimiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.percentage === null ? (
                <p className="text-sm text-muted-foreground">
                  No hay actividades programadas en este periodo.
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-4xl font-bold tracking-tight">
                    {Math.round(data.percentage)}%
                  </p>
                  <Progress value={data.percentage} className="h-3" />
                  {data.hasReports && (
                    <p className="text-sm text-muted-foreground">{fraseAnimo(data.percentage)}</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 text-center">
                {(["completed", "notCompleted", "pending"] as const).map((key) => (
                  <div key={key} className="rounded-lg bg-muted/50 py-3">
                    <p className={cn("text-2xl font-semibold", ESTADOS[key].text)}>{data[key]}</p>
                    <p className="text-xs text-muted-foreground">{ESTADOS[key].label}</p>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">
                {data.scheduled} {data.scheduled === 1 ? "actividad programada" : "actividades programadas"} en el periodo
              </p>
            </CardContent>
          </Card>

          {/* Por actividad */}
          {data.activities.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tus actividades</CardTitle>
              </CardHeader>
              <CardContent className="divide-y">
                {data.activities.map((actividad) => (
                  <div key={actividad.taskId} className="py-3 first:pt-0 last:pb-0 space-y-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{actividad.name}</p>
                      {actividad.frequency && (
                        <p className="text-xs text-muted-foreground">{actividad.frequency}</p>
                      )}
                    </div>
                    <BarraEstados actividad={actividad} />
                    <div className="flex flex-wrap gap-1.5">
                      {(["completed", "notCompleted", "pending"] as const).map((key) => (
                        <Badge key={key} variant="secondary" className={cn("font-normal", ESTADOS[key].chip)}>
                          {actividad[key]} {ESTADOS[key].label.toLowerCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
}
