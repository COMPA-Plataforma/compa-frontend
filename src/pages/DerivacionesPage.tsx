import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Route, Search, SearchX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NovedadDerivacionDialog } from "@/components/derivaciones/NovedadDerivacionDialog";
import { derivacionService, type DerivacionHistorial, type EstadoDerivacion } from "@/services/derivacionService";
import { ESTADOS_DERIVACION, ESTADO_DERIVACION_BADGE } from "@/lib/derivaciones";
import { formatFecha } from "@/lib/dates";
import { cn } from "@/lib/utils";

type FiltroEstado = EstadoDerivacion | "TODAS";

// Sin mayúsculas ni tildes: "maria" encuentra a "María"
const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const textoDias = (dias: number) => `${dias} ${dias === 1 ? "día" : "días"}`;

function Encabezado() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Derivaciones</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Seguimiento de los estudiantes derivados a rutas de atención
      </p>
    </div>
  );
}

function CargandoDerivaciones() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Cargando derivaciones">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-10 w-full max-w-xl" />
      <Card>
        <CardContent className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// Lista de derivaciones de los estudiantes asignados, con filtros y actualización de estado
export default function DerivacionesPage() {
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState<FiltroEstado>("TODAS");
  const [seleccionada, setSeleccionada] = useState<DerivacionHistorial | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: derivaciones = [], isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["derivaciones", "mias"],
    queryFn: derivacionService.listarMias,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Encabezado />
        <CargandoDerivaciones />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <Encabezado />
        <Card>
          <CardContent className="p-5 py-10 text-center space-y-3">
            <p className="text-sm text-muted-foreground">No pudimos cargar las derivaciones.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (derivaciones.length === 0) {
    return (
      <div className="space-y-6">
        <Encabezado />
        <Card>
          <CardContent className="p-5 py-12 flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Route className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 className="font-semibold">Aún no hay estudiantes derivados</h2>
              <p className="text-sm text-muted-foreground">
                Cuando derives a un estudiante desde una alerta, aparecerá aquí.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const contadores: { value: FiltroEstado; label: string; total: number }[] = [
    { value: "TODAS", label: "Todas", total: derivaciones.length },
    ...ESTADOS_DERIVACION.map((e) => ({
      value: e.value,
      label: e.label,
      total: derivaciones.filter((d) => d.estado === e.value).length,
    })),
  ];

  const termino = normalizar(busqueda.trim());
  const visibles = derivaciones
    .filter((d) => estado === "TODAS" || d.estado === estado)
    .filter((d) => normalizar(d.estudianteNombre).includes(termino))
    .sort((a, b) => b.diasTranscurridos - a.diasTranscurridos);

  const limpiarFiltros = () => {
    setBusqueda("");
    setEstado("TODAS");
  };

  const actualizarEstado = (derivacion: DerivacionHistorial) => {
    setSeleccionada(derivacion);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Encabezado />

      {/* Contadores: también filtran por estado */}
      <div role="group" aria-label="Filtrar por estado" className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {contadores.map((c) => {
          const activo = estado === c.value;
          return (
            <button
              key={c.value}
              type="button"
              aria-pressed={activo}
              onClick={() => setEstado(c.value)}
              className={cn(
                "flex flex-col items-start gap-2 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-muted/60",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                activo && "border-primary bg-muted/60 ring-1 ring-primary",
              )}
            >
              <span className="text-2xl font-semibold leading-none">{c.total}</span>
              <span
                className={cn(
                  badgeVariants({ variant: "outline" }),
                  c.value !== "TODAS" && ESTADO_DERIVACION_BADGE[c.value],
                )}
              >
                {c.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre del estudiante"
            aria-label="Buscar por nombre del estudiante"
            className="pl-9"
          />
        </div>
        <Select value={estado} onValueChange={(v) => setEstado(v as FiltroEstado)}>
          <SelectTrigger className="sm:w-56" aria-label="Estado">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODAS">Todos los estados</SelectItem>
            {ESTADOS_DERIVACION.map((e) => (
              <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {visibles.length === 0 ? (
        <Card>
          <CardContent className="p-5 py-12 flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <SearchX className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            </div>
            <h2 className="font-semibold">No hay derivaciones con ese filtro</h2>
            <Button variant="outline" size="sm" onClick={limpiarFiltros}>
              Limpiar filtros
            </Button>
          </CardContent>
        </Card>
      ) : (
        // w-0 min-w-full: el ancho de la tabla no empuja el layout; se desplaza dentro de la tarjeta
        <div className="w-0 min-w-full">
          <Card>
            <CardContent className="p-0">
              <Table className="min-w-[60rem]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Estudiante</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha de derivación</TableHead>
                    <TableHead>Días</TableHead>
                    <TableHead>Última novedad</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibles.map((d) => {
                    const ultima = d.novedades[d.novedades.length - 1];
                    return (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">
                          <Link
                            to={`/estudiantes/${d.estudianteId}`}
                            className="rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {d.estudianteNombre}
                          </Link>
                        </TableCell>
                        <TableCell>{d.destinoNombre}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("whitespace-nowrap", ESTADO_DERIVACION_BADGE[d.estado])}>
                            {d.estadoEtiqueta}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{formatFecha(d.fecha)}</TableCell>
                        <TableCell className="whitespace-nowrap">{textoDias(d.diasTranscurridos)}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {ultima ? formatFecha(ultima.fecha) : (
                            <span className="text-muted-foreground">Sin novedades</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => actualizarEstado(d)}
                              aria-label={`Actualizar estado de ${d.estudianteNombre}`}
                            >
                              Actualizar estado
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/estudiantes/${d.estudianteId}`} aria-label={`Ver estudiante ${d.estudianteNombre}`}>
                                Ver estudiante
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {seleccionada && (
        <NovedadDerivacionDialog open={dialogOpen} onOpenChange={setDialogOpen} derivacion={seleccionada} />
      )}
    </div>
  );
}
