import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { estudianteService } from "@/services/estudianteService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { CreateEstudianteAccountDialog } from "@/components/dialogs/CreateEstudianteAccountDialog";
import { EditContactDialog } from "@/components/dialogs/EditContactDialog";
import { DeactivateEstudianteDialog } from "@/components/dialogs/DeactivateEstudianteDialog";
import { Search, Eye, Pencil, UserMinus, Loader2, UserPlus } from "lucide-react";
import type { EstudianteListDTO } from "@/types";
import { authService } from "@/services/authService";

export default function EstudianteListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [createAccountOpen, setCreateAccountOpen] = useState(false);
  const [editContact, setEditContact] = useState<{ open: boolean; estudiante: EstudianteListDTO | null }>({ open: false, estudiante: null });
  const [deactivate, setDeactivate] = useState<{ open: boolean; estudianteId: number | null }>({ open: false, estudianteId: null });

  const currentUser = authService.getCurrentUser();
  const orientadorId = currentUser?.id ?? 0;

  const { data: estudiantes = [], isLoading } = useQuery({
    queryKey: ["estudiantes", "list", search, statusFilter],
    queryFn: () => estudianteService.listActive(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Estudiantes</h2>
          <p className="text-muted-foreground">Gestión de estudiantes activos</p>
        </div>
        <Button onClick={() => setCreateAccountOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" /> Nuevo Estudiante
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, documento, condición..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === "ALL" ? "" : v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="ACTIVO">Activo</SelectItem>
            <SelectItem value="INACTIVO">Inactivo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estudiantes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No se encontraron estudiantes
                  </TableCell>
                </TableRow>
              ) : (
                estudiantes.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name} {p.lastName}</TableCell>
                    <TableCell>{p.identityDocument}</TableCell>
                    <TableCell>{p.email}</TableCell>
                    <TableCell>{p.phoneNumber}</TableCell>
                    <TableCell><StatusBadge status={p.status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/estudiantes/${p.id}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setEditContact({ open: true, estudiante: p })}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {p.status === "ACTIVO" && (
                          <Button variant="ghost" size="icon" onClick={() => setDeactivate({ open: true, estudianteId: p.id })}>
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <CreateEstudianteAccountDialog
        open={createAccountOpen}
        onOpenChange={setCreateAccountOpen}
        orientadorId={orientadorId}
      />
      <EditContactDialog
        open={editContact.open}
        onOpenChange={(open) => setEditContact({ ...editContact, open })}
        estudianteId={editContact.estudiante?.id ?? null}
        currentEmail={editContact.estudiante?.email ?? ""}
        currentPhone={editContact.estudiante?.phoneNumber ?? ""}
      />
      <DeactivateEstudianteDialog
        open={deactivate.open}
        onOpenChange={(open) => setDeactivate({ ...deactivate, open })}
        estudianteId={deactivate.estudianteId}
      />
    </div>
  );
}