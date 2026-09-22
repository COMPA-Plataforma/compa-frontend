import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { estudianteService } from "@/services/estudianteService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { ReactivateEstudianteDialog } from "@/components/dialogs/ReactivateEstudianteDialog";
import { Eye, UserCheck, Loader2 } from "lucide-react";
import { format } from "date-fns";

const reasonLabels: Record<string, string> = {
  ALTA_MEDICA: "Alta médica",
  ABANDONO_PERDIDA_SEGUIMIENTO: "Abandono / Pérdida de seguimiento",
};

export default function InactiveEstudiantesPage() {
  const navigate = useNavigate();
  const [reactivate, setReactivate] = useState<{ open: boolean; estudianteId: number | null }>({ open: false, estudianteId: null });

  const { data: estudiantes = [], isLoading } = useQuery({
    queryKey: ["estudiantes", "inactive"],
    queryFn: () => estudianteService.listInactive(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Estudiantes Inactivos</h2>
        <p className="text-muted-foreground">Estudiantes que han sido desactivados</p>
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
                <TableHead>Estado</TableHead>
                <TableHead>Razón</TableHead>
                <TableHead>Fecha desactivación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estudiantes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No hay estudiantes inactivos
                  </TableCell>
                </TableRow>
              ) : (
                estudiantes.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name} {p.lastName}</TableCell>
                    <TableCell>{p.identityDocument}</TableCell>
                    <TableCell>{p.email}</TableCell>
                    <TableCell><StatusBadge status={p.status} /></TableCell>
                    <TableCell>{p.deactivationReason ? reasonLabels[p.deactivationReason] || p.deactivationReason : "-"}</TableCell>
                    <TableCell>{p.deactivatedAt ? format(new Date(p.deactivatedAt), "dd/MM/yyyy") : "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/estudiantes/${p.id}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setReactivate({ open: true, estudianteId: p.id })}>
                          <UserCheck className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <ReactivateEstudianteDialog
        open={reactivate.open}
        onOpenChange={(open) => setReactivate({ ...reactivate, open })}
        estudianteId={reactivate.estudianteId}
      />
    </div>
  );
}
