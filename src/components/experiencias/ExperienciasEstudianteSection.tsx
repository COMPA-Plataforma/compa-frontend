import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format, isAfter, isBefore, startOfDay } from "date-fns";
import { Loader2, Lock, MessageSquareText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateField } from "@/components/dialogs/ActivityFields";
import { experienciaConsultaService } from "@/services/experienciaConsultaService";
import { formatFecha } from "@/lib/dates";
import type { Experiencia } from "@/types";

type Resultado =
  | { status: "ok"; data: Experiencia[] }
  | { status: "forbidden"; message: string };

const MENSAJE_403 = "Solo el psicoorientador asignado puede ver las experiencias de este estudiante.";
const TODAS = "todas";

// Pide las experiencias al backend; un 403 se convierte en resultado para mostrarlo en pantalla
async function cargar(estudianteId: number, filtro: { desde?: string; hasta?: string; actividadId?: number }): Promise<Resultado> {
  try {
    return { status: "ok", data: await experienciaConsultaService.list(estudianteId, filtro) };
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 403) {
      const msg = e.response.data?.message || e.response.data?.error;
      return { status: "forbidden", message: msg && msg !== "Forbidden" ? msg : MENSAJE_403 };
    }
    throw e;
  }
}

// Experiencias que el estudiante reportó sobre las actividades de su plan, de la más reciente
// a la más antigua, con filtro por rango de fechas y por actividad
export function ExperienciasEstudianteSection({ estudianteId }: { estudianteId: number }) {
  const [desde, setDesde] = useState<Date | undefined>();
  const [hasta, setHasta] = useState<Date | undefined>();
  const [actividad, setActividad] = useState<string>(TODAS);

  const hayFiltros = !!desde || !!hasta || actividad !== TODAS;

  // Todas las experiencias: sirven para la lista sin filtros y para armar las opciones de actividad
  const todas = useQuery<Resultado>({
    queryKey: ["experiencias-estudiante", estudianteId, "todas"],
    queryFn: () => cargar(estudianteId, {}),
    enabled: !isNaN(estudianteId),
    retry: false,
  });

  const filtradas = useQuery<Resultado>({
    queryKey: [
      "experiencias-estudiante", estudianteId, "filtradas",
      desde ? format(desde, "yyyy-MM-dd") : null,
      hasta ? format(hasta, "yyyy-MM-dd") : null,
      actividad,
    ],
    queryFn: () =>
      cargar(estudianteId, {
        desde: desde ? format(desde, "yyyy-MM-dd") : undefined,
        hasta: hasta ? format(hasta, "yyyy-MM-dd") : undefined,
        actividadId: actividad !== TODAS ? Number(actividad) : undefined,
      }),
    enabled: !isNaN(estudianteId) && hayFiltros,
    retry: false,
  });

  const opciones = useMemo(() => {
    const mapa = new Map<number, string>();
    if (todas.data?.status === "ok") {
      todas.data.data.forEach((e) => mapa.set(e.actividadId, e.actividadNombre));
    }
    return Array.from(mapa, ([id, nombre]) => ({ id, nombre }));
  }, [todas.data]);

  const limpiar = () => {
    setDesde(undefined);
    setHasta(undefined);
    setActividad(TODAS);
  };

  const activa = hayFiltros ? filtradas : todas;

  if (todas.isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (todas.data?.status === "forbidden") {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center gap-3 text-muted-foreground">
          <Lock className="h-5 w-5 shrink-0" />
          <p>{todas.data.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (todas.isError) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          No pudimos cargar las experiencias. Intenta de nuevo en un momento.
        </CardContent>
      </Card>
    );
  }

  const hayExperiencias = todas.data?.status === "ok" && todas.data.data.length > 0;
  const lista = activa.data?.status === "ok" ? activa.data.data : [];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Lo que el estudiante contó sobre las actividades de su plan, de la más reciente a la más antigua.
      </p>

      {hayExperiencias && (
        <Card>
          <CardContent className="pt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Desde</Label>
              <DateField
                value={desde}
                onChange={setDesde}
                placeholder="Sin límite"
                disabled={(d) => !!hasta && isAfter(startOfDay(d), startOfDay(hasta))}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Hasta</Label>
              <DateField
                value={hasta}
                onChange={setHasta}
                placeholder="Sin límite"
                disabled={(d) => !!desde && isBefore(startOfDay(d), startOfDay(desde))}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Actividad</Label>
              <Select value={actividad} onValueChange={setActividad}>
                <SelectTrigger aria-label="Actividad">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TODAS}>Todas las actividades</SelectItem>
                  {opciones.map((o) => (
                    <SelectItem key={o.id} value={String(o.id)}>{o.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={limpiar} disabled={!hayFiltros}>
              Limpiar filtros
            </Button>
          </CardContent>
        </Card>
      )}

      {activa.isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : !hayExperiencias ? (
        <Card>
          <CardContent className="py-10 text-center space-y-2">
            <MessageSquareText className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              Este estudiante aún no ha reportado experiencias.
            </p>
          </CardContent>
        </Card>
      ) : lista.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No hay experiencias que coincidan con los filtros.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {lista.length} {lista.length === 1 ? "experiencia" : "experiencias"}
          </p>
          {lista.map((e) => (
            <Card key={e.id}>
              <CardContent className="py-4 space-y-1.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className="text-sm font-medium text-foreground">{e.actividadNombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFecha(e.fecha)}
                    {e.updatedAt && " · corregida"}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{e.texto}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}