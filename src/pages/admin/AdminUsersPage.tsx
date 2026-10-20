import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Search, UserCheck, UserX, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CreateAdminUserDialog } from "@/components/dialogs/CreateAdminUserDialog";
import { EditAdminUserDialog } from "@/components/dialogs/EditAdminUserDialog";
import { ROLE_LABELS, type Role } from "@/lib/roles";
import { authService } from "@/services/authService";
import {
  adminUserService,
  type AdminUser,
  type AdminUserFilters,
  type AdminUserType,
} from "@/services/adminUserService";

// Valor de los Select para "sin filtro" (Radix no admite value="").
const TODOS = "TODOS";

function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function EstadoBadge({ user }: { user: AdminUser }) {
  if (user.status === "PENDING") {
    return (
      <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-950">
        Pendiente de confirmar correo
      </Badge>
    );
  }
  return user.active ? (
    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-950">
      Activo
    </Badge>
  ) : (
    <Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted">
      Desactivado
    </Badge>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const currentEmail = authService.getCurrentUser()?.email?.toLowerCase() ?? null;
  const isSelf = (user: AdminUser) =>
    !!currentEmail && user.email?.toLowerCase() === currentEmail;

  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>(TODOS);
  const [role, setRole] = useState<string>(TODOS);
  const [estado, setEstado] = useState<string>(TODOS);
  const debouncedSearch = useDebouncedValue(search.trim());

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [toDeactivate, setToDeactivate] = useState<AdminUser | null>(null);

  const filters: AdminUserFilters = {
    type: type === TODOS ? undefined : (type as AdminUserType),
    role: role === TODOS ? undefined : (role as Role),
    active: estado === TODOS ? undefined : estado === "ACTIVOS",
    search: debouncedSearch || undefined,
  };

  const { data: users = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-users", filters],
    queryFn: () => adminUserService.list(filters),
    retry: false,
  });

  const hayFiltros = !!filters.type || !!filters.role || filters.active !== undefined || !!filters.search;

  // El interceptor de axios ya muestra el toast de error.
  const deactivateMutation = useMutation({
    mutationFn: (user: AdminUser) => adminUserService.deactivate(user.type, user.id),
    onSuccess: () => {
      toast.success("Usuario desactivado");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onSettled: () => setToDeactivate(null),
  });

  const reactivateMutation = useMutation({
    mutationFn: (user: AdminUser) => adminUserService.reactivate(user.type, user.id),
    onSuccess: () => {
      toast.success("Usuario reactivado");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const rowKey = (u: AdminUser) => `${u.type}-${u.id}`;
  const reactivandoKey =
    reactivateMutation.isPending && reactivateMutation.variables
      ? rowKey(reactivateMutation.variables)
      : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Usuarios y roles</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Los estudiantes se crean desde el panel del psicoorientador; aquí puedes consultarlos,
            editarlos y desactivarlos.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Crear usuario
        </Button>
      </div>

      {/* Filtros */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, apellido o correo"
            aria-label="Buscar usuarios"
            className="pl-9"
          />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger aria-label="Tipo">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todos los tipos</SelectItem>
            <SelectItem value="PERSONAL">Personal</SelectItem>
            <SelectItem value="ESTUDIANTE">Estudiantes</SelectItem>
          </SelectContent>
        </Select>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger aria-label="Rol">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todos los roles</SelectItem>
            {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
              <SelectItem key={r} value={r}>
                {ROLE_LABELS[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={estado} onValueChange={setEstado}>
          <SelectTrigger aria-label="Estado">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todos los estados</SelectItem>
            <SelectItem value="ACTIVOS">Activos</SelectItem>
            <SelectItem value="DESACTIVADOS">Desactivados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <TableSkeleton />
          ) : isError ? (
            <div className="py-12 text-center space-y-3">
              <p className="text-sm text-muted-foreground">No pudimos cargar los usuarios.</p>
              <Button variant="outline" onClick={() => refetch()}>
                Reintentar
              </Button>
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Users className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">
                {hayFiltros
                  ? "No encontramos usuarios con estos filtros. Prueba con otra búsqueda."
                  : "Todavía no hay usuarios registrados."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre completo</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const propia = isSelf(user);
                  return (
                    <TableRow key={rowKey(user)}>
                      <TableCell className="font-medium">
                        {user.name} {user.lastName}
                        {propia && (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">(tú)</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{ROLE_LABELS[user.role] ?? user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <EstadoBadge user={user} />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => setEditing(user)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Editar
                          </Button>
                          {user.active ? (
                            propia ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  {/* span: un botón deshabilitado no dispara el tooltip */}
                                  <span tabIndex={0}>
                                    <Button variant="ghost" size="sm" className="gap-1.5" disabled>
                                      <UserX className="h-3.5 w-3.5" />
                                      Desactivar
                                    </Button>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>No puedes desactivar tu propia cuenta</TooltipContent>
                              </Tooltip>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1.5"
                                onClick={() => setToDeactivate(user)}
                              >
                                <UserX className="h-3.5 w-3.5" />
                                Desactivar
                              </Button>
                            )
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1.5"
                              disabled={reactivandoKey === rowKey(user)}
                              onClick={() => reactivateMutation.mutate(user)}
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                              Reactivar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateAdminUserDialog open={createOpen} onOpenChange={setCreateOpen} />

      <EditAdminUserDialog
        user={editing}
        isSelf={editing ? isSelf(editing) : false}
        onOpenChange={(open) => !open && setEditing(null)}
      />

      <AlertDialog
        open={toDeactivate !== null}
        onOpenChange={(open) => !open && !deactivateMutation.isPending && setToDeactivate(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Desactivar a {toDeactivate?.name} {toDeactivate?.lastName}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              El usuario no podrá iniciar sesión. No se elimina su información.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deactivateMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={deactivateMutation.isPending}
              onClick={(e) => {
                // Se cierra al terminar la petición, no al hacer clic.
                e.preventDefault();
                if (toDeactivate) deactivateMutation.mutate(toDeactivate);
              }}
            >
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
