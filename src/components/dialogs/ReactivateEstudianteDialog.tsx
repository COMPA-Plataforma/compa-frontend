import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patientService } from "@/services/patientService";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: number | null;
}

export function ReactivatePatientDialog({ open, onOpenChange, patientId }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", lastName: "", email: "", phoneNumber: "" });

  const mutation = useMutation({
    mutationFn: () => {
      const data: Record<string, string> = {};
      if (form.name) data.name = form.name;
      if (form.lastName) data.lastName = form.lastName;
      if (form.email) data.email = form.email;
      if (form.phoneNumber) data.phoneNumber = form.phoneNumber;
      return patientService.reactivate(patientId!, Object.keys(data).length ? data : undefined);
    },
    onSuccess: () => {
      toast.success("Paciente reactivado");
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      onOpenChange(false);
      setForm({ name: "", lastName: "", email: "", phoneNumber: "" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reactivar Paciente</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Opcionalmente actualice los datos del paciente.</p>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input placeholder="Dejar vacío para no cambiar" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Apellido</Label>
              <Input placeholder="Dejar vacío para no cambiar" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input placeholder="Dejar vacío para no cambiar" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Teléfono</Label>
            <Input placeholder="Dejar vacío para no cambiar" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? "Reactivando..." : "Reactivar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
