import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_LABELS, type Role } from "@/lib/roles";
import {
  adminUserService,
  type AdminUser,
  type UpdateAdminUserPayload,
} from "@/services/adminUserService";

const ROLES_PERSONAL: Role[] = ["ORIENTADOR", "COORDINADOR_BIENESTAR", "ADMINISTRADOR"];

const schema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  lastName: z.string().trim().min(1, "El apellido es obligatorio"),
  email: z
    .string()
    .trim()
    .min(1, "El correo institucional es obligatorio")
    .email("Debe ser un correo válido"),
  role: z.string(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  user: AdminUser | null;
  // true si la fila es la cuenta del administrador que tiene la sesión
  isSelf: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAdminUserDialog({ user, isSelf, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const isEstudiante = user?.type === "ESTUDIANTE";

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        lastName: user.lastName,
        email: user.email ?? "",
        role: user.role,
      });
    }
  }, [user, reset]);

  // El interceptor de axios ya muestra el toast de error.
  const mutation = useMutation({
    mutationFn: (payload: UpdateAdminUserPayload) =>
      adminUserService.update(user!.type, user!.id, payload),
    onSuccess: () => {
      toast.success("Usuario actualizado");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      onOpenChange(false);
    },
  });

  const onSubmit = (values: FormData) => {
    if (!user) return;
    const payload: UpdateAdminUserPayload = {
      name: values.name,
      lastName: values.lastName,
      // En la propia cuenta el correo y el rol no se pueden cambiar.
      email: isSelf ? user.email : values.email,
    };
    // El rol de un estudiante no se envía (siempre es Estudiante).
    if (!isEstudiante) payload.role = isSelf ? user.role : (values.role as Role);
    mutation.mutate(payload);
  };

  return (
    <Dialog open={user !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
          <DialogDescription>
            {isSelf
              ? "Estás editando tu propia cuenta: el correo y el rol no se pueden cambiar."
              : "Actualiza los datos de la cuenta."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-user-name">Nombre</Label>
              <Input id="edit-user-name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-user-lastName">Apellido</Label>
              <Input id="edit-user-lastName" {...register("lastName")} />
              {errors.lastName && (
                <p className="text-xs text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-user-email">Correo</Label>
            <Input id="edit-user-email" type="email" disabled={isSelf} {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-user-role">Rol</Label>
            {isEstudiante ? (
              <Select value="ESTUDIANTE" disabled>
                <SelectTrigger id="edit-user-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ESTUDIANTE">{ROLE_LABELS.ESTUDIANTE}</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={isSelf}>
                    <SelectTrigger id="edit-user-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES_PERSONAL.map((role) => (
                        <SelectItem key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
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
              Guardar cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
