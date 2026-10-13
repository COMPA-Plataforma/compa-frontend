import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { toast } from "sonner";
import { Loader2, Lock, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SeguimientoDialog } from "@/components/seguimientos/SeguimientoDialog";
import { seguimientoService } from "@/services/seguimientoService";
import { formatFecha } from "@/lib/dates";
import { MARCAS } from "@/lib/seguimientos";
import type { Seguimiento } from "@/types";

type Resultado =
  | { status: "ok"; data: Seguimiento[] }
  | { status: "forbidden"; message: string };

const MENSAJE_403 = "Solo el psicoorientador asignado puede ver los seguimientos de este estudiante.";

// Historial de seguimientos del más reciente al más antiguo, con opción de registrar y anular
export function SeguimientoSection({ estudianteId }: { estudianteId: number }) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [aAnular, setAAnular] = useState<Seguimiento | null>(null);

  const { data: resultado, isLoading } = useQuery<Resultado>({
    queryKey: ["seguimientos", estudianteId],
    queryFn: async () => {
      try {
        return { status: "ok", data: await seguimientoService.list(estudianteId) };
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

  const anular = useMutation({
    mutationFn: (s: Seguimiento) => seguimientoService.anular(estudianteId, s.id),
    onSuccess: () => {
      toast.success("Seguimiento anulado");
      queryClient.invalidateQueries({ queryKey: ["seguimientos", estudianteId] });
      setAAnular(null);
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (resultado?.status === "forbidden") {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center gap-3 text-muted-foreground">
          <Lock className="h-5 w-5 shrink-0" />
          <p>{resultado.message}</p>
        </CardContent>
      </Card>
    );
  }

  const seguimientos = resultado?.status === "ok" ? resultado.data : [];

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Historial de sesiones, del más reciente al más antiguo.
        </p>
        <Button size="sm" onClick={() => setDialogOpen(true)} className="gap-1">
          <Plus className="h-4 w-4" /> Registrar seguimiento
        </Button>
      </div>

      {seguimientos.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Este estudiante aún no tiene seguimientos registrados.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {seguimientos.map((s) => {
            const activas = MARCAS.filter((m) => s[m.key]);
            return (
              <Card key={s.id} className={s.anulado ? "bg-muted/40" : ""}>
                <CardContent className="pt-5 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className={`font-semibold ${s.anulado ? "line-through text-muted-foreground" : ""}`}>
                        {formatFecha(s.fecha)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Registrado por {s.autorNombre} · {format(new Date(s.createdAt), "dd/MM/yyyy HH:mm")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {s.anulado && <Badge variant="destructive">Anulado</Badge>}
                      {!s.anulado && (
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setAAnular(s)}>
                          Anular
                        </Button>
                      )}
                    </div>
                  </div>

                  {activas.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {activas.map((m) => (
                        <Badge key={m.key} variant="secondary">{m.label}</Badge>
                      ))}
                    </div>
                  )}

                  <p className={`whitespace-pre-wrap text-sm ${s.anulado ? "text-muted-foreground" : ""}`}>
                    {s.descripcion}
                  </p>

                  {s.anulado && s.anuladoAt && (
                    <p className="text-xs text-muted-foreground">
                      Anulado el {format(new Date(s.anuladoAt), "dd/MM/yyyy HH:mm")}
                      {s.anuladoPorNombre ? ` por ${s.anuladoPorNombre}` : ""}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <SeguimientoDialog open={dialogOpen} onOpenChange={setDialogOpen} estudianteId={estudianteId} />

      <AlertDialog open={!!aAnular} onOpenChange={(o) => !o && setAAnular(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Anular este seguimiento?</AlertDialogTitle>
            <AlertDialogDescription>
              El seguimiento del {aAnular ? formatFecha(aAnular.fecha) : ""} quedará marcado como anulado.
              No se borra: sigue visible en el historial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={anular.isPending}
              onClick={(e) => { e.preventDefault(); if (aAnular) anular.mutate(aAnular); }}
            >
              {anular.isPending ? "Anulando..." : "Anular seguimiento"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}