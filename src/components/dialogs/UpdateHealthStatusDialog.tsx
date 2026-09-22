import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clinicalInfoService } from "@/services/clinicalInfoService";
import { toast } from "sonner";
import type { HealthStatus } from "@/types";

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
}

export function UpdateHealthStatusDialog({ open, onOpenChange, estudianteId }: Props) {
  const queryClient = useQueryClient();
  const [healthStatus, setHealthStatus] = useState<HealthStatus | "">("");
  const [reason, setReason] = useState("");

  const mutation = useMutation({
    mutationFn: () => clinicalInfoService.updateHealthStatus(estudianteId, { healthStatus: healthStatus as HealthStatus, reason }),
    onSuccess: () => {
      toast.success("Estado de salud actualizado");
      queryClient.invalidateQueries({ queryKey: ["clinicalInfo", estudianteId] });
      queryClient.invalidateQueries({ queryKey: ["estudiante", estudianteId] });
      queryClient.invalidateQueries({ queryKey: ["healthHistory", estudianteId] });
      onOpenChange(false);
      setHealthStatus("");
      setReason("");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Actualizar Estado de Salud</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Nuevo Estado</Label>
            <Select value={healthStatus} onValueChange={(v) => setHealthStatus(v as HealthStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                {healthStatuses.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Razón del cambio</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Describa la razón..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !healthStatus || !reason}>
            {mutation.isPending ? "Actualizando..." : "Actualizar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
