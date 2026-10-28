import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { CheckCircle2, ClipboardCheck, Loader2, Lock, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { validacionService } from "@/services/validacionService";
import { formatFecha } from "@/lib/dates";
import type { ActividadInformada, EstadoValidacion, ValidacionesResponse } from "@/types";

type Resultado =
  | { status: "ok"; data: ValidacionesResponse }
  | { status: "forbidden"; message: string };

const MENSAJE_403 = "Solo el psicoorientador asignado puede validar las actividades de este estudiante.";

async function cargar(estudianteId: number): Promise<Resultado> {
  try {
    return { status: "ok", data: await validacionService.list(estudianteId) };
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 403) {
      const msg = e.response.data?.message || e.response.data?.error;
      return { status: "forbidden", message: msg && msg !== "Forbidden" ? msg : MENSAJE_403 };
    }
    throw e;
  }
}

function EstadoBadge({ item }: { item: ActividadInformada }) {
  if (item.estadoValidacion === "VALIDADA") {
    return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Validada</Badge>;
  }
  if (item.estadoValidacion === "NO_REALIZADA") {
    return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">No realizada</Badge>;
  }
  return <Badge variant="outline">Sin validar</Badge>;
}

// Lo que el estudiante informó desde la última sesión, para confirmarlo en la consulta
export function ValidacionActividadesSection({ estudianteId }: { estudianteId: number }) {
  const queryClient = useQueryClient();
  const [soloPendientes, setSoloPendientes] = useState(false);

  const { data, isLoading, isError } = useQuery<Resultado>({
    queryKey: ["validaciones", estudianteId],
    queryFn: () => cargar(estudianteId),
    enabled: !isNaN(estudianteId),
    retry: false,
  });

  const validar = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoValidacion }) =>
      validacionService.validar(estudianteId, id, estado),
    onSuccess: (_r, vars) => {
      queryClient.invalidateQueries({ queryKey: ["validaciones", estudianteId] });
      toast.success(vars.estado === "VALIDADA" ? "Actividad validada" : "Actividad marcada como no realizada");
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (data?.status === "forbidden") {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center gap-3 text-muted-foreground">
          <Lock className="h-5 w-5 shrink-0" />
          <p>{data.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          No pudimos cargar las actividades. Intenta de nuevo en un momento.
        </CardContent>
      </Card>
    );
  }

  const { ultimaSesion, actividades } = data.data;
  const pendientes = actividades.filter((a) => a.estadoValidacion === null).length;
  const lista = soloPendientes ? actividades.filter((a) => a.estadoValidacion === null) : actividades;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {ultimaSesion
          ? `Actividades que el estudiante informó desde la última sesión (${formatFecha(ultimaSesion)}).`
          : "Aún no hay sesiones registradas: se muestran todas las actividades que el estudiante informó."}
      </p>

      {actividades.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {actividades.length} {actividades.length === 1 ? "registro" : "registros"} · {pendientes} sin validar
          </p>
          <div className="flex items-center gap-2">
            <Switch id="solo-pendientes" checked={soloPendientes} onCheckedChange={setSoloPendientes} />
            <Label htmlFor="solo-pendientes" className="text-sm">Ver solo sin validar</Label>
          </div>
        </div>
      )}

      {actividades.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center space-y-2">
            <ClipboardCheck className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              El estudiante no ha informado actividades desde la última sesión.
            </p>
          </CardContent>
        </Card>
      ) : lista.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Ya validaste todas las actividades de este periodo.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {lista.map((a) => {
            const enCurso = validar.isPending && validar.variables?.id === a.id;
            return (
              <Card key={a.id}>
                <CardContent className="py-4 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-foreground">{a.actividadNombre}</p>
                      <p className="text-xs text-muted-foreground">{formatFecha(a.fecha)}</p>
                    </div>
                    <EstadoBadge item={a} />
                  </div>

                  <div className="text-sm space-y-1">
                    <p className="flex items-center gap-1.5">
                      {a.informadaCumplida ? (
                        <><CheckCircle2 className="h-4 w-4 text-green-600" /> El estudiante informó que la cumplió</>
                      ) : (
                        <><XCircle className="h-4 w-4 text-muted-foreground" /> El estudiante informó que no la cumplió</>
                      )}
                    </p>
                    {a.barreraEtiqueta && (
                      <p className="text-muted-foreground">Dificultad: {a.barreraEtiqueta}</p>
                    )}
                    {a.comentario && (
                      <p className="text-muted-foreground whitespace-pre-wrap break-words">"{a.comentario}"</p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant={a.estadoValidacion === "VALIDADA" ? "default" : "outline"}
                      disabled={enCurso}
                      onClick={() => validar.mutate({ id: a.id, estado: "VALIDADA" })}
                    >
                      {enCurso && validar.variables?.estado === "VALIDADA" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Validada
                    </Button>
                    <Button
                      size="sm"
                      variant={a.estadoValidacion === "NO_REALIZADA" ? "destructive" : "outline"}
                      disabled={enCurso}
                      onClick={() => validar.mutate({ id: a.id, estado: "NO_REALIZADA" })}
                    >
                      {enCurso && validar.variables?.estado === "NO_REALIZADA" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      No realizada
                    </Button>
                    {a.validadaEn && a.validadaPorNombre && (
                      <span className="text-xs text-muted-foreground">
                        Validado por {a.validadaPorNombre} el {formatFecha(a.validadaEn)}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}