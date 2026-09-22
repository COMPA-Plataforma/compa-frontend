import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patientService } from "@/services/patientService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AxiosError } from "axios";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professionalId: number;
}

const initialForm = {
  name: "",
  lastName: "",
  email: "",
  identityDocument: "",
  documentType: "CEDULA",
  phoneNumber: "",
};

export function CreatePatientAccountDialog({ open, onOpenChange, professionalId }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialForm);

  const mutation = useMutation({
    mutationFn: () => patientService.createAccount(professionalId, form),
    onSuccess: () => {
      toast.success("Cuenta creada. Se enviaron las credenciales al paciente.");
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["patientsByProfessional", professionalId] });
      setForm(initialForm);
      onOpenChange(false);
    },
    onError: (err: AxiosError<{ message?: string; error?: string }>) => {
      const status = err?.response?.status;
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (status === 409 ? "El email ya está registrado." : "No se pudo crear la cuenta.");
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.name.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.identityDocument.trim()
    ) {
      toast.error("Completa todos los campos obligatorios.");
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) setForm(initialForm); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo Paciente</DialogTitle>
          <DialogDescription>
            El paciente recibirá un email con sus credenciales de acceso temporales
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="account-name">Nombre *</Label>
              <Input
                id="account-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="María"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-lastName">Apellido *</Label>
              <Input
                id="account-lastName"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                placeholder="González"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="account-documentType">Tipo de documento *</Label>
              <Select
                value={form.documentType}
                onValueChange={(v) => setForm({ ...form, documentType: v })}
              >
                <SelectTrigger id="account-documentType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CEDULA">Cédula</SelectItem>
                  <SelectItem value="TARJETA_DE_IDENTIDAD">Tarjeta de Identidad</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-document">Número de documento *</Label>
              <Input
                id="account-document"
                value={form.identityDocument}
                onChange={(e) => setForm({ ...form, identityDocument: e.target.value })}
                placeholder="1234567890"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-phone">Teléfono</Label>
            <Input
              id="account-phone"
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              placeholder="3001234567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-email">Email *</Label>
            <Input
              id="account-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="paciente@correo.com"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear y enviar credenciales
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}