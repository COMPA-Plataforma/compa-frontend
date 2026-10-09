import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, Loader2, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AtencionDialog } from "@/components/atencion/AtencionDialog";
import { atencionService } from "@/services/atencionService";
import type { Atencion, MotivoItem } from "@/types";

type AtencionResult =
  | { status: "ok"; data: Atencion }
  | { status: "none" }
  | { status: "forbidden" };

const fmt = (d: string) => format(new Date(d), "dd/MM/yyyy HH:mm");

function Motivos({ motivos, otro }: { motivos: MotivoItem[]; otro: string | null }) {
  if (motivos.length === 0 && !otro) return <p className="font-medium">—</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {motivos.map((m) => (
        <Badge key={m.codigo} variant="secondary">{m.nombre}</Badge>
      ))}
      {otro && <Badge variant="outline">Otro: {otro}</Badge>}
    </div>
  );
}

export function AtencionSection({ estudianteId }: { estudianteId: number }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const { data: result, isLoading } = useQuery<AtencionResult>({
    queryKey: ["atencion", estudianteId],
    queryFn: async () => {
      try {
        return { status: "ok", data: await atencionService.get(estudianteId) };
      } catch (e) {
        if (axios.isAxiosError(e)) {
          if (e.response?.status === 404) return { status: "none" };
          if (e.response?.status === 403) return { status: "forbidden" };
        }
        throw e;
      }
    },
    enabled: !isNaN(estudianteId),
    retry: false,
  });

  const { data: historial = [], isLoading: historialLoading } = useQuery({
    queryKey: ["atencionHistorial", estudianteId],
    queryFn: () => atencionService.historial(estudianteId),
    enabled: historyOpen && result?.status === "ok",
  });

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (result?.status === "forbidden") {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center gap-3 text-muted-foreground">
          <Lock className="h-5 w-5" />
          <p>Solo el psicoorientador asignado puede ver la atención de este estudiante.</p>
        </CardContent>
      </Card>
    );
  }

  const atencion = result?.status === "ok" ? result.data : null;

  if (!atencion) {
    return (
      <>
        <Card>
          <CardContent className="pt-6 space-y-3">
            <p className="text-muted-foreground">Este estudiante aún no tiene una atención registrada.</p>
            <Button onClick={() => setDialogOpen(true)}>Registrar atención</Button>
          </CardContent>
        </Card>
        <AtencionDialog open={dialogOpen} onOpenChange={setDialogOpen} estudianteId={estudianteId} existing={null} />
      </>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              Versión {atencion.version} · actualizada el {fmt(atencion.updatedAt)}
              {atencion.orientadorNombre ? ` · ${atencion.orientadorNombre}` : ""}
            </p>
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>Actualizar atención</Button>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Anamnesis</p>
            <p className="font-medium whitespace-pre-wrap">{atencion.anamnesis}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Motivos de consulta</p>
            <Motivos motivos={atencion.motivos} otro={atencion.motivoOtro} />
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Impresión diagnóstica</p>
            <p className="font-medium">{atencion.impresionDiagnostica || "—"}</p>
          </div>

          <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                {historyOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                Historial de cambios
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              {historialLoading ? (
                <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {historial.map((v) => (
                    <AccordionItem key={v.numero} value={`v${v.numero}`}>
                      <AccordionTrigger className="text-sm">
                        Versión {v.numero} · {fmt(v.fecha)} · {v.autorNombre}
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Anamnesis</p>
                          <p className="whitespace-pre-wrap">{v.anamnesis}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Motivos de consulta</p>
                          <Motivos motivos={v.motivos} otro={v.motivoOtro} />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Impresión diagnóstica</p>
                          <p>{v.impresionDiagnostica || "—"}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      <AtencionDialog open={dialogOpen} onOpenChange={setDialogOpen} estudianteId={estudianteId} existing={atencion} />
    </>
  );
}