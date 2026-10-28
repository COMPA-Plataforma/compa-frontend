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
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { estudianteService, type CreateEstudianteAccountPayload } from "@/services/estudianteService";
import { toast } from "sonner";
import { Loader2, ShieldAlert } from "lucide-react";
import { AxiosError } from "axios";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orientadorId: number;
}

const initialForm = {
  name: "",
  lastName: "",
  email: "",
  identityDocument: "",
  documentType: "CEDULA",
  phoneNumber: "",
};

// Datos del acudiente (representante legal). Solo se piden si el estudiante tiene tarjeta de identidad.
const initialAcudiente = {
  name: "",
  lastName: "",
  identityDocument: "",
  relationship: "",
  email: "",
  phoneNumber: "",
  fechaAutorizacion: "",
};

// Fecha de hoy en Colombia (yyyy-MM-dd), para no permitir autorizaciones futuras
const hoyColombia = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });

export function CreateEstudianteAccountDialog({ open, onOpenChange, orientadorId }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialForm);
  const [acudiente, setAcudiente] = useState(initialAcudiente);
  const [confirmaAutorizacion, setConfirmaAutorizacion] = useState(false);

  // Tarjeta de identidad = menor de edad
  const esMenor = form.documentType === "TARJETA_DE_IDENTIDAD";

  const resetAll = () => {
    setForm(initialForm);
    setAcudiente(initialAcudiente);
    setConfirmaAutorizacion(false);
  };

  const buildPayload = (): CreateEstudianteAccountPayload => {
    const base: CreateEstudianteAccountPayload = { ...form };
    if (!esMenor) return base;
    return {
      ...base,
      acudiente: {
        name: acudiente.name.trim(),
        lastName: acudiente.lastName.trim(),
        documentType: "CEDULA",
        identityDocument: acudiente.identityDocument.trim(),
        relationship: acudiente.relationship.trim(),
        email: acudiente.email.trim() || undefined,
        phoneNumber: acudiente.phoneNumber.trim() || undefined,
        fechaAutorizacion: acudiente.fechaAutorizacion,
      },
    };
  };

  const mutation = useMutation({
    mutationFn: () => estudianteService.createAccount(orientadorId, buildPayload()),
    onSuccess: () => {
      toast.success("Cuenta creada. Se enviaron las credenciales al estudiante.");
      queryClient.invalidateQueries({ queryKey: ["estudiantes"] });
      queryClient.invalidateQueries({ queryKey: ["estudiantesByOrientador", orientadorId] });
      resetAll();
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
    if (esMenor) {
      if (
        !acudiente.name.trim() ||
        !acudiente.lastName.trim() ||
        !acudiente.identityDocument.trim() ||
        !acudiente.relationship.trim() ||
        !acudiente.fechaAutorizacion
      ) {
        toast.error("Completa los datos del acudiente y la fecha de su autorización.");
        return;
      }
      if (acudiente.fechaAutorizacion > hoyColombia()) {
        toast.error("La fecha de autorización no puede ser futura.");
        return;
      }
      if (!confirmaAutorizacion) {
        toast.error("Confirma que recibiste la autorización del representante legal.");
        return;
      }
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetAll(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Estudiante</DialogTitle>
          <DialogDescription>
            El estudiante recibirá un email con sus credenciales de acceso temporales
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
              placeholder="estudiante@correo.com"
            />
          </div>

          {esMenor && (
            <div className="space-y-4 rounded-lg border p-4">
              <Alert>
                <ShieldAlert className="h-4 w-4" />
                <AlertDescription>
                  Los estudiantes con tarjeta de identidad son menores de edad. Para acompañarlos
                  necesitamos los datos de su acudiente (representante legal) y la fecha en que
                  autorizó el acompañamiento.
                </AlertDescription>
              </Alert>

              <p className="text-sm font-medium">Datos del acudiente</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="acudiente-name">Nombre *</Label>
                  <Input
                    id="acudiente-name"
                    value={acudiente.name}
                    onChange={(e) => setAcudiente({ ...acudiente, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acudiente-lastName">Apellido *</Label>
                  <Input
                    id="acudiente-lastName"
                    value={acudiente.lastName}
                    onChange={(e) => setAcudiente({ ...acudiente, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="acudiente-document">Cédula *</Label>
                  <Input
                    id="acudiente-document"
                    value={acudiente.identityDocument}
                    onChange={(e) => setAcudiente({ ...acudiente, identityDocument: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acudiente-relationship">Parentesco *</Label>
                  <Input
                    id="acudiente-relationship"
                    value={acudiente.relationship}
                    onChange={(e) => setAcudiente({ ...acudiente, relationship: e.target.value })}
                    placeholder="Madre, padre, tutor legal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="acudiente-phone">Teléfono</Label>
                  <Input
                    id="acudiente-phone"
                    value={acudiente.phoneNumber}
                    onChange={(e) => setAcudiente({ ...acudiente, phoneNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acudiente-email">Email</Label>
                  <Input
                    id="acudiente-email"
                    type="email"
                    value={acudiente.email}
                    onChange={(e) => setAcudiente({ ...acudiente, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="acudiente-fecha">Fecha en que el acudiente autorizó *</Label>
                <Input
                  id="acudiente-fecha"
                  type="date"
                  max={hoyColombia()}
                  value={acudiente.fechaAutorizacion}
                  onChange={(e) => setAcudiente({ ...acudiente, fechaAutorizacion: e.target.value })}
                />
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="acudiente-confirma"
                  checked={confirmaAutorizacion}
                  onCheckedChange={(v) => setConfirmaAutorizacion(v === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="acudiente-confirma" className="text-sm font-normal leading-snug">
                  Confirmo que recibí la autorización del representante legal para el acompañamiento
                  de este estudiante.
                </Label>
              </div>
            </div>
          )}

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