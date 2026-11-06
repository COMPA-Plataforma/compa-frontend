import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { habitPlanService } from "@/services/habitPlanService";
import { estrategiaService, type Estrategia } from "@/services/estrategiaService";
import { formatFecha } from "@/lib/dates";

// Fecha de hoy en Colombia (yyyy-MM-dd), para no permitir sesiones futuras
const hoyColombia = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });

const MAX = 2000;

// Estrategias trabajadas con el estudiante dentro de su plan: registrar, editar, anular y ver el historial.
export function EstrategiasSection({ estudianteId }: { estudianteId: number }) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<Estrategia | null>(null);
  const [descripcion, setDescripcion] = useState("");
  const [fechaSesion, setFechaSesion] = useState(hoyColombia());
  const [aAnular, setAAnular] = useState<Estrategia | null>(null);
  const [verAnuladas, setVerAnuladas] = useState(true);

  const { data: estrategias = [], isLoading } = useQuery({
    queryKey: ["estrategias", estudianteId],
    queryFn: () => estrategiaService.historial(estudianteId),
  });

  // Misma consulta que la pestaña de planes: sirve para saber si hay un plan activo
  const { data: planes = [], isLoading: cargandoPlanes } = useQuery({
    queryKey: ["habitPlans", estudianteId],
    queryFn: () => habitPlanService.list(estudianteId),
  });
  const sinPlanActivo = !cargandoPlanes && !planes.some((p) => p.status === "ACTIVO");

  const refrescar = () => queryClient.invalidateQueries({ queryKey: ["estrategias", estudianteId] });
  const mostrarError = (err: AxiosError<{ message?: string; error?: string }>, porDefecto: string) =>
    toast.error(err?.response?.data?.message || err?.response?.data?.error || porDefecto);

  const guardar = useMutation({
    mutationFn: () => {
      const data = { descripcion: descripcion.trim(), fechaSesion };
      return editando
        ? estrategiaService.actualizar(estudianteId, editando.id, data)
        : estrategiaService.crear(estudianteId, data);
    },
    onSuccess: () => {
      toast.success(editando ? "Estrategia actualizada." : "Estrategia registrada.");
      refrescar();
      setDialogOpen(false);
    },
    onError: (err: AxiosError<{ message?: string; error?: string }>) => mostrarError(err, "No se pudo guardar la estrategia."),
  });

  const anular = useMutation({
    mutationFn: (e: Estrategia) => estrategiaService.anular(estudianteId, e.id),
    onSuccess: () => {
      toast.success("Estrategia anulada. Queda en el historial.");
      refrescar();
      setAAnular(null);
    },
    onError: (err: AxiosError<{ message?: string; error?: string }>) => mostrarError(err, "No se pudo anular la estrategia."),
  });

  const abrirNueva = () => {
    setEditando(null);
    setDescripcion("");
    setFechaSesion(hoyColombia());
    setDialogOpen(true);
  };

  const abrirEditar = (e: Estrategia) => {
    setEditando(e);
    setDescripcion(e.descripcion);
    setFechaSesion(e.fechaSesion);
    setDialogOpen(true);
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!descripcion.trim()) {
      toast.error("Escribe la descripción de la estrategia.");
      return;
    }
    if (!fechaSesion) {
      toast.error("Indica la fecha de la sesión.");
      return;
    }
    if (fechaSesion > hoyColombia()) {
      toast.error("La fecha de la sesión no puede ser futura.");
      return;
    }
    guardar.mutate();
  };

  const visibles = verAnuladas ? estrategias : estrategias.filter((e) => e.estado === "VIGENTE");
  const hayAnuladas = estrategias.some((e) => e.estado === "ANULADA");

  return (
    <div className="space-y-4" data-testid="estrategias-section">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">Estrategias trabajadas</h3>
        <Button onClick={abrirNueva} disabled={isLoading || cargandoPlanes || sinPlanActivo} className="gap-2">
          <Plus className="h-4 w-4" /> Nueva estrategia
        </Button>
      </div>

      {sinPlanActivo && (
        <p className="text-sm text-muted-foreground">
          Para registrar estrategias el estudiante necesita un plan activo (pestaña Planes de Hábitos).
        </p>
      )}

      {hayAnuladas && (
        <div className="flex items-center gap-2">
          <Switch id="ver-anuladas" checked={verAnuladas} onCheckedChange={setVerAnuladas} />
          <Label htmlFor="ver-anuladas" className="text-sm font-normal">Mostrar anuladas</Label>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : visibles.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            Aún no hay estrategias registradas.
          </CardContent>
        </Card>
      ) : (
        visibles.map((e) => {
          const anulada = e.estado === "ANULADA";
          return (
            <Card key={e.id} className={anulada ? "opacity-60" : undefined} data-testid="estrategia-item">
              <CardContent className="space-y-2 pt-6">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-medium">Sesión del {formatFecha(e.fechaSesion)}</span>
                    {anulada && <Badge variant="secondary">Anulada el {formatFecha(e.anuladaEn)}</Badge>}
                  </div>
                  {!anulada && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => abrirEditar(e)} aria-label="Editar estrategia">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setAAnular(e)} aria-label="Anular estrategia">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className={`whitespace-pre-line text-sm ${anulada ? "line-through" : ""}`}>{e.descripcion}</p>
                <p className="text-xs text-muted-foreground">
                  Plan: {e.planNombre} · Registrada el {formatFecha(e.creadaEn)}
                  {e.actualizadaEn ? ` · Actualizada el ${formatFecha(e.actualizadaEn, "dd/MM/yyyy HH:mm")}` : ""}
                </p>
              </CardContent>
            </Card>
          );
        })
      )}

      {/* Registrar / editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar estrategia" : "Nueva estrategia"}</DialogTitle>
            <DialogDescription>
              Lo que trabajaste con el estudiante en la sesión. Queda en su plan de acompañamiento activo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="estr-fecha">Fecha de la sesión *</Label>
              <Input
                id="estr-fecha"
                type="date"
                max={hoyColombia()}
                value={fechaSesion}
                onChange={(ev) => setFechaSesion(ev.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estr-descripcion">Descripción *</Label>
              <Textarea
                id="estr-descripcion"
                rows={5}
                maxLength={MAX}
                value={descripcion}
                onChange={(ev) => setDescripcion(ev.target.value)}
                placeholder="Ej: ejercicio de respiración 4-7-8 antes de dormir"
              />
              <p className="text-right text-xs text-muted-foreground">{descripcion.length}/{MAX}</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={guardar.isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={guardar.isPending}>
                {guardar.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmar anulación */}
      <AlertDialog open={aAnular !== null} onOpenChange={(o) => { if (!o) setAAnular(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Anular esta estrategia?</AlertDialogTitle>
            <AlertDialogDescription>
              Dejará de verla el estudiante, pero se conserva en el historial como anulada y ya no se podrá editar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={anular.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={anular.isPending}
              onClick={(ev) => { ev.preventDefault(); if (aAnular) anular.mutate(aAnular); }}
            >
              {anular.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Anular
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}