import { useEffect, useRef, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format, isAfter, isBefore, startOfDay } from "date-fns";
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
import { BarChart3, CheckCircle2, ShieldCheck, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { DateField } from "@/components/dialogs/ActivityFields";
import { informeService, type InformeMotivos } from "@/services/informeService";
import { MOTIVOS_CONSULTA } from "@/lib/informes";
import { formatFecha } from "@/lib/dates";
import { cn } from "@/lib/utils";

const TODOS = "TODOS";

// En oscuro el primary del tema es casi blanco: las barras usan el mismo matiz un paso más claro
const chartConfig = {
  estudiantes: {
    label: "Estudiantes",
    theme: { light: "hsl(var(--primary))", dark: "hsl(199 89% 45%)" },
  },
} satisfies ChartConfig;

const ALTO_FILA = 56; // nombre del motivo encima de una barra de 20 px

const formatPorcentaje = (valor: number) =>
  `${valor.toLocaleString("es-CO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;

const hoy = () => startOfDay(new Date());

function FiltroFecha({
  id, label, value, onChange, disabled,
}: {
  id: string;
  label: string;
  value?: Date;
  onChange: (d: Date | undefined) => void;
  disabled: (d: Date) => boolean;
}) {
  return (
    <div className="space-y-2">
      <Label id={id}>{label}</Label>
      <div className="flex gap-1" role="group" aria-labelledby={id}>
        <div className="flex-1 min-w-0">
          <DateField value={value} onChange={onChange} disabled={disabled} placeholder="Sin fecha" />
        </div>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange(undefined)}
            aria-label={`Quitar fecha ${label.toLowerCase()}`}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Ancho medio de un carácter en text-xs: decide cuándo acortar un nombre que no cabe
const ANCHO_CARACTER = 6.4;

const acortar = (texto: string, maxCaracteres: number) =>
  texto.length <= maxCaracteres ? texto : `${texto.slice(0, Math.max(1, maxCaracteres - 1)).trimEnd()}…`;

function GraficoMotivos({ informe }: { informe: InformeMotivos }) {
  const datos = informe.motivos;
  const ref = useRef<HTMLElement>(null);
  const [ancho, setAncho] = useState<number | null>(null);

  // En pantallas angostas el nombre más largo no cabe: se acorta solo en el gráfico
  // (el nombre completo sigue en el tooltip y en la tabla)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => setAncho(entry.contentRect.width));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const maxCaracteres = ancho ? Math.floor(ancho / ANCHO_CARACTER) : Infinity;

  return (
    <figure
      ref={ref}
      role="img"
      aria-label="Gráfico de barras con el número de estudiantes atendidos por motivo de consulta. Los mismos datos están en la tabla."
    >
      <ChartContainer config={chartConfig} className="aspect-auto w-full" style={{ height: datos.length * ALTO_FILA + 8 }}>
        <BarChart data={datos} layout="vertical" margin={{ top: 22, right: 36, bottom: 0, left: 0 }} barCategoryGap={0}>
          <XAxis type="number" dataKey="estudiantes" hide />
          <YAxis type="category" dataKey="motivoNombre" hide />
          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
          <Bar dataKey="estudiantes" fill="var(--color-estudiantes)" barSize={20} radius={[0, 4, 4, 0]}>
            {/* Nombre del motivo encima de cada barra: evita un eje angosto con nombres cortados */}
            <LabelList
              dataKey="motivoNombre"
              content={({ x, y, value }) => (
                <text x={Number(x)} y={Number(y) - 7} className="fill-foreground text-xs">
                  {acortar(String(value), maxCaracteres)}
                </text>
              )}
            />
            <LabelList dataKey="estudiantes" position="right" offset={8} className="fill-foreground text-xs font-medium" />
          </Bar>
        </BarChart>
      </ChartContainer>
    </figure>
  );
}

function TablaMotivos({ informe }: { informe: InformeMotivos }) {
  return (
    <Table className="min-w-[36rem]">
      <TableHeader>
        <TableRow>
          <TableHead>Motivo de consulta</TableHead>
          <TableHead className="text-right">Estudiantes atendidos</TableHead>
          <TableHead>Adherencia promedio al plan (%)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {informe.motivos.map((m) => (
          <TableRow key={m.motivo}>
            <TableCell className="font-medium">{m.motivoNombre}</TableCell>
            <TableCell className="text-right tabular-nums">{m.estudiantes}</TableCell>
            <TableCell>
              {m.adherenciaPromedio === null ? (
                <span className="text-muted-foreground">Sin datos</span>
              ) : (
                <div className="flex items-center gap-3">
                  <Progress
                    value={Math.min(100, Math.max(0, m.adherenciaPromedio))}
                    className="h-1.5 w-24 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="tabular-nums">{formatPorcentaje(m.adherenciaPromedio)}</span>
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function SugerenciaTaller({ sugerencia }: { sugerencia: NonNullable<InformeMotivos["sugerencia"]> }) {
  return (
    <Card className="min-w-0">
      <CardHeader className="p-5 pb-3">
        <p className="text-sm font-medium text-muted-foreground">Sugerencia de taller</p>
        <CardTitle className="text-lg">{sugerencia.motivoNombre}</CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-0 space-y-4">
        <p className="text-sm">{sugerencia.enfoque}</p>
        {sugerencia.talleres.length > 0 && (
          <ul className="space-y-2">
            {sugerencia.talleres.map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
        )}
        {sugerencia.nota && (
          <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">{sugerencia.nota}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Sugerencia orientativa basada en el motivo más consultado del periodo. La decisión final es de Bienestar.
        </p>
      </CardContent>
    </Card>
  );
}

function InformeSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-5" aria-busy="true" aria-label="Cargando informe">
      <Skeleton className="h-72 w-full rounded-lg lg:col-span-3" />
      <Skeleton className="h-72 w-full rounded-lg lg:col-span-2" />
      <Skeleton className="h-48 w-full rounded-lg lg:col-span-5" />
    </div>
  );
}

// Informe agregado y anónimo: cuántos estudiantes se atendieron por motivo y su adherencia promedio
export function InformeMotivosSection() {
  const [desde, setDesde] = useState<Date | undefined>();
  const [hasta, setHasta] = useState<Date | undefined>();
  const [motivo, setMotivo] = useState(TODOS);

  const desdeIso = desde ? format(desde, "yyyy-MM-dd") : null;
  const hastaIso = hasta ? format(hasta, "yyyy-MM-dd") : null;
  const motivoParam = motivo === TODOS ? null : motivo;

  const { data: informe, isLoading, isError, error, isFetching, isPlaceholderData, refetch } = useQuery({
    queryKey: ["informe-motivos", desdeIso, hastaIso, motivoParam],
    queryFn: () =>
      informeService.motivos({
        desde: desdeIso ?? undefined,
        hasta: hastaIso ?? undefined,
        motivo: motivoParam ?? undefined,
      }),
    placeholderData: keepPreviousData,
    retry: false,
  });

  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  const mensaje400 =
    status === 400 && axios.isAxiosError(error)
      ? (error.response?.data as { message?: string; error?: string } | undefined)?.message ||
        (error.response?.data as { error?: string } | undefined)?.error ||
        "Revisa las fechas del periodo."
      : null;

  const hayFiltros = !!desde || !!hasta || motivo !== TODOS;
  const limpiar = () => {
    setDesde(undefined);
    setHasta(undefined);
    setMotivo(TODOS);
  };

  return (
    <section className="space-y-6" aria-labelledby="informe-motivos-titulo">
      <div>
        <h2 id="informe-motivos-titulo" className="text-xl font-semibold tracking-tight">
          Informe por motivo de consulta
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Datos agregados y anonimizados de las atenciones registradas
        </p>
        {informe && !isError && (
          <p className="text-sm font-medium mt-2">
            {informe.desde
              ? `Periodo: ${formatFecha(informe.desde)} al ${formatFecha(informe.hasta)}`
              : `Periodo: todas las atenciones hasta ${formatFecha(informe.hasta)}`}
          </p>
        )}
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.5fr_auto] lg:items-end">
            <FiltroFecha
              id="filtro-desde"
              label="Desde"
              value={desde}
              onChange={setDesde}
              disabled={(d) => isAfter(startOfDay(d), hoy()) || (!!hasta && isAfter(startOfDay(d), startOfDay(hasta)))}
            />
            <FiltroFecha
              id="filtro-hasta"
              label="Hasta"
              value={hasta}
              onChange={setHasta}
              disabled={(d) => isAfter(startOfDay(d), hoy()) || (!!desde && isBefore(startOfDay(d), startOfDay(desde)))}
            />
            <div className="space-y-2">
              <Label htmlFor="filtro-motivo">Motivo</Label>
              <Select value={motivo} onValueChange={setMotivo}>
                <SelectTrigger id="filtro-motivo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TODOS}>Todos los motivos</SelectItem>
                  {MOTIVOS_CONSULTA.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={limpiar} disabled={!hayFiltros}>
              Limpiar filtros
            </Button>
          </div>
          {mensaje400 && (
            <p className="text-sm text-destructive" role="alert">{mensaje400}</p>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <InformeSkeleton />
      ) : isError ? (
        mensaje400 ? null : (
          <Card>
            <CardContent className="p-6 py-10 text-center space-y-3">
              <p className="text-sm text-muted-foreground">No pudimos cargar el informe.</p>
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
                Reintentar
              </Button>
            </CardContent>
          </Card>
        )
      ) : informe ? (
        <div className={cn("space-y-6 transition-opacity", isPlaceholderData && "opacity-60")} aria-busy={isPlaceholderData}>
          {informe.hayMotivosOmitidos && (
            <p className="flex items-start gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              Por anonimato, no se muestran los motivos con menos de 5 estudiantes.
            </p>
          )}

          {informe.motivos.length === 0 ? (
            <Card>
              <CardContent className="p-6 py-12 flex flex-col items-center gap-3 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <BarChart3 className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">Aún no hay datos para mostrar</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Los motivos aparecen cuando al menos 5 estudiantes fueron atendidos por el mismo motivo en el periodo seleccionado.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className={cn("grid gap-6", informe.sugerencia && "lg:grid-cols-5")}>
                <Card className="min-w-0 lg:col-span-3">
                  <CardHeader className="p-5 pb-2">
                    <CardTitle className="text-base">Estudiantes atendidos por motivo</CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 pt-0">
                    <GraficoMotivos informe={informe} />
                  </CardContent>
                </Card>
                {informe.sugerencia && (
                  <div className="min-w-0 lg:col-span-2">
                    <SugerenciaTaller sugerencia={informe.sugerencia} />
                  </div>
                )}
              </div>

              <Card className="min-w-0">
                <CardHeader className="p-5 pb-2">
                  <CardTitle className="text-base">Detalle por motivo</CardTitle>
                </CardHeader>
                <CardContent className="p-0 pb-2">
                  <TablaMotivos informe={informe} />
                </CardContent>
              </Card>
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}
