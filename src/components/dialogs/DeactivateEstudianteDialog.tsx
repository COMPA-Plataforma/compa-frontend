import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patientService } from "@/services/patientService";
import { toast } from "sonner";
import type { DeactivationReason } from "@/types";

const reasons: { value: DeactivationReason; label: string }[] = [
  { value: "ALTA_MEDICA", label: "Alta médica" },
  { value: "ABANDONO_PERDIDA_SEGUIMIENTO", label: "Abandono / Pérdida de seguimiento" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: number | null;
}

export function DeactivatePatientDialog({ open, onOpenChange, patientId }: Props) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState<DeactivationReason | "">("");

  const mutation = useMutation({
    mutationFn: () => patientService.deactivate(patientId!, reason as string),
    onSuccess: () => {
      toast.success("Paciente desactivado");
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      onOpenChange(false);
      setReason("");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Desactivar Paciente</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-4">
          <Label>Razón de desactivación</Label>
          <Select value={reason} onValueChange={(v) => setReason(v as DeactivationReason)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar razón" />
            </SelectTrigger>
            <SelectContent>
              {reasons.map((r) => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="destructive" onClick={() => mutation.mutate()} disabled={mutation.isPending || !reason}>
            {mutation.isPending ? "Desactivando..." : "Desactivar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
