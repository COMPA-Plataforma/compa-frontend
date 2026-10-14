import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isAfter, startOfDay } from "date-fns";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateField } from "@/components/dialogs/ActivityFields";
import { derivacionService, type DestinoDerivacion } from "@/services/derivacionService";
import { DESTINOS, MAX_DESTINO_OTRO, MAX_MOTIVO } from "@/lib/derivaciones";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alertId: number | null;
  estudianteName: string;
}

// Deriva al estudiante desde una alerta activa: destino, fecha y motivo
export function DerivacionDialog({ open, onOpenChange, alertId, estudianteName }: Props) {
  const queryClient = useQueryClient();
  const [destino, setDestino] = useState<DestinoDerivacion | "">("");
  const [destinoOtro, setDestinoOtro] = useState("");
  const [fecha, setFecha] = useState<Date | undefined>(new Date());
  const [motivo, setMotivo] = useState("");

  // Formulario limpio cada vez que se abre
  useEffect(() => {
    if (!open) return;
    setDestino("");
    setDestinoOtro("");
    setFecha(new Date());
    setMotivo("");
  }, [open]);

  const mutation = useMutation({
    mutationFn: () =>
      derivacionService.derivar(alertId!, {
        destino: destino as DestinoDerivacion,
        destinoOtro: destino === "OTRA" ? destinoOtro.trim() : undefined,
        fecha: format(fecha!, "yyyy-MM-dd"),
        motivo: motivo.trim(),
      }),
    onSuccess: (d) => {
      toast.success(`Derivación registrada: ${d.destinoNombre}`);
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["alerts-count"] });
      onOpenChange(false);
    },
  });

  const canSave =
    alertId !== null &&
    destino !== "" &&
    (destino !== "OTRA" || destinoOtro.trim().length > 0) &&
    !!fecha &&
    motivo.trim().length > 0 &&
    !mutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Derivar estudiante</DialogTitle>
          <DialogDescription>
            Derivación de <strong>{estudianteName}</strong> desde esta alerta. La alerta quedará atendida por derivación.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label>Destino *</Label>
            <Select value={destino} onValueChange={(v) => setDestino(v as DestinoDerivacion)}>
              <SelectTrigger aria-label="Destino">
                <SelectValue placeholder="Selecciona una ruta de atención" />
              </SelectTrigger>
              <SelectContent>
                {DESTINOS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {destino === "OTRA" && (
            <div className="space-y-2">
              <Label htmlFor="derivacion-otra">Nombre de la ruta *</Label>
              <Input
                id="derivacion-otra"
                maxLength={MAX_DESTINO_OTRO}
                value={destinoOtro}
                onChange={(e) => setDestinoOtro(e.target.value)}
                placeholder="Institución o servicio al que se deriva"
              />
            </div>
          )}

          <div className="space-y-2 sm:max-w-[16rem]">
            <Label>Fecha *</Label>
            <DateField
              value={fecha}
              onChange={setFecha}
              disabled={(d) => isAfter(startOfDay(d), startOfDay(new Date()))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="derivacion-motivo">Motivo *</Label>
            <Textarea
              id="derivacion-motivo"
              rows={5}
              maxLength={MAX_MOTIVO}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Por qué se deriva al estudiante"
            />
            <p className="text-xs text-muted-foreground text-right">{motivo.length}/{MAX_MOTIVO}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => mutation.mutate()} disabled={!canSave}>
            {mutation.isPending ? "Derivando..." : "Derivar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}