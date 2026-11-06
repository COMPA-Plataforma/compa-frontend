import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { CheckCircle2, Clock, ExternalLink, FileWarning, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatFecha } from "@/lib/dates";
import {
  autorizacionMenorService,
  type DecisionRevision,
  type EstadoAutorizacionMenor,
} from "@/services/autorizacionMenorService";

const ETIQUETA: Record<EstadoAutorizacionMenor, string> = {
  PENDIENTE: "Esperando el documento",
  EN_REVISION: "Por revisar",
  APROBADA: "Aprobada",
  RECHAZADA: "Rechazada",
};

const kb = (bytes: number | null) => (bytes ? `${Math.max(1, Math.round(bytes / 1024))} KB` : "");

// Revisión del psicoorientador del documento de autorización que sube un estudiante menor de edad.
// No se muestra si el estudiante no es menor.
export function RevisionAutorizacionCard({ estudianteId }: { estudianteId: number }) {
  const queryClient = useQueryClient();
  const [decision, setDecision] = useState<DecisionRevision | null>(null);
  const [motivo, setMotivo] = useState("");
  const [abriendo, setAbriendo] = useState(false);

  const { data: aut, isLoading } = useQuery({
    queryKey: ["autorizacion-menor", estudianteId],
    queryFn: () => autorizacionMenorService.getDeEstudiante(estudianteId),
  });

  const revisar = useMutation({
    mutationFn: () => autorizacionMenorService.revisar(estudianteId, decision!, motivo.trim() || undefined),
    onSuccess: (data) => {
      toast.success(data.estado === "APROBADA" ? "Autorización aprobada. El estudiante ya puede usar COMPA." : "Documento rechazado. El estudiante podrá subirlo de nuevo.");
      queryClient.setQueryData(["autorizacion-menor", estudianteId], data);
      queryClient.invalidateQueries({ queryKey: ["autorizaciones-pendientes"] });
      queryClient.invalidateQueries({ queryKey: ["acudiente", estudianteId] });
      setDecision(null);
      setMotivo("");
    },
    onError: (err: AxiosError<{ message?: string; error?: string }>) => {
      toast.error(err?.response?.data?.message || err?.response?.data?.error || "No se pudo guardar la revisión.");
    },
  });

  const verDocumento = async () => {
    setAbriendo(true);
    try {
      const blob = await autorizacionMenorService.getArchivo(estudianteId);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      // el interceptor ya avisó del error
    } finally {
      setAbriendo(false);
    }
  };

  const confirmar = () => {
    if (decision === "RECHAZAR" && !motivo.trim()) {
      toast.error("Escribe el motivo para que el estudiante sepa qué corregir.");
      return;
    }
    revisar.mutate();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  if (!aut) return null;

  const porRevisar = aut.estado === "EN_REVISION";

  return (
    <Card className={porRevisar ? "border-amber-400" : undefined} data-testid="revision-autorizacion">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            {aut.estado === "APROBADA" ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : aut.estado === "RECHAZADA" ? (
              <ShieldAlert className="h-4 w-4 text-destructive" />
            ) : (
              <Clock className="h-4 w-4 text-amber-600" />
            )}
            Autorización del representante legal
          </CardTitle>
          <Badge variant={aut.estado === "APROBADA" ? "default" : "secondary"}>{ETIQUETA[aut.estado]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {aut.estado === "PENDIENTE" && (
          <p className="text-muted-foreground">
            El estudiante aún no sube el documento firmado. Mientras tanto no puede usar la plataforma.
            {!aut.acudiente && " Primero registra los datos de su acudiente."}
          </p>
        )}

        {aut.estado === "RECHAZADA" && (
          <div className="space-y-1">
            <p className="flex items-center gap-2 text-destructive">
              <FileWarning className="h-4 w-4" /> Rechazaste el documento
              {aut.revisadoEn ? ` el ${formatFecha(aut.revisadoEn)}` : ""}. Está esperando que el estudiante lo suba de nuevo.
            </p>
            {aut.motivoRechazo && <p className="text-muted-foreground">Motivo: {aut.motivoRechazo}</p>}
          </div>
        )}

        {aut.estado === "APROBADA" && (
          <p className="font-medium text-green-700">
            Aprobada{aut.revisadoPorNombre ? ` por ${aut.revisadoPorNombre}` : ""}
            {aut.revisadoEn ? ` el ${formatFecha(aut.revisadoEn)}` : ""}. El estudiante ya puede usar COMPA.
          </p>
        )}

        {porRevisar && (
          <p className="text-muted-foreground">
            El estudiante subió el documento firmado
            {aut.subidoEn ? ` el ${formatFecha(aut.subidoEn, "dd/MM/yyyy HH:mm")}` : ""}. Revísalo: verifica que esté
            firmado por el representante legal ({aut.acudiente ? `${aut.acudiente.name} ${aut.acudiente.lastName}` : "—"})
            y que se lea bien.
          </p>
        )}

        {aut.archivoNombre && (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={verDocumento} disabled={abriendo} className="gap-2">
              {abriendo ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
              Ver documento
            </Button>
            <span className="break-all text-xs text-muted-foreground">
              {aut.archivoNombre} {kb(aut.archivoTamano) && `· ${kb(aut.archivoTamano)}`}
            </span>
          </div>
        )}

        {porRevisar && (
          <div className="flex flex-wrap gap-2 pt-1">
            <Button size="sm" onClick={() => setDecision("APROBAR")}>
              Aprobar
            </Button>
            <Button size="sm" variant="outline" onClick={() => setDecision("RECHAZAR")}>
              Rechazar
            </Button>
          </div>
        )}
      </CardContent>

      <Dialog open={decision !== null} onOpenChange={(o) => { if (!o) { setDecision(null); setMotivo(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{decision === "APROBAR" ? "Aprobar la autorización" : "Rechazar el documento"}</DialogTitle>
            <DialogDescription>
              {decision === "APROBAR"
                ? "El estudiante podrá usar COMPA desde ya y se registrará hoy como la fecha de autorización de su representante legal."
                : "El estudiante seguirá sin acceso y podrá subir el documento de nuevo. Dile qué debe corregir."}
            </DialogDescription>
          </DialogHeader>
          {decision === "RECHAZAR" && (
            <div className="space-y-2">
              <Label htmlFor="motivo-rechazo">Motivo *</Label>
              <Textarea
                id="motivo-rechazo"
                value={motivo}
                maxLength={500}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ej: falta la firma del representante legal / la foto no se alcanza a leer"
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDecision(null)} disabled={revisar.isPending}>
              Cancelar
            </Button>
            <Button onClick={confirmar} disabled={revisar.isPending}>
              {revisar.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {decision === "APROBAR" ? "Aprobar" : "Rechazar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}