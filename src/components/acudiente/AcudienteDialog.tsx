import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { guardianService } from "@/services/guardianService";
import type { Guardian } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estudianteId: number;
  existing: Guardian | null;
}

const vacio = {
  name: "",
  lastName: "",
  identityDocument: "",
  relationship: "",
  email: "",
  phoneNumber: "",
};

// Registra o corrige el acudiente (representante legal) de un estudiante menor de edad
export function AcudienteDialog({ open, onOpenChange, estudianteId, existing }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(vacio);

  // Al abrir, carga los datos que ya existen (si los hay)
  useEffect(() => {
    if (!open) return;
    setForm(
      existing
        ? {
            name: existing.name,
            lastName: existing.lastName,
            identityDocument: existing.identityDocument,
            relationship: existing.relationship,
            email: existing.email ?? "",
            phoneNumber: existing.phoneNumber ?? "",
          }
        : vacio,
    );
  }, [open, existing]);

  const mutation = useMutation({
    mutationFn: () =>
      guardianService.save(estudianteId, {
        name: form.name.trim(),
        lastName: form.lastName.trim(),
        documentType: "CEDULA",
        identityDocument: form.identityDocument.trim(),
        relationship: form.relationship.trim(),
        email: form.email.trim() || undefined,
        phoneNumber: form.phoneNumber.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Acudiente guardado.");
      queryClient.invalidateQueries({ queryKey: ["acudiente", estudianteId] });
      onOpenChange(false);
    },
    onError: (err: AxiosError<{ message?: string; error?: string }>) => {
      toast.error(err?.response?.data?.message || err?.response?.data?.error || "No se pudo guardar el acudiente.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.name.trim() ||
      !form.lastName.trim() ||
      !form.identityDocument.trim() ||
      !form.relationship.trim()
    ) {
      toast.error("Completa los datos del acudiente.");
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existing ? "Editar acudiente" : "Registrar acudiente"}</DialogTitle>
          <DialogDescription>
            Representante legal del estudiante menor de edad. Sus datos se usan para llenar el documento de autorización.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ac-name">Nombre *</Label>
              <Input id="ac-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ac-lastName">Apellido *</Label>
              <Input id="ac-lastName" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ac-document">Cédula *</Label>
              <Input id="ac-document" value={form.identityDocument} onChange={(e) => setForm({ ...form, identityDocument: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ac-relationship">Parentesco *</Label>
              <Input
                id="ac-relationship"
                value={form.relationship}
                onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                placeholder="Madre, padre, tutor legal"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ac-phone">Teléfono</Label>
              <Input id="ac-phone" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ac-email">Email</Label>
              <Input id="ac-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}