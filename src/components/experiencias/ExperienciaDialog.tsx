import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { experienciaService } from "@/services/experienciaService";
import { MAX_EXPERIENCIA } from "@/lib/experiencias";
import type { Experiencia } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actividades: { id: number; name: string }[];
  // Actividad preseleccionada (cuando se abre desde una tarea)
  actividadId?: number;
  // Si viene, se está corrigiendo esa experiencia (la actividad no cambia)
  experiencia?: Experiencia | null;
}

// Registra una experiencia nueva o corrige una del mismo día
export function ExperienciaDialog({ open, onOpenChange, actividades, actividadId, experiencia }: Props) {
  const queryClient = useQueryClient();
  const corrigiendo = !!experiencia;
  const [actividad, setActividad] = useState<string>("");
  const [texto, setTexto] = useState("");

  // Formulario limpio (o con la experiencia a corregir) cada vez que se abre
  useEffect(() => {
    if (!open) return;
    setActividad(experiencia ? String(experiencia.actividadId) : actividadId ? String(actividadId) : "");
    setTexto(experiencia?.texto ?? "");
  }, [open, experiencia, actividadId]);

  const mutation = useMutation({
    mutationFn: () =>
      corrigiendo
        ? experienciaService.update(experiencia!.id, { texto: texto.trim() })
        : experienciaService.create({ actividadId: Number(actividad), texto: texto.trim() }),
    onSuccess: () => {
      toast.success(corrigiendo ? "Experiencia corregida" : "Experiencia guardada");
      queryClient.invalidateQueries({ queryKey: ["me-experiencias"] });
      onOpenChange(false);
    },
  });

  const canSave = (corrigiendo || actividad !== "") && texto.trim().length > 0 && !mutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{corrigiendo ? "Corregir experiencia" : "Contar mi experiencia"}</DialogTitle>
          <DialogDescription>
            {corrigiendo
              ? "Puedes corregirla hoy, el mismo día en que la escribiste."
              : "Cuéntanos con tus palabras cómo te fue, qué aprendiste o qué dificultades tuviste."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label>Actividad *</Label>
            {corrigiendo ? (
              <p className="text-sm font-medium">{experiencia!.actividadNombre}</p>
            ) : (
              <Select value={actividad} onValueChange={setActividad}>
                <SelectTrigger aria-label="Actividad">
                  <SelectValue placeholder="Elige una actividad de tu plan" />
                </SelectTrigger>
                <SelectContent>
                  {actividades.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="experiencia-texto">Mi experiencia *</Label>
            <Textarea
              id="experiencia-texto"
              rows={6}
              maxLength={MAX_EXPERIENCIA}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="¿Cómo te fue al hacerla?"
            />
            <p className="text-xs text-muted-foreground text-right">{texto.length}/{MAX_EXPERIENCIA}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => mutation.mutate()} disabled={!canSave}>
            {mutation.isPending ? "Guardando..." : corrigiendo ? "Guardar corrección" : "Guardar experiencia"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}