import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { guardianService } from "@/services/guardianService";
import { AcudienteDialog } from "@/components/acudiente/AcudienteDialog";
import { formatFecha } from "@/lib/dates";

// Acudiente (representante legal) de un estudiante menor de edad y la fecha en que autorizó.
// Solo se muestra si el estudiante tiene tarjeta de identidad.
export function AcudienteSection({ estudianteId }: { estudianteId: number }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: acudiente, isLoading } = useQuery({
    queryKey: ["acudiente", estudianteId],
    queryFn: () => guardianService.get(estudianteId),
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const sinAcudiente = !acudiente;
  const sinFecha = !!acudiente && !acudiente.fechaAutorizacion;
  const hayProblema = sinAcudiente || sinFecha;

  return (
    <Card className={hayProblema ? "border-amber-400" : undefined}>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            {hayProblema ? (
              <ShieldAlert className="h-4 w-4 text-amber-600" />
            ) : (
              <ShieldCheck className="h-4 w-4 text-green-600" />
            )}
            Acudiente (menor de edad)
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
            {sinAcudiente ? "Registrar acudiente" : "Editar"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {sinAcudiente ? (
          <p className="text-amber-700">
            Este estudiante es menor de edad y todavía no tiene acudiente registrado. Registra sus datos y la fecha
            en que autorizó el acompañamiento.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
              <p><span className="text-muted-foreground">Nombre: </span>{acudiente.name} {acudiente.lastName}</p>
              <p><span className="text-muted-foreground">Parentesco: </span>{acudiente.relationship}</p>
              <p><span className="text-muted-foreground">Cédula: </span>{acudiente.identityDocument}</p>
              <p><span className="text-muted-foreground">Teléfono: </span>{acudiente.phoneNumber || "—"}</p>
              <p><span className="text-muted-foreground">Email: </span>{acudiente.email || "—"}</p>
            </div>
            {sinFecha ? (
              <p className="text-amber-700">Falta registrar la fecha en que el acudiente autorizó el acompañamiento.</p>
            ) : (
              <p className="font-medium text-green-700">
                Autorización del representante legal registrada el {formatFecha(acudiente.fechaAutorizacion)}.
              </p>
            )}
          </>
        )}
      </CardContent>

      <AcudienteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        estudianteId={estudianteId}
        existing={acudiente ?? null}
      />
    </Card>
  );
}