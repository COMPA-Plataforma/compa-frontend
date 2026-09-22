import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clinicalInfoService } from "@/services/clinicalInfoService";
import { toast } from "sonner";
import type { ClinicalInfo, HealthStatus } from "@/types";

const healthStatuses: { value: HealthStatus; label: string }[] = [
  { value: "CRITICO", label: "Crítico" },
  { value: "ESTABLE", label: "Estable" },
  { value: "EN_OBSERVACION", label: "En observación" },
  { value: "LEVE", label: "Leve" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estudianteId: number;
  existing: ClinicalInfo | null;
}

export function ClinicalInfoDialog({ open, onOpenChange, estudianteId, existing }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    mainCondition: "",
    secondaryConditions: "",
    healthStatus: "ESTABLE" as HealthStatus,
    justification: "",
  });

  useEffect(() => {
    if (existing) {
      setForm({
        mainCondition: existing.mainCondition,
        secondaryConditions: existing.secondaryConditions,
        healthStatus: existing.healthStatus,
        justification: existing.justification || "",
      });
    } else {
      setForm({ 
        mainCondition: "", 
        secondaryConditions: "", 
        healthStatus: "ESTABLE",
        justification: "",
      });
    }
  }, [existing, open]);

  const mutation = useMutation({
    mutationFn: () =>
      existing
        ? clinicalInfoService.update(estudianteId, form)
        : clinicalInfoService.register(estudianteId, form),
    onSuccess: () => {
      toast.success(existing ? "Info clínica actualizada" : "Info clínica registrada");
      queryClient.invalidateQueries({ queryKey: ["clinicalInfo", estudianteId] });
      queryClient.invalidateQueries({ queryKey: ["estudiante", estudianteId] });
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existing ? "Editar" : "Registrar"} Información Clínica</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Condición Principal</Label>
            <Input 
              value={form.mainCondition} 
              onChange={(e) => setForm({ ...form, mainCondition: e.target.value })} 
            />
          </div>
          <div className="space-y-2">
            <Label>Condiciones Secundarias</Label>
            <Input 
              value={form.secondaryConditions} 
              onChange={(e) => setForm({ ...form, secondaryConditions: e.target.value })} 
            />
          </div>
          <div className="space-y-2">
            <Label>Justificación</Label>
            <Input 
              value={form.justification} 
              onChange={(e) => setForm({ ...form, justification: e.target.value })}
              placeholder="Justificación del diagnóstico"
            />
          </div>
          <div className="space-y-2">
            <Label>Estado de Salud</Label>
            <Select 
              value={form.healthStatus} 
              onValueChange={(v) => setForm({ ...form, healthStatus: v as HealthStatus })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {healthStatuses.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}