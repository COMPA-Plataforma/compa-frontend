import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isAfter, startOfDay } from "date-fns";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { DateField } from "@/components/dialogs/ActivityFields";
import { seguimientoService } from "@/services/seguimientoService";
import { MARCAS, MARCAS_ASISTENCIA, MARCAS_PROCESO, MAX_REGISTRO, type MarcaSeguimiento } from "@/lib/seguimientos";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estudianteId: number;
}

type Marcas = Record<MarcaSeguimiento, boolean>;
const marcasVacias = (): Marcas =>
  Object.fromEntries(MARCAS.map((m) => [m.key, false])) as Marcas;

// Registra un seguimiento de sesión: fecha, casillas de asistencia y proceso, y el registro de lo trabajado
export function SeguimientoDialog({ open, onOpenChange, estudianteId }: Props) {
  const queryClient = useQueryClient();
  const [fecha, setFecha] = useState<Date | undefined>(new Date());
  const [marcas, setMarcas] = useState<Marcas>(marcasVacias());
  const [descripcion, setDescripcion] = useState("");

  // Formulario limpio cada vez que se abre
  useEffect(() => {
    if (!open) return;
    setFecha(new Date());
    setMarcas(marcasVacias());
    setDescripcion("");
  }, [open]);

  const mutation = useMutation({
    mutationFn: () =>
      seguimientoService.create(estudianteId, {
        fecha: format(fecha!, "yyyy-MM-dd"),
        descripcion: descripcion.trim(),
        ...marcas,
      }),
    onSuccess: () => {
      toast.success("Seguimiento registrado");
      queryClient.invalidateQueries({ queryKey: ["seguimientos", estudianteId] });
      onOpenChange(false);
    },
  });

  const canSave = !!fecha && descripcion.trim().length > 0 && !mutation.isPending;

  const casilla = (m: { key: MarcaSeguimiento; label: string }) => (
    <label key={m.key} className="flex items-center gap-2 text-sm cursor-pointer">
      <Checkbox
        checked={marcas[m.key]}
        onCheckedChange={(c) => setMarcas((prev) => ({ ...prev, [m.key]: c === true }))}
      />
      {m.label}
    </label>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar seguimiento</DialogTitle>
          <DialogDescription>
            Queda con la fecha de la sesión y con tu nombre. No reemplaza los seguimientos anteriores.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          <div className="space-y-2 sm:max-w-[16rem]">
            <Label>Fecha *</Label>
            <DateField
              value={fecha}
              onChange={setFecha}
              disabled={(d) => isAfter(startOfDay(d), startOfDay(new Date()))}
            />
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{MARCAS_ASISTENCIA.map(casilla)}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{MARCAS_PROCESO.map(casilla)}</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seguimiento-registro">Registro *</Label>
            <Textarea
              id="seguimiento-registro"
              rows={7}
              maxLength={MAX_REGISTRO}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Qué se trabajó en la sesión"
            />
            <p className="text-xs text-muted-foreground text-right">{descripcion.length}/{MAX_REGISTRO}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => mutation.mutate()} disabled={!canSave}>
            {mutation.isPending ? "Guardando..." : "Registrar seguimiento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}