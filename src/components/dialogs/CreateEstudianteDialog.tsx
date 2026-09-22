import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patientService, type CreatePatientPayload } from "@/services/patientService";
import { toast } from "sonner";
import type { DocumentType } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialForm = {
  name: "",
  lastName: "",
  documentType: "CEDULA" as DocumentType,
  identityDocument: "",
  email: "",
  phoneNumber: "",
};

const initialGuardian = {
  name: "",
  lastName: "",
  documentType: "CEDULA" as DocumentType,
  identityDocument: "",
  relationship: "",
  email: "",
  phoneNumber: "",
};

export function CreatePatientDialog({ open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialForm);
  const [guardian, setGuardian] = useState(initialGuardian);

  const needsGuardian = form.documentType === "TARJETA_DE_IDENTIDAD";

  const mutation = useMutation({
    mutationFn: () => {
      const payload: CreatePatientPayload = {
        ...form,
        ...(needsGuardian ? { guardian } : {}),
      };
      return patientService.create(payload);
    },
    onSuccess: () => {
      toast.success("Paciente creado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      onOpenChange(false);
      setForm(initialForm);
      setGuardian(initialGuardian);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo Paciente</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Patient fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Apellido</Label>
              <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Documento</Label>
              <Select
                value={form.documentType}
                onValueChange={(v) => setForm({ ...form, documentType: v as DocumentType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CEDULA">Cédula</SelectItem>
                  <SelectItem value="TARJETA_DE_IDENTIDAD">Tarjeta de Identidad</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Documento de Identidad</Label>
              <Input value={form.identityDocument} onChange={(e) => setForm({ ...form, identityDocument: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
            </div>
          </div>

          {/* Guardian fields */}
          {needsGuardian && (
            <>
              <div className="mt-2 border-t pt-4">
                <h3 className="text-base font-semibold text-foreground mb-3">Datos del Acudiente</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input value={guardian.name} onChange={(e) => setGuardian({ ...guardian, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Apellido</Label>
                  <Input value={guardian.lastName} onChange={(e) => setGuardian({ ...guardian, lastName: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Documento</Label>
                  <Select
                    value={guardian.documentType}
                    onValueChange={(v) => setGuardian({ ...guardian, documentType: v as DocumentType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CEDULA">Cédula</SelectItem>
                      <SelectItem value="TARJETA_DE_IDENTIDAD">Tarjeta de Identidad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Documento</Label>
                  <Input value={guardian.identityDocument} onChange={(e) => setGuardian({ ...guardian, identityDocument: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Parentesco</Label>
                <Input value={guardian.relationship} onChange={(e) => setGuardian({ ...guardian, relationship: e.target.value })} placeholder="Ej: Madre, Padre, Tutor" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email (opcional)</Label>
                  <Input type="email" value={guardian.email} onChange={(e) => setGuardian({ ...guardian, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono (opcional)</Label>
                  <Input value={guardian.phoneNumber} onChange={(e) => setGuardian({ ...guardian, phoneNumber: e.target.value })} />
                </div>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? "Creando..." : "Crear Paciente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}