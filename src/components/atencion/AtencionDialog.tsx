import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { atencionService } from "@/services/atencionService";
import type { Atencion } from "@/types";

const MAX_ANAMNESIS = 5000;
const MAX_OTRO = 200;
const MAX_IMPRESION = 300;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estudianteId: number;
  existing: Atencion | null;
}

export function AtencionDialog({ open, onOpenChange, estudianteId, existing }: Props) {
  const queryClient = useQueryClient();
  const [anamnesis, setAnamnesis] = useState("");
  const [motivos, setMotivos] = useState<string[]>([]);
  const [motivoOtro, setMotivoOtro] = useState("");
  const [impresion, setImpresion] = useState("");

  const { data: catalogo = [] } = useQuery({
    queryKey: ["atencionMotivos"],
    queryFn: () => atencionService.motivos(),
    enabled: open,
    staleTime: Infinity,
  });

  // Cargar los valores actuales al abrir
  useEffect(() => {
    if (!open) return;
    setAnamnesis(existing?.anamnesis ?? "");
    setMotivos(existing?.motivos.map((m) => m.codigo) ?? []);
    setMotivoOtro(existing?.motivoOtro ?? "");
    setImpresion(existing?.impresionDiagnostica ?? "");
  }, [open, existing]);

  // ¿Hay cambios respecto a lo guardado? (el backend rechaza guardar sin cambios)
  const dirty = useMemo(() => {
    if (!existing) return true;
    const antes = [...existing.motivos.map((m) => m.codigo)].sort().join(",");
    const ahora = [...motivos].sort().join(",");
    return (
      anamnesis.trim() !== existing.anamnesis ||
      antes !== ahora ||
      motivoOtro.trim() !== (existing.motivoOtro ?? "") ||
      impresion.trim() !== (existing.impresionDiagnostica ?? "")
    );
  }, [existing, anamnesis, motivos, motivoOtro, impresion]);

  const toggleMotivo = (codigo: string, checked: boolean) =>
    setMotivos((prev) => (checked ? [...prev, codigo] : prev.filter((c) => c !== codigo)));

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        anamnesis: anamnesis.trim(),
        motivos,
        motivoOtro: motivoOtro.trim(),
        impresionDiagnostica: impresion.trim(),
      };
      return existing
        ? atencionService.update(estudianteId, payload)
        : atencionService.register(estudianteId, payload);
    },
    onSuccess: () => {
      toast.success(existing ? "Atención actualizada" : "Atención registrada");
      queryClient.invalidateQueries({ queryKey: ["atencion", estudianteId] });
      queryClient.invalidateQueries({ queryKey: ["atencionHistorial", estudianteId] });
      onOpenChange(false);
    },
  });

  const canSave = anamnesis.trim().length > 0 && dirty && !mutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existing ? "Actualizar" : "Registrar"} atención</DialogTitle>
          <DialogDescription>
            {existing
              ? "Puedes completar o corregir la atención en cualquier sesión. Cada cambio queda en el historial con fecha y autor."
              : "Al registrar la primera atención, el estudiante queda asignado a ti."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          <div className="space-y-2">
            <Label htmlFor="anamnesis">Anamnesis</Label>
            <Textarea
              id="anamnesis"
              rows={7}
              maxLength={MAX_ANAMNESIS}
              value={anamnesis}
              onChange={(e) => setAnamnesis(e.target.value)}
              placeholder="Datos de la anamnesis del estudiante"
            />
            <p className="text-xs text-muted-foreground text-right">{anamnesis.length}/{MAX_ANAMNESIS}</p>
          </div>

          <div className="space-y-2">
            <Label>Motivos de consulta</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {catalogo.map((m) => (
                <label key={m.codigo} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={motivos.includes(m.codigo)}
                    onCheckedChange={(c) => toggleMotivo(m.codigo, c === true)}
                  />
                  {m.nombre}
                </label>
              ))}
            </div>
            <div className="space-y-1 pt-1">
              <Label htmlFor="motivoOtro" className="text-sm">Otro</Label>
              <Input
                id="motivoOtro"
                maxLength={MAX_OTRO}
                value={motivoOtro}
                onChange={(e) => setMotivoOtro(e.target.value)}
                placeholder="Otro motivo (opcional)"
              />
            </div>
            <p className="text-xs text-muted-foreground">Puedes dejar los motivos en blanco.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="impresion">Impresión diagnóstica <span className="text-muted-foreground font-normal">(opcional)</span></Label>
            <Textarea
              id="impresion"
              rows={2}
              maxLength={MAX_IMPRESION}
              value={impresion}
              onChange={(e) => setImpresion(e.target.value)}
              placeholder="Resumen breve"
            />
            <p className="text-xs text-muted-foreground text-right">{impresion.length}/{MAX_IMPRESION}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => mutation.mutate()} disabled={!canSave}>
            {mutation.isPending ? "Guardando..." : existing ? "Guardar cambios" : "Registrar atención"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}