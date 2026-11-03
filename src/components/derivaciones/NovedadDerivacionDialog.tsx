import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isAfter, isBefore, startOfDay } from "date-fns";
import { toast } from "sonner";
import { Info } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateField } from "@/components/dialogs/ActivityFields";
import { derivacionService, type DerivacionHistorial, type EstadoDerivacion } from "@/services/derivacionService";
import { ESTADOS_DERIVACION, MAX_DESCRIPCION } from "@/lib/derivaciones";
import { parseFecha } from "@/lib/dates";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  derivacion: DerivacionHistorial;
}

// Registra una novedad de la derivación: fecha, estado resultante y descripción
export function NovedadDerivacionDialog({ open, onOpenChange, derivacion }: Props) {
  const queryClient = useQueryClient();
  const [fecha, setFecha] = useState<Date | undefined>(new Date());
  const [estado, setEstado] = useState<EstadoDerivacion>(derivacion.estado);
  const [descripcion, setDescripcion] = useState("");

  // Formulario limpio cada vez que se abre
  useEffect(() => {
    if (!open) return;
    setFecha(new Date());
    setEstado(derivacion.estado);
    setDescripcion("");
  }, [open, derivacion.estado]);

  // Los errores del backend los muestra con toast.error el interceptor de axios
  const mutation = useMutation({
    mutationFn: () =>
      derivacionService.registrarNovedad(derivacion.id, {
        fecha: format(fecha!, "yyyy-MM-dd"),
        descripcion: descripcion.trim(),
        estado,
      }),
    onSuccess: () => {
      toast.success("Novedad registrada");
      // Refresca la pestaña del estudiante y la vista general
      queryClient.invalidateQueries({ queryKey: ["derivaciones"] });
      onOpenChange(false);
    },
  });

  const canSave = !!fecha && descripcion.trim().length > 0 && !mutation.isPending;
  const fechaDerivacion = startOfDay(parseFecha(derivacion.fecha));
  // Las novedades llegan en orden cronológico: la última define el estado actual
  const ultimaNovedad = derivacion.novedades[derivacion.novedades.length - 1];
  const anteriorAUltima =
    !!fecha && !!ultimaNovedad && isBefore(startOfDay(fecha), startOfDay(parseFecha(ultimaNovedad.fecha)));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar novedad</DialogTitle>
          <DialogDescription>
            Derivación a <strong>{derivacion.destinoNombre}</strong>. Las novedades no se pueden editar ni eliminar después de guardarlas.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Fecha *</Label>
              <DateField
                value={fecha}
                onChange={setFecha}
                disabled={(d) =>
                  isAfter(startOfDay(d), startOfDay(new Date())) || isBefore(startOfDay(d), fechaDerivacion)
                }
              />
              {anteriorAUltima && (
                <p className="flex items-start gap-1.5 text-sm text-amber-700 dark:text-amber-400">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  Esta fecha es anterior a la última novedad; el estado actual de la derivación no cambiará.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="novedad-estado">Estado *</Label>
              <Select value={estado} onValueChange={(v) => setEstado(v as EstadoDerivacion)}>
                <SelectTrigger id="novedad-estado">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS_DERIVACION.map((e) => (
                    <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="novedad-descripcion">Descripción *</Label>
            <Textarea
              id="novedad-descripcion"
              rows={5}
              maxLength={MAX_DESCRIPCION}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Qué pasó con la derivación"
            />
            <p className="text-xs text-muted-foreground text-right">{descripcion.length}/{MAX_DESCRIPCION}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => mutation.mutate()} disabled={!canSave}>
            {mutation.isPending ? "Guardando..." : "Registrar novedad"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
